import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput, Modal } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Perguntas from '../../Feedback/Perguntas';
import Avaliacao from '../../Feedback/Avaliacao';
import GraficoFeedback from '../../Gerais/GraficoFeedback';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../Gerais/CustomAlert';
import HeaderSimplesBack from '../../Gerais/HeaderSimplesBack';

export default function AlunoPerfil({ route }) {
    const { isDarkMode } = useTheme();
    const { alunoId } = route.params;
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState(Array(5).fill(0));
    const [conteudoFeedback, setConteudoFeedback] = useState('');
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false);
    const [modalProfessorVisible, setModalProfessorVisible] = useState(false);
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [feedbacks, setFeedbacks] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [semFeedbacks, setSemFeedbacks] = useState(false);
    const scrollViewRef = React.useRef();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const sombra = isDarkMode ? '#FFF' : '#000';

    useEffect(() => {
        const fetchAluno = async () => {
            try {
                const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`);
                setAluno(response.data);
            } catch (error) {
                setError('Erro ao carregar os dados do aluno. Tente novamente mais tarde.');

            } finally {
                setLoading(false);
            }
        };

        fetchAluno();
    }, [alunoId]);

    useEffect(() => {
        if (alunoId) {
            fetchFeedbacks();
        }
    }, [alunoId, bimestreSelecionado, professorSelecionado]);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/feedback/${alunoId}`);
            setFeedbacks(response.data);

            const professoresUnicos = [];
            const professoresMap = new Map();

            response.data.forEach(feedback => {
                if (feedback.createdByDTO && !professoresMap.has(feedback.createdByDTO.id)) {
                    professoresMap.set(feedback.createdByDTO.id, true);
                    professoresUnicos.push(feedback.createdByDTO);
                }
            });

            setProfessores(professoresUnicos);
            atualizarDadosGrafico(response.data);
        } catch (error) {

        }
    };

    const atualizarDadosGrafico = (feedbacksData) => {
        let feedbacksFiltrados = feedbacksData.filter(feedback => feedback.bimestre === bimestreSelecionado);

        if (professorSelecionado) {
            feedbacksFiltrados = feedbacksFiltrados.filter(
                feedback => feedback.createdByDTO.id === professorSelecionado.id
            );

            if (feedbacksFiltrados.length > 0) {
                const feedback = feedbacksFiltrados[0];
                setDadosGrafico([
                    feedback.resposta1,
                    feedback.resposta2,
                    feedback.resposta3,
                    feedback.resposta4,
                    feedback.resposta5
                ]);
                setSemFeedbacks(false);
                return;
            }
        }

        if (feedbacksFiltrados.length === 0) {
            setSemFeedbacks(true);
            setDadosGrafico([0, 0, 0, 0, 0]);
            return;
        }

        setSemFeedbacks(false);

        const somaRespostas = feedbacksFiltrados.reduce((acc, feedback) => {
            return {
                resposta1: acc.resposta1 + feedback.resposta1,
                resposta2: acc.resposta2 + feedback.resposta2,
                resposta3: acc.resposta3 + feedback.resposta3,
                resposta4: acc.resposta4 + feedback.resposta4,
                resposta5: acc.resposta5 + feedback.resposta5,
            };
        }, { resposta1: 0, resposta2: 0, resposta3: 0, resposta4: 0, resposta5: 0 });

        const novasMedias = [
            somaRespostas.resposta1 / feedbacksFiltrados.length,
            somaRespostas.resposta2 / feedbacksFiltrados.length,
            somaRespostas.resposta3 / feedbacksFiltrados.length,
            somaRespostas.resposta4 / feedbacksFiltrados.length,
            somaRespostas.resposta5 / feedbacksFiltrados.length,
        ];

        setDadosGrafico(novasMedias);
    };

    const formatarData = (dataCompleta) => {
        if (!dataCompleta) return '';
        const [data, horario] = dataCompleta.split(' ');
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const handleBarraClick = (label, value) => {
        if (value === 0) return;
        setBarraSelecionada({ label, value });
        setModalBarraVisible(true);
    };

    const handleSelecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
        setModalProfessorVisible(false);
    };

    const handleLimparFiltroProfessor = () => {
        setProfessorSelecionado(null);
    };

    const enviarFeedback = async () => {
        if (ratings.some(rating => rating === 0)) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, avalie todas as perguntas antes de enviar.');
            setAlertVisible(true);
            return;
        }

        if (!bimestreSelecionado) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, selecione um bimestre antes de enviar o feedback.');
            setAlertVisible(true);
            return;
        }

        try {
            const professorId = await AsyncStorage.getItem('@user_id');

            if (!professorId) {
                setAlertTitle('Erro de sessão');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                return;
            }

            if (conteudoFeedback && conteudoFeedback.trim().length > 0 && conteudoFeedback.trim().length < 5) {
                setAlertTitle('Feedback muito curto');
                setAlertMessage('O conteúdo do feedback deve ter pelo menos 5 caracteres ou deixe em branco.');
                setAlertVisible(true);
                return;
            }

            const feedbackData = {
                resposta1: ratings[0],
                resposta2: ratings[1],
                resposta3: ratings[2],
                resposta4: ratings[3],
                resposta5: ratings[4],
                bimestre: bimestreSelecionado,
                createdBy: { id: professorId },
                recipientStudent: { id: alunoId },
                conteudo: conteudoFeedback?.trim() || ''
            };

            await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/feedbackForm', feedbackData);

            setAlertTitle('Sucesso');
            setAlertMessage('Feedback enviado com sucesso!');
            setAlertVisible(true);

            fetchFeedbacks();
            setRatings(Array(5).fill(0));

        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível enviar o feedback. Tente novamente.');
            setAlertVisible(true);
        }
    };


    const enviarFeedbackEscrito = async () => {
        if (!conteudoFeedback.trim()) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, escreva algo antes de enviar.');
            setAlertVisible(true);
            return;
        }

        if (conteudoFeedback.trim().length < 5) {
            setAlertTitle('Erro');
            setAlertMessage('O feedback precisa ter pelo menos 5 caracteres.');
            setAlertVisible(true);
            return;
        }

        try {
            const professorId = await AsyncStorage.getItem('@user_id');

            if (!professorId) {
                setAlertTitle('Erro de sessão');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                return;
            }

            const feedbackData = {
                conteudo: conteudoFeedback.trim(),
                createdBy: { id: professorId },
                recipientStudent: { id: alunoId },
            };

            await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/student', feedbackData);

            setAlertTitle('Sucesso');
            setAlertMessage('Feedback escrito enviado com sucesso!');
            setAlertVisible(true);

            setConteudoFeedback('');
        } catch (error) {
            console.error('Erro ao enviar feedback escrito:', error);
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível enviar o feedback escrito. Tente novamente.');
            setAlertVisible(true);
        }
    };


    const renderPergunta = (pergunta, index) => {
        return (
            <View key={index} style={[styles.containerPerguntas, { backgroundColor: perfilBackgroundColor }]}>
                <Perguntas numero={(index + 1).toString()} text={pergunta} />
                <View style={styles.avaliacaoContainer}>
                    {[...Array(5)].map((_, i) => (
                        <Avaliacao
                            key={i}
                            numero={(i + 1).toString()}
                            selected={ratings[index] === i + 1}
                            onPress={() => {
                                const newRatings = [...ratings];
                                newRatings[index] = i + 1;
                                setRatings(newRatings);
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const perguntas = [
        "Nível de Engajamento (O quanto a aula prendeu a atenção e motivou a participação?)",
        "Nível de Desempenho (O quanto o aluno demonstrou compreensão do conteúdo?)",
        "Nível de Entrega (O quanto o aluno entregou as atividades propostas?)",
        "Nível de Atenção (O quanto o aluno se manteve focado durante a aula?)",
        "Nível de Comportamento (O quanto o aluno se comportou adequadamente?)",
    ];

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: perfilBackgroundColor }]}>
                <ActivityIndicator size="large" color="#1E6BE6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: perfilBackgroundColor }]}>
                <Text style={{ color: textColor, textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    if (!aluno) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: perfilBackgroundColor }]}>
                <Text style={{ color: textColor, textAlign: 'center' }}>Aluno não encontrado.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ backgroundColor: perfilBackgroundColor }} ref={scrollViewRef}>
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <HeaderSimplesBack titulo="PERFIL" />
                <View style={{ padding: 15 }}>
                    <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor, marginTop: 0 }]} source={require('../../../assets/image/barraAzul.png')} />
                    <View style={[styles.form, {
                        backgroundColor: formBackgroundColor,
                        shadowColor:  '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                        borderBottomRightRadius: 20,
                           borderBottomLeftRadius: 20
                    }]}>
                        <View style={styles.linhaUser}>
                            <View style={{ backgroundColor: 'white', borderRadius: 40 }}>


                                <Image
                                    source={aluno.imageUrl ? { uri: aluno.imageUrl } : require('../../../assets/image/Professor.png')}
                                    style={styles.profileImage}
                                />
                            </View>
                            <View style={styles.name}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={[styles.nome, { color: textColor }]}>{aluno.nome}</Text>
                                    <Text style={{ color: 'green' }}>(Ativo)</Text>
                                </View>
                                <Text style={[styles.email, { color: textColor }]}>{aluno.emailAluno}</Text>
                            </View>
                        </View>
                        <Campo label="Nome Completo" text={aluno.nome} textColor={textColor} />
                        <Campo label="Email" text={aluno.emailAluno} textColor={textColor} />
                        <Campo label="Nº Matrícula" text={aluno.matriculaAluno} textColor={textColor} />
                        <View style={styles.doubleCampo}>
                            <View style={[styles.campo]}>
                                <Text style={[styles.label, { color: textColor }]}>Telefone</Text>
                                <View style={[styles.inputContainer, { backgroundColor: perfilBackgroundColor }]}>
                                    <Text style={[styles.colorInput, { color: textColor }]}>
                                        {aluno.telefoneAluno}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.campo]}>
                                <Text style={[styles.label, { color: textColor }]}>Data de Nascimento</Text>
                                <View style={[styles.inputContainer, { backgroundColor: perfilBackgroundColor }]}>
                                    <Text style={[styles.colorInput, { color: textColor }]}>
                                        {formatarData(aluno.dataNascimentoAluno)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Campo label="Turma" text={aluno.turma.nomeTurma} textColor={textColor} />
                    </View>

                    <View style={[styles.grafico, {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                        backgroundColor: formBackgroundColor
                    }]}>
                        <GraficoFeedback
                            dadosGrafico={dadosGrafico}
                            bimestreSelecionado={bimestreSelecionado}
                            professorSelecionado={professorSelecionado}
                            semFeedbacks={semFeedbacks}
                            professores={professores}
                            onSelecionarBimestre={() => setModalBimestreVisible(true)}
                            onSelecionarProfessor={() => setModalProfessorVisible(true)}
                            onLimparFiltroProfessor={handleLimparFiltroProfessor}
                            onBarraClick={handleBarraClick}
                        />

                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#0077FF', fontSize: 16, fontWeight: 'bold' }}>
                                Dê seu feedback sobre o aluno(a)!
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: textColor }}>
                                Avalie os seguintes aspectos de 1 a 5 para nos ajudar a melhorar a experiência das aulas.
                            </Text>
                            <Swiper
                                loop={false}
                                showsPagination={true}
                                dotColor="#CCC"
                                activeDotColor="#1E6BE6"
                                style={styles.swiper}
                                removeClippedSubviews={false} // pode ajudar em alguns casos
                                bounces={true} // efeito de bounce
                            >
                                {perguntas.map((pergunta, index) => renderPergunta(pergunta, index))}
                            </Swiper>
                            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', gap: 20, marginTop: 15 }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: '#0077FF', width: 120, alignItems: 'center', borderRadius: 8, padding: 5 }}
                                    onPress={enviarFeedback}
                                >
                                    <Text style={{ color: 'white' }}>Enviar Respostas</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.feedbackContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.feedbackLabel, { color: textColor }]}>Escreva sobre esse aluno:</Text>
                        <TextInput
                            style={[styles.feedbackInput, {
                                color: textColor,
                                borderColor: textColor,
                                backgroundColor: perfilBackgroundColor
                            }]}
                            placeholder="Digite seu feedback..."
                            placeholderTextColor={isDarkMode ? '#AAA' : '#666'}
                            multiline
                            value={conteudoFeedback}
                            onChangeText={setConteudoFeedback}
                        />
                        <TouchableOpacity
                            style={[styles.botaoEnviar, { backgroundColor: barraAzulColor }]}
                            onPress={enviarFeedbackEscrito}
                        >
                            <Text style={styles.textoBotaoEnviar}>Enviar Feedback Escrito</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <Modal visible={modalBimestreVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalBimestreVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        {/* Header with logo */}
                        <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                            <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                <Image
                                    source={require('../../../assets/image/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            Selecione o Bimestre
                        </Text>

                        {[1, 2, 3, 4].map((bimestre) => (
                            <TouchableOpacity
                                key={bimestre}
                                style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                onPress={() => {
                                    setBimestreSelecionado(bimestre);
                                    setModalBimestreVisible(false);
                                }}
                            >
                                <Text style={[styles.modalText, { color: textColor }]}>
                                    {bimestre}º Bimestre
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={modalProfessorVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalProfessorVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        {/* Header with logo */}
                        <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                            <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                <Image
                                    source={require('../../../assets/image/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>

                        <Text style={[styles.modalTitle, { color: textColor }]}>
                            Selecione o Professor
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                            onPress={() => handleSelecionarProfessor(null)}
                        >
                            <Text style={[styles.modalText, { color: textColor }]}>
                                Todos Professores
                            </Text>
                        </TouchableOpacity>

                        {professores.map((professor) => (
                            <TouchableOpacity
                                key={professor.id}
                                style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                onPress={() => handleSelecionarProfessor(professor)}
                            >
                                <Text style={[styles.modalText, { color: textColor }]}>
                                    {professor.nomeDocente}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal visible={modalBarraVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop2}>
                    <View style={[styles.modalContainer2, { backgroundColor: '#1E6BE6' }]}>
                        <Text style={[styles.modalTitle2, { color: 'white' }]}>Valor</Text>
                        <Text style={[styles.modalText2, { color: 'white', fontSize: 24 }]}>
                            {barraSelecionada.value.toFixed(1)}
                        </Text>

                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: 'white', marginTop: 20 }]}
                            onPress={() => setModalBarraVisible(false)}
                        >
                            <Text style={[styles.buttonText, { color: '#1E6BE6' }]}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    campo: {
        marginTop: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '85%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        maxHeight: '80%',
    },
    modalHeader: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 25,
    },
    logoSquare: {
        width: 70,
        height: 70,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logo: {
        width: 50,
        height: 50,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 15,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    modalText: {
        fontSize: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        resizeMode: 'cover',
    },
    inline: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        padding: 10,
        width: 150,
        justifyContent: 'space-between',
    },
    colorInput: {
        fontSize: 17,
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60
    },
    containerPerguntas: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        padding: 10,
        borderRadius: 15,
        height: 'auto',
        marginTop: 15,
        paddingBottom: 20
    },
    avaliacaoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    grafico: {
        backgroundColor: 'white',
        padding: 10,
        width: '100%',
        marginTop: 20,
        borderRadius: 10,
    },
    barraAzul: {
        width: '100%',
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        marginTop: 25,
    },
    form: {
        padding: 25,
    },
    linhaUser: {
        flexDirection: 'row',
        gap: 10,
    },
    name: {
        marginTop: 15,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 15,
    },
    doubleCampo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    swiper: {
        height: 200,
    },
    feedbackContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 10,
    },
    feedbackLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    feedbackInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        height: 100,
        textAlignVertical: 'top',
    },
    botaoEnviar: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    textoBotaoEnviar: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalBackdrop2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer2: {
        backgroundColor: '#FFF',
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
    modalTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem2: {
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText2: {
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
    botaoAdicionarFeedback: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginTop: 10,
    },
    textoBotaoAdicionar: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
    },
});