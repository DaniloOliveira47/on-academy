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
import GraficoFeedback from '../../Gerais/GraficoFeedback';
import GraficoFeedbackTurma from '../../Gerais/GraficoFeedbackTurma';

export default function AlunosFeedback({ route }) {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [turma, setTurma] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackConteudo, setFeedbackConteudo] = useState('');
    const [professorId, setProfessorId] = useState(null);
    const [userToken, setUserToken] = useState(null);
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);
    const navigation = useNavigation();

    // Constantes para paginação
    const ALUNOS_POR_PAGINA = 10;
    const { turmaId } = route.params;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar dados da turma
                const turmaResponse = await axios.get(`http://10.0.2.2:3000/api/class/students/${turmaId}`);
                setTurma(turmaResponse.data);
                
                // Buscar médias dos feedbacks
                await fetchMediasFeedbacks();
                
                // Buscar ID do professor
                const id = await AsyncStorage.getItem('@user_id');
                setProfessorId(id);
                
                // Buscar token
                const token = await AsyncStorage.getItem('@user_token');
                setUserToken(token);
            } catch (error) {
                setError('Erro ao buscar dados. Tente novamente mais tarde.');
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [turmaId]);

    // Função para obter alunos da página atual
    const getAlunosPaginaAtual = () => {
        if (!turma || !turma.students) return [[], []];
        
        const inicio = (paginaSelecionada - 1) * ALUNOS_POR_PAGINA;
        const fim = inicio + ALUNOS_POR_PAGINA;
        const alunosPagina = turma.students.slice(inicio, fim);
        
        // Dividir em duas colunas
        const metade = Math.ceil(alunosPagina.length / 2);
        const coluna1 = alunosPagina.slice(0, metade);
        const coluna2 = alunosPagina.slice(metade);
        
        return [coluna1, coluna2];
    };

    // Calcular o número total de páginas
    const totalPaginas = turma ? Math.ceil(turma.students.length / ALUNOS_POR_PAGINA) : 1;

    // Gerar array de números de página ou '>' para próxima página
    const getBotoesPagina = () => {
        const botoes = [];
        const maxBotoes = 3; // Número máximo de botões de página a mostrar
        
        // Se tiver poucas páginas, mostra todas
        if (totalPaginas <= maxBotoes) {
            for (let i = 1; i <= totalPaginas; i++) {
                botoes.push(i);
            }
        } else {
            // Lógica para mostrar botões com ellipsis
            if (paginaSelecionada <= 2) {
                // Mostrar as primeiras páginas
                for (let i = 1; i <= maxBotoes; i++) {
                    botoes.push(i);
                }
                botoes.push('>');
            } else if (paginaSelecionada >= totalPaginas - 1) {
                // Mostrar as últimas páginas
                botoes.push('<');
                for (let i = totalPaginas - 2; i <= totalPaginas; i++) {
                    botoes.push(i);
                }
            } else {
                // Mostrar página atual no meio
                botoes.push('<');
                botoes.push(paginaSelecionada);
                botoes.push('>');
            }
        }
        
        return botoes;
    };

    const handleMudarPagina = (pagina) => {
        if (pagina === '<') {
            setPaginaSelecionada(prev => Math.max(1, prev - 1));
        } else if (pagina === '>') {
            setPaginaSelecionada(prev => Math.min(totalPaginas, prev + 1));
        } else {
            setPaginaSelecionada(pagina);
        }
    };

    const fetchMediasFeedbacks = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/class/feedback/${turmaId}`);
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
            console.error('Erro ao carregar as médias dos feedbacks:', error);
            setDadosGrafico([0, 0, 0, 0, 0]);
            setTotalFeedbacks(0);
        }
    };

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

        try {
            const response = await axios.post('http://10.0.2.2:3000/api/feedbackTeacher', feedbackData, {
                headers: {
                    Authorization: `Bearer ${userToken}`
                }
            });

            if (response.status >= 200 && response.status < 300) {
                alert('Feedback adicionado com sucesso!');
                setFeedbackConteudo('');
                await fetchMediasFeedbacks();
            }
        } catch (error) {
            console.error('Erro ao adicionar feedback:', error);
            alert('Erro ao enviar feedback. Tente novamente mais tarde.');
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

    const [coluna1, coluna2] = getAlunosPaginaAtual();
    const botoesPagina = getBotoesPagina();

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
                                {coluna1.map((aluno) => (
                                    <CardAlunos
                                        key={aluno.id}
                                        nome={aluno.nomeAluno}
                                        navegacao="AlunoPerfil"
                                        alunoId={aluno.id}
                                    />
                                ))}
                            </View>
                            <View>
                                {coluna2.map((aluno) => (
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
                            {botoesPagina.map((numero, index) => (
                                <CardSelecao
                                    key={index}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => handleMudarPagina(numero)}
                                />
                            ))}
                        </View>
                        
                        <View style={styles.graficoContainer}>
                            <GraficoFeedbackTurma
                                dadosGrafico={dadosGrafico}
                                totalFeedbacks={totalFeedbacks}
                            />
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
        justifyContent: 'space-around',
        width: '100%',
        height: 400
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
    graficoContainer: {
        marginBottom: 20,
        padding: 10
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
        marginTop: 30, 
        padding: 10
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