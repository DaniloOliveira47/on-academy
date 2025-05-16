import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    TextInput,
    View,
    ActivityIndicator,
    TouchableOpacity,
    Text,
    ScrollView,
    Alert,
    Image,
    Modal
} from 'react-native';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/Feather';
import CardAlunos from '../CardAlunos';
import CardSelecao from '../CardSelecao';
import { useTheme } from '../../../path/ThemeContext';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const navigation = useNavigation();

    const { turmaId } = route.params;
    const ALUNOS_POR_PAGINA = 10;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar dados da turma
                const turmaResponse = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/students/${turmaId}`);
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
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [turmaId]);

    const fetchMediasFeedbacks = async () => {
        try {
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/feedback/${turmaId}`);
            const { mediaResposta1, mediaResposta2, mediaResposta3, mediaResposta4, mediaResposta5, totalFeedbacks } = response.data;

            setDadosGrafico([
                mediaResposta1 || 0,
                mediaResposta2 || 0,
                mediaResposta3 || 0,
                mediaResposta4 || 0,
                mediaResposta5 || 0
            ]);
            setTotalFeedbacks(totalFeedbacks || 0);
        } catch (error) {
            setDadosGrafico([0, 0, 0, 0, 0]);
            setTotalFeedbacks(0);
        }
    };

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

        if (totalPaginas <= maxBotoes) {
            for (let i = 1; i <= totalPaginas; i++) {
                botoes.push(i);
            }
        } else {
            if (paginaSelecionada <= 2) {
                for (let i = 1; i <= maxBotoes; i++) {
                    botoes.push(i);
                }
                botoes.push('>');
            } else if (paginaSelecionada >= totalPaginas - 1) {
                botoes.push('<');
                for (let i = totalPaginas - 2; i <= totalPaginas; i++) {
                    botoes.push(i);
                }
            } else {
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

    // Função para lidar com o clique em uma barra do gráfico
    const handleBarraClick = (categoria, valor) => {
        if (valor > 0) {
            setBarraSelecionada({
                label: categoria,
                value: valor
            });
            setModalBarraVisible(true);
        }
    };

    const handleAdicionarFeedback = async () => {
        if (!feedbackConteudo.trim()) {
            alert('Por favor, insira um feedback.');
            return;
        }

        const feedbackData = {
            conteudo: feedbackConteudo,
            createdBy: professorId,  // Apenas o ID como string
            classSt: turmaId        // Apenas o ID como string
        };

        try {
            const response = await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/student', feedbackData, {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status >= 200 && response.status < 300) {
                alert('Feedback adicionado com sucesso!');
                setFeedbackConteudo('');
                await fetchMediasFeedbacks(); // Atualiza os dados do gráfico se necessário
            }
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
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

   
    const botoesPagina = getBotoesPagina();

    const [coluna1, coluna2] = getAlunosPaginaAtual();
    const apenasUmAluno = coluna1.length + coluna2.length === 1;

    return (
        <View style={{ flex: 1 }}>
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
                                style={[styles.input, { color: isDarkMode ? '#FFF' : '#000' }]}
                                placeholder="Digite o nome ou número da matrícula"
                                placeholderTextColor="#756262"
                            />
                            <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                        </View>

                        <View style={styles.contColumn}>
                            {apenasUmAluno ? (
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    {coluna1.length > 0 ? (
                                        <CardAlunos
                                            key={coluna1[0].id}
                                            nome={coluna1[0].nomeAluno}
                                            navegacao="AlunoPerfil"
                                            alunoId={coluna1[0].id}
                                            fotoAluno={coluna1[0].imageUrl}
                                        />
                                    ) : (
                                        <CardAlunos
                                            key={coluna2[0].id}
                                            nome={coluna2[0].nomeAluno}
                                            navegacao="AlunoPerfil"
                                            alunoId={coluna2[0].id}
                                            fotoAluno={coluna2[0].imageUrl}
                                        />
                                    )}
                                </View>
                            ) : (
                                <>
                                    <View style={styles.column}>
                                        {coluna1.map((aluno) => (
                                            <CardAlunos
                                                key={aluno.id}
                                                nome={aluno.nomeAluno}
                                                navegacao="AlunoPerfil"
                                                alunoId={aluno.id}
                                                fotoAluno={aluno.imageUrl}
                                            />
                                        ))}
                                    </View>
                                    <View style={styles.column}>
                                        {coluna2.map((aluno) => (
                                            <CardAlunos
                                                key={aluno.id}
                                                nome={aluno.nomeAluno}
                                                navegacao="AlunoPerfil"
                                                alunoId={aluno.id}
                                                fotoAluno={aluno.imageUrl}
                                            />
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Restante do código permanece igual */}
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
                            {totalFeedbacks === 0 ? (
                                <View style={styles.semFeedbacksContainer}>
                                    <Image
                                        source={require('../../../assets/image/sem-feedback.png')}
                                        style={styles.semFeedbacksImagem}
                                    />
                                    <Text style={[styles.semFeedbacksTitulo, { color: isDarkMode ? 'white' : 'black' }]}>
                                        Nenhum feedback encontrado
                                    </Text>
                                    <Text style={[styles.semFeedbacksTexto, { color: isDarkMode ? 'white' : 'black' }]}>
                                        Nenhum professor enviou feedbacks para esta turma ainda
                                    </Text>
                                </View>
                            ) : (
                                <GraficoFeedbackTurma
                                    dadosGrafico={dadosGrafico}
                                    onBarraClick={handleBarraClick}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modal permanece igual */}
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
        minHeight: 400,
    },
    column: {
        alignItems: 'center',
        width: '50%',
    },
    container: {
        width: '100%',
        padding: 10,
        borderRadius: 16
    },
    tela: {
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

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 100,
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
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    feedbackButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    semFeedbacksContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    semFeedbacksImagem: {
        width: 150,
        height: 150,
        marginBottom: 20,
        opacity: 0.7
    },
    semFeedbacksTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    semFeedbacksTexto: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
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