import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity, Text, ScrollView } from 'react-native';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/Feather';
import CardAlunos from '../CardAlunos';
import CardSelecao from '../CardSelecao';
import { useTheme } from '../../../path/ThemeContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlunosFeedback({ route }) {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [turma, setTurma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackConteudo, setFeedbackConteudo] = useState('');
    const [professorId, setProfessorId] = useState(null);
    const [userToken, setUserToken] = useState(null); // Estado para o token
    const navigation = useNavigation();

    const { turmaId } = route.params;

    useEffect(() => {
        const fetchTurmaDetalhes = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:3000/api/class/students/${turmaId}`);
                setTurma(response.data);
            } catch (error) {
                setError('Erro ao buscar detalhes da turma. Tente novamente mais tarde.');
                console.error('Erro ao buscar detalhes da turma:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProfessorId = async () => {
            try {
                const id = await AsyncStorage.getItem('@user_id');
                setProfessorId(id);
            } catch (error) {
                console.error('Erro ao buscar ID do professor:', error);
            }
        };

        const fetchToken = async () => {
            try {
                const token = await AsyncStorage.getItem('@user_token');
                setUserToken(token);
            } catch (error) {
                console.error('Erro ao buscar token:', error);
            }
        };

        fetchTurmaDetalhes();
        fetchProfessorId();
        fetchToken();
    }, [turmaId]);

    const handleAdicionarFeedback = async () => {
        if (!feedbackConteudo.trim()) {
            alert('Por favor, insira um feedback.');
            return;
        }

        const feedbackData = {
            conteudo: feedbackConteudo,
            createdBy: { id: professorId },
            classSt: { id: turmaId }
        };

        console.log('Dados enviados:', feedbackData); // Log dos dados

        try {
            const response = await axios.post('http://10.0.2.2:3000/api/feedbackTeacher', feedbackData, {
                headers: {
                    Authorization: `Bearer ${userToken}` // Adicione o token no cabeçalho
                }
            });

            console.log('Resposta da API:', response.data); // Log da resposta
            if (response.status >= 200 && response.status < 300) {
                alert('Feedback adicionado com sucesso!');
                setFeedbackConteudo('');
            } else {
                alert('Resposta inesperada do servidor.');
            }
            
        } catch (error) {
            console.error('Erro ao adicionar feedback:', error);
            if (error.response) {
                console.error('Resposta do servidor:', error.response.data);
                alert(`Erro: ${error.response.data.message || 'Erro ao enviar feedback.'}`);
            } else if (error.request) {
                console.error('Sem resposta do servidor:', error.request);
                alert('Erro de rede. Verifique sua conexão com a internet.');
            } else {
                console.error('Erro:', error.message);
                alert('Erro ao enviar feedback. Tente novamente mais tarde.');
            }
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

    if (!turma) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#000', textAlign: 'center' }}>Turma não encontrada.</Text>
            </View>
        );
    }

    return (
        <View>
            <ScrollView>
                <HeaderSimples />
                <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF', paddingBottom: 40 }]}>
                    <View style={styles.linha}>
                        <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>
                            {turma.nomeTurma} - {turma.periodoTurma}
                        </Text>
                        <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº{turma.id}</Text>
                    </View>
                    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite o nome ou número da matrícula"
                                placeholderTextColor="#756262"
                            />
                            <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                        </View>

                        <View style={styles.contColumn}>
                            <View>
                                {turma.students.slice(0, Math.ceil(turma.students.length / 2)).map((aluno) => (
                                    <CardAlunos
                                        key={aluno.id}
                                        nome={aluno.nomeAluno}
                                        navegacao="AlunoPerfil"
                                        alunoId={aluno.id}
                                    />
                                ))}
                            </View>
                            <View>
                                {turma.students.slice(Math.ceil(turma.students.length / 2)).map((aluno) => (
                                    <CardAlunos
                                        key={aluno.id}
                                        nome={aluno.nomeAluno}
                                        navegacao="AlunoPerfil"
                                        alunoId={aluno.id}
                                    />
                                ))}
                            </View>
                        </View>

                        <View style={styles.selecao}>
                            {[1, 2, 3, '>'].map((numero, index) => (
                                <CardSelecao
                                    key={index}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => setPaginaSelecionada(numero)}
                                />
                            ))}
                        </View>
                        <View style={styles.feedbackSection}>
                            <Text style={[styles.feedbackLabel, { color: isDarkMode ? '#FFF' : '#000' }]}>
                                Adicionar Feedback à Turma
                            </Text>
                            <View style={[styles.feedbackInputContainer, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                <TextInput
                                    style={[styles.feedbackInput, { color: isDarkMode ? '#FFF' : '#000' }]}
                                    placeholder="Digite seu feedback..."
                                    placeholderTextColor="#756262"
                                    value={feedbackConteudo}
                                    onChangeText={setFeedbackConteudo}
                                    multiline
                                />
                            </View>
                            <TouchableOpacity onPress={handleAdicionarFeedback} style={styles.feedbackButton}>
                                <Text style={styles.feedbackButtonText}>Enviar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
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
    header: {
        padding: 10,
        paddingBottom: 10
    },
    contColumn: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    container: {
        backgroundColor: 'white',
        width: '100%',
        padding: 10,
        borderRadius: 16
    },
    tela: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
        padding: 10
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
        marginTop: 10
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
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    feedbackSection: {
        marginTop: 30, padding: 10
    },
    feedbackLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    feedbackInputContainer: {
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    feedbackInput: {
        fontSize: 16,
        textAlignVertical: 'top',
    },
    feedbackButton: {
        backgroundColor: '#1A85FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    feedbackButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});