import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { useTheme } from '../../../path/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import CadastroAlunoModal from '../ModalCadAluno';
import axios from 'axios';

export default function Alunos() {
    const route = useRoute();
    const { turmaId } = route.params || {}; // Recebe o ID da turma da navegação
    const [alunos, setAlunos] = useState([]); // Estado para armazenar os alunos
    const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
    const [error, setError] = useState(null); // Estado para armazenar erros
    const [filtro, setFiltro] = useState(''); // Estado para o filtro de busca
    const { isDarkMode } = useTheme();
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
    const navigation = useNavigation();

    // Função para buscar os alunos da turma
    const fetchAlunos = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/class/students/${turmaId}`);
            console.log('Resposta da API:', response.data);

            // Adiciona a média das notas ao aluno
            const alunosComMedias = response.data.students.map((aluno) => {
                if (aluno.notas && aluno.notas.length > 0) {
                    const totalNotas = aluno.notas.reduce((acc, curr) => acc + curr.valorNota, 0);
                    const media = totalNotas / aluno.notas.length;
                    return { ...aluno, mediaNota: media.toFixed(2) }; // Mantém duas casas decimais
                }
                return { ...aluno, mediaNota: '-' }; // Caso não tenha notas
            });

            setAlunos(alunosComMedias);
        } catch (error) {
            setError('Erro ao buscar alunos. Tente novamente mais tarde.');
            console.error('Erro ao buscar alunos:', error);
        } finally {
            setLoading(false);
        }
    };

    // Busca os alunos ao carregar o componente
    useEffect(() => {
        if (turmaId) {
            fetchAlunos();
        }
    }, [turmaId]);

    // Função para filtrar alunos pelo nome ou matrícula
    const filtrarAlunos = (texto) => {
        setFiltro(texto);
        if (texto) {
            const alunosFiltrados = alunos.filter((aluno) =>
                aluno.nomeAluno.toLowerCase().includes(texto.toLowerCase()) ||
                aluno.identifierCode.toString().includes(texto)
            );
            setAlunos(alunosFiltrados);
        } else {
            fetchAlunos(); // Recarrega todos os alunos se o filtro estiver vazio
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
            </View>
        );
    }

    return (
        <ScrollView style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <HeaderSimples />
            <View style={{ padding: 10 }}>
                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>Turma A - 1º Ano</Text>
                    <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
                </View>

                <View style={[styles.containerBranco, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor="#756262"
                            value={filtro}
                            onChangeText={filtrarAlunos} // Aplica o filtro ao digitar
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
                                    <TouchableOpacity style={styles.notasButton} onPress={() => navigation.navigate('PerfilAluno', { alunoId: aluno.id })}>
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
                        <TouchableOpacity style={styles.botaoCriar} onPress={() => setModalCriarVisible(true)}>
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        <CadastroAlunoModal visible={modalCriarVisible} onClose={() => setModalCriarVisible(false)} />
                    </View>
                </View>
            </View>
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
        color: '#333',
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
        color: '#333',
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
});