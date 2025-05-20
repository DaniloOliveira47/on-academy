import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View, Alert, Modal, Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import GraficoFeedback from '../../components/Gerais/GraficoFeedback';
import CustomAlert from '../../components/Gerais/CustomAlert';

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [conteudo, setConteudo] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const [userId, setUserId] = useState(null);
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false);
    const [modalProfessorVisible, setModalProfessorVisible] = useState(false);
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [semFeedbacks, setSemFeedbacks] = useState(false);

    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';



    useEffect(() => {
        axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher')
            .then(response => {
                setProfessores(response.data);
            })
            .catch(() => {
                setAlertTitle('Erro');
                setAlertMessage('Erro ao buscar professores.');
                setAlertVisible(true);
            });
    }, []);


    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('@user_id');
                setUserId(id);
            } catch {
                setAlertTitle('Erro');
                setAlertMessage('Erro ao recuperar o ID do usuário.');
                setAlertVisible(true);
            }
        };

        fetchUserId();
    }, []);


    useEffect(() => {
        if (userId) {
            fetchFeedbacks();
        }
    }, [userId, bimestreSelecionado]);

    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/feedback/${userId}`);
            setFeedbacks(response.data);
            atualizarDadosGrafico(response.data);
        } catch {
            setAlertTitle('Erro');
            setAlertMessage('Você não possui feedbacks');
            setAlertVisible(true);
        }
    };

    const handleSelecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
        setModalProfessorVisible(false);
    };

    const handleLimparFiltroProfessor = () => {
        setProfessorSelecionado(null);
    };

    const atualizarDadosGrafico = (feedbacksData) => {
        let feedbacksFiltrados = feedbacksData.filter(feedback => feedback.bimestre === bimestreSelecionado);

        if (professorSelecionado) {
            feedbacksFiltrados = feedbacksFiltrados.filter(
                feedback => feedback.createdByDTO && feedback.createdByDTO.id === professorSelecionado.id
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

    useEffect(() => {
        if (feedbacks.length > 0) {
            atualizarDadosGrafico(feedbacks);
        }
    }, [bimestreSelecionado, professorSelecionado]);

    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
    };

    const enviarFeedback = async () => {
        if (!professorSelecionado || !conteudo) {
            setAlertTitle('Erro');
            setAlertMessage('Escreva o seu feedback para o professor antes de enviar');
            setAlertVisible(true);
            return;
        }

        try {
            const user_id = await AsyncStorage.getItem('@user_id');

            if (!user_id) {
                setAlertTitle('Erro');
                setAlertMessage('Usuário não autenticado.');
                setAlertVisible(true);
                return;
            }

            const feedback = {
                conteudo: conteudo,
                createdBy: { id: parseInt(user_id, 10) },
                recipientTeacher: { id: professorSelecionado.id }
            };

            const response = await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/feedbackStudent', feedback);

            if (response.status === 200 || response.status === 201) {
                setAlertTitle('Sucesso');
                setAlertMessage('Feedback enviado com sucesso!');
                setAlertVisible(true);

                setConteudo('');
                setProfessorSelecionado(null);
                fetchFeedbacks();
            } else {
                setAlertTitle('Erro');
                setAlertMessage('Não foi possível enviar o seu feedback.');
                setAlertVisible(true);
            }
        } catch {
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível enviar o seu feedback no momento');
            setAlertVisible(true);
        }
    };

    const handleBarraClick = (label, value) => {
        if (value === 0) return;
        setBarraSelecionada({ label, value });
        setModalBarraVisible(true);
    };


    return (
        <ScrollView style={{ backgroundColor: perfilBackgroundColor }}>
            <HeaderSimples titulo="FEEDBACK" />
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>

                <GraficoFeedback
                    dadosGrafico={dadosGrafico}
                    bimestreSelecionado={bimestreSelecionado}
                    professorSelecionado={professorSelecionado}
                    semFeedbacks={semFeedbacks}
                    onSelecionarBimestre={() => setModalBimestreVisible(true)}
                    onSelecionarProfessor={() => setModalProfessorVisible(true)}
                    onLimparFiltroProfessor={handleLimparFiltroProfessor}
                    onBarraClick={handleBarraClick}
                    isDarkMode={isDarkMode}
                />

                <Modal visible={modalBimestreVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        onPress={() => setModalBimestreVisible(false)}
                        activeOpacity={1}
                    >
                        <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#141414' : '#FFF' }]}>

                            <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                                <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                    <Image
                                        source={require('../../assets/image/logo.png')}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                </View>

                            </View>

                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
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
                                    <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
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
                        <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#141414' : '#FFF' }]}>

                            <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                                <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                    <Image
                                        source={require('../../assets/image/logo.png')}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                </View>

                            </View>

                            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                                Selecione o Professor
                            </Text>

                            <TouchableOpacity
                                style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                onPress={() => handleSelecionarProfessor(null)}
                            >
                                <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                                    Todos Professores
                                </Text>

                            </TouchableOpacity>

                            {feedbacks
                                .filter((feedback, index, self) =>
                                    feedback.createdByDTO &&
                                    self.findIndex(f => f.createdByDTO.id === feedback.createdByDTO.id) === index
                                )
                                .map((feedback) => (
                                    <TouchableOpacity
                                        key={feedback.createdByDTO.id}
                                        style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                        onPress={() => handleSelecionarProfessor(feedback.createdByDTO)}
                                    >
                                        <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                                            {feedback.createdByDTO.nomeDocente}
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

                <View style={[styles.container2, { backgroundColor: formBackgroundColor }]}>
                    <Text style={{ marginTop: 5, fontSize: 18, color: '#0077FF', fontWeight: 'bold' }}>
                        A importância do seu Feedback
                    </Text>
                    <View style={{ width: '100%', paddingVertical: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15, color: textColor }}>
                            O feedback dos alunos é essencial para aprimorar a qualidade do ensino. Aqui, você pode compartilhar sua experiência em sala de aula, destacando o que está funcionando bem e o que pode ser melhorado.
                        </Text>
                        <Text style={{ fontWeight: 'bold', marginTop: 7, fontSize: 15, color: textColor }}>
                            Seus comentários ajudam os professores a ajustar métodos de ensino, tornando as aulas mais dinâmicas e eficazes. Seja claro e respeitoso em suas respostas, pois sua opinião contribui para um ambiente de aprendizado cada vez melhor para todos!
                        </Text>
                    </View>


                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        {professores.slice(0, 2).map((professor, index) => (
                            <CardProfessor
                                key={index}
                                nome={"Prof - " + professor.nomeDocente}
                                imageUrl={professor.imageUrl}
                                id={professor.id}
                                onPress={() => selecionarProfessor(professor)}
                                selecionado={professorSelecionado?.id === professor.id}
                            />
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        {professores.slice(2, 4).map((professor, index) => (
                            <CardProfessor
                                key={index}
                                nome={"Prof - " + professor.nomeDocente}
                                id={professor.id}
                                onPress={() => selecionarProfessor(professor)}
                                selecionado={professorSelecionado?.id === professor.id}
                            />
                        ))}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        {professores.slice(4, 6).map((professor, index) => (
                            <CardProfessor
                                key={index}
                                nome={"Prof - " + professor.nomeDocente}
                                id={professor.id}
                                onPress={() => selecionarProfessor(professor)}
                                selecionado={professorSelecionado?.id === professor.id}
                            />
                        ))}
                    </View>


                    {professorSelecionado && (
                        <>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: perfilBackgroundColor,
                                    color: textColor,
                                    height: 100,
                                    borderColor: textColor,
                                    borderWidth: 1
                                }]}
                                placeholder={`Escreva aqui seu feedback para o prof(a) ${professorSelecionado.nomeDocente}`}
                                placeholderTextColor={isDarkMode ? '#AAA' : '#666'}
                                multiline
                                value={conteudo}
                                onChangeText={setConteudo}
                            />

                            <TouchableOpacity
                                style={[styles.botaoEnviar, { backgroundColor: '#1E6BE6' }]}
                                onPress={enviarFeedback}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                    Enviar Feedback
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
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
    tela: {
        padding: 15,
        marginBottom: 30,
    },
    container2: {
        padding: 10,
        marginTop: 20,
        borderRadius: 10
    },
    input: {
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        width: '100%',
        textAlignVertical: 'top',
    },
    botaoEnviar: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
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
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
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
});