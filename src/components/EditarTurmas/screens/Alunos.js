import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { useTheme } from '../../../path/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import CadastroAlunoModal from '../ModalCadAluno';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GraficoFeedbackTurma from '../../Gerais/GraficoFeedbackTurma';

export default function Alunos() {
    const route = useRoute();
    const { turmaId } = route.params || {};
    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('');
    const { isDarkMode } = useTheme();
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const navigation = useNavigation();
    const [nomeTurma, setNomeTurma] = useState('');
    const [periodoTurma, setPeriodoTurma] = useState('');
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);

    const fetchAlunos = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            if (!turmaId) {
                Alert.alert('Erro', 'ID da turma não fornecido.');
                return;
            }

            const url = `http://10.92.198.51:3000/api/class/students/${turmaId}`;
            console.log("URL da requisição:", url);

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Resposta da API:', response.data);

            // Armazena o nome e período da turma no estado
            setNomeTurma(response.data.nomeTurma || 'Nome não encontrado');
            setPeriodoTurma(response.data.periodoTurma || '');

            const alunosComMedias = response.data.students.map((aluno) => {
                if (aluno.nota && aluno.nota.length > 0) {
                    const totalNotas = aluno.nota.reduce((acc, curr) => acc + curr.valorNota, 0);
                    const media = (totalNotas / aluno.nota.length); // Multiplica por 10 para obter porcentagem
                    return { ...aluno, mediaNota: media.toFixed(2) };
                }
                return { ...aluno, mediaNota: '-' };
            });

            setAlunos(alunosComMedias);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar alunos:', error);
            setError('Erro ao buscar alunos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleBarraClick = (categoria, valor) => {
        if (valor > 0) {
            setBarraSelecionada({
                label: categoria,
                value: valor
            });
            setModalBarraVisible(true);
        }
    };

    const fetchMediasFeedbacks = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get(`http://10.92.198.51:3000/api/class/feedback/${turmaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const { mediaResposta1, mediaResposta2, mediaResposta3, mediaResposta4, mediaResposta5, totalFeedbacks } = response.data;

            setDadosGrafico([
                mediaResposta1,
                mediaResposta2,
                mediaResposta3,
                mediaResposta4,
                mediaResposta5
            ]);
            setTotalFeedbacks(totalFeedbacks);
        } catch (error) {
            console.error('Erro ao buscar feedbacks:', error);
            setDadosGrafico([0, 0, 0, 0, 0]);
            setTotalFeedbacks(0);
        }
    };

    useEffect(() => {
        if (turmaId) {
            fetchAlunos();
            fetchMediasFeedbacks();
        }
    }, [turmaId]);

    const handleCreateAluno = async (alunoData) => {
        try {
            setIsCreating(true);
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            const response = await axios.post('http://10.92.198.51:3000/api/student', alunoData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
                await fetchAlunos();
                setModalCriarVisible(false);
            }
        } catch (error) {
            console.error('Erro ao cadastrar aluno:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Erro ao cadastrar aluno. Tente novamente.');
        } finally {
            setIsCreating(false);
        }
    };

    const filtrarAlunos = (texto) => {
        setFiltro(texto);
        if (texto) {
            const alunosFiltrados = alunos.filter((aluno) =>
                aluno.nomeAluno.toLowerCase().includes(texto.toLowerCase()) ||
                aluno.identifierCode.toString().includes(texto)
            );
            setAlunos(alunosFiltrados);
        } else {
            fetchAlunos();
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <ActivityIndicator size="large" color="#1A85FF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#000', textAlign: 'center' }}>{error}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        fetchAlunos();
                        fetchMediasFeedbacks();
                    }}
                >
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <HeaderSimples
                titulo="ALUNOS"
            />
            <View style={{ padding: 10 }}>
                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>
                        {nomeTurma} - {periodoTurma}
                    </Text>
                    <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>
                        Nº0231000
                    </Text>
                </View>

                <View style={[styles.containerBranco, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? 'white' : 'black' }]}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor={isDarkMode ? '#AAA' : '#756262'}
                            value={filtro}
                            onChangeText={filtrarAlunos}
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2 }]}>Nome do aluno</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Matrícula</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Média (%)</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Perfil</Text>
                    </View>

                    <ScrollView>
                        {alunos.length > 0 ? (
                            alunos.map((aluno) => (
                                <View key={aluno.id} style={styles.tableRow}>
                                    <Text style={[styles.rowText, { flex: 2, color: isDarkMode ? 'white' : 'black' }]}>{aluno.nomeAluno}</Text>
                                    <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{aluno.identifierCode}</Text>
                                    <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{aluno.mediaNota}</Text>
                                    <TouchableOpacity
                                        style={styles.notasButton}
                                        onPress={() => navigation.navigate('PerfilAluno', { alunoId: aluno.id })}
                                    >
                                        <Text style={styles.notasText}>Visualizar</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>
                                Nenhum aluno disponível.
                            </Text>
                        )}
                    </ScrollView>

                    <View style={{ flex: 1, width: '100%', alignItems: 'flex-end', marginTop: 10 }}>
                        <TouchableOpacity
                            style={styles.botaoCriar}
                            onPress={() => setModalCriarVisible(true)}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Icon name="plus" size={24} color="white" />
                            )}
                        </TouchableOpacity>
                        <View style={styles.graficoContainer}>
                            <GraficoFeedbackTurma
                                dadosGrafico={dadosGrafico}
                                totalFeedbacks={totalFeedbacks}
                                onBarraClick={handleBarraClick}
                            />
                        </View>
                        <CadastroAlunoModal
                            visible={modalCriarVisible}
                            onClose={() => setModalCriarVisible(false)}
                            turmaId={turmaId}
                            isCreating={isCreating}
                            onCreate={handleCreateAluno}
                        />
                    </View>
                </View>
            </View>
            <Modal visible={modalBarraVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#1E6BE6' : '#1A85FF' }]}>
                        <Text style={[styles.modalTitle, { color: 'white' }]}>{barraSelecionada.label}</Text>
                        <Text style={[styles.modalText, { color: 'white', fontSize: 24 }]}>
                            {barraSelecionada.value.toFixed(1)}
                        </Text>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: 'white', marginTop: 20 }]}
                            onPress={() => setModalBarraVisible(false)}
                        >
                            <Text style={[styles.buttonText, { color: isDarkMode ? '#1E6BE6' : '#1A85FF' }]}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: '#F0F7FF',
        paddingBottom: 50,
    },
    botaoCriar: {
        padding: 10,
        borderRadius: 10,
        right: 0,
        bottom: 0,
        backgroundColor: '#0077FF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#1A85FF',
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    containerBranco: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginTop: 5,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 40,
    },
    linha: {
        marginTop: -5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    graficoContainer: {
        marginBottom: 20,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        marginBottom: 10,
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1A85FF',
        padding: 10,
        borderRadius: 5,
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    rowText: {
        fontSize: 14,
        textAlign: 'center',
    },
    notasButton: {
        flex: 1,
        alignItems: 'center',
    },
    notasText: {
        color: '#1A85FF',
        fontWeight: 'bold',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#1E6BE6',
        borderRadius: 12,
        width: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem: {
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center'
    },
    cancelButton: {
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
    },
});