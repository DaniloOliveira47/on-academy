import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View, Alert, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import GraficoFeedback from '../../components/Gerais/GraficoFeedback'; // Importando o mesmo componente usado no AlunoPerfil

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [conteudo, setConteudo] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const [userId, setUserId] = useState(null);

    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';

    // Busca os professores ao carregar o componente
    useEffect(() => {
        axios.get('http://10.92.198.51:3000/api/teacher')
            .then(response => {
                setProfessores(response.data);
            })
            .catch(error => {
            
            });
    }, []);

    // Busca o userId do AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('@user_id');
                setUserId(id);
            } catch (error) {
               
            }
        };

        fetchUserId();
    }, []);

    // Busca os feedbacks do estudante
    useEffect(() => {
        if (userId) {
            axios.get(`http://10.92.198.51:3000/api/student/feedback/${userId}`)
                .then(response => {
                    setFeedbacks(response.data);
                })
                .catch(error => {
                   
                });
        }
    }, [userId]);

    // Filtra os feedbacks pelo bimestre selecionado
    const feedbacksFiltrados = feedbacks.filter(feedback => feedback.bimestre === bimestreSelecionado);

    // Calcula as médias das respostas para o gráfico
    const calcularDadosGrafico = () => {
        if (feedbacksFiltrados.length === 0) {
            return [0, 0, 0, 0, 0];
        }

        const somaRespostas = feedbacksFiltrados.reduce((acc, feedback) => {
            return {
                resposta1: acc.resposta1 + feedback.resposta1,
                resposta2: acc.resposta2 + feedback.resposta2,
                resposta3: acc.resposta3 + feedback.resposta3,
                resposta4: acc.resposta4 + feedback.resposta4,
                resposta5: acc.resposta5 + feedback.resposta5,
            };
        }, { resposta1: 0, resposta2: 0, resposta3: 0, resposta4: 0, resposta5: 0 });

        return [
            somaRespostas.resposta1 / feedbacksFiltrados.length,
            somaRespostas.resposta2 / feedbacksFiltrados.length,
            somaRespostas.resposta3 / feedbacksFiltrados.length,
            somaRespostas.resposta4 / feedbacksFiltrados.length,
            somaRespostas.resposta5 / feedbacksFiltrados.length,
        ];
    };

    const dadosGrafico = calcularDadosGrafico();

    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
    };

    const enviarFeedback = async () => {
        if (!professorSelecionado || !conteudo) {
            Alert.alert('Erro', 'Preencha todos os campos antes de enviar.');
            return;
        }

        try {
            const user_id = await AsyncStorage.getItem('@user_id');

            if (!user_id) {
                Alert.alert('Erro', 'Usuário não autenticado.');
                return;
            }

            const feedback = {
                conteudo: conteudo,
                createdBy: { id: parseInt(user_id, 10) },
                recipientTeacher: { id: professorSelecionado.id }
            };

            const response = await axios.post('http://10.92.198.51:3000/api/feedbackStudent', feedback);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
                setConteudo('');
                setProfessorSelecionado(null);
            } else {
                Alert.alert('Erro', 'Não foi possível enviar o feedback.');
            }
        } catch (error) {
          
            Alert.alert('Erro', 'Ocorreu um erro ao enviar o feedback.');
        }
    };

    return (
        <ScrollView style={{backgroundColor: perfilBackgroundColor}}>
            <HeaderSimples titulo="FEEDBACK" />
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                {/* Componente de Gráfico Reutilizado */}
                <GraficoFeedback
                    dadosGrafico={dadosGrafico}
                    bimestreSelecionado={bimestreSelecionado}
                    onSelecionarBimestre={() => setModalVisible(true)}
                    professorSelecionado={null} // Não há filtro por professor
                    semFeedbacks={feedbacksFiltrados.length === 0}
                    professores={[]} // Não precisa da lista de professores para filtrar
                    onLimparFiltroProfessor={() => {}}
                    onBarraClick={(label, value) => {
                        if (value === 0) return;
                        Alert.alert(label, `Valor: ${value.toFixed(1)}`);
                    }}
                />

                {/* Modal para seleção de bimestre */}
                <Modal
                    visible={modalVisible}
                    transparent={true}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                            {[1, 2, 3, 4].map((bimestre) => (
                                <TouchableOpacity
                                    key={bimestre}
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setBimestreSelecionado(bimestre);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalText, { color: textColor }]}>
                                        {bimestre}º Bim.
                                    </Text>
                                </TouchableOpacity>
                            ))}
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

                    {/* Lista de professores */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        {professores.slice(0, 2).map((professor, index) => (
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

                    {/* Input de feedback (aparece apenas quando um professor é selecionado) */}
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
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    modalItem: {
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText: {
        fontSize: 18,
    },
});