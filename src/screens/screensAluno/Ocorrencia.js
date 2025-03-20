import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, View, Alert, Modal } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import { BarChart } from 'react-native-chart-kit';

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState("1º Bim.");
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const screenWidth = Dimensions.get('window').width - 40;

    const [userId, setUserId] = useState(null);

    // Busca os professores ao carregar o componente
    useEffect(() => {
        axios.get('http://10.0.2.2:3000/api/teacher')
            .then(response => {
                setProfessores(response.data);
            })
            .catch(error => {
                console.error('Erro ao buscar professores:', error);
            });
    }, []);

    // Busca o userId do AsyncStorage
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const id = await AsyncStorage.getItem('@user_id');
                setUserId(id);
            } catch (error) {
                console.error('Erro ao buscar userId:', error);
            }
        };

        fetchUserId();
    }, []);

    // Busca os feedbacks do estudante
    useEffect(() => {
        if (userId) {
            axios.get(`http://10.0.2.2:3000/api/student/feedback/${userId}`)
                .then(response => {
                    setFeedbacks(response.data);
                })
                .catch(error => {
                    console.error('Erro ao buscar feedbacks:', error);
                });
        }
    }, [userId]);

    // Filtra os feedbacks pelo bimestre selecionado
    const feedbacksFiltrados = feedbacks.filter(feedback => feedback.bimestre === bimestreSelecionado);

    // Calcula as médias das respostas para o gráfico
    const calcularMedias = () => {
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

        const medias = [
            somaRespostas.resposta1 / feedbacksFiltrados.length,
            somaRespostas.resposta2 / feedbacksFiltrados.length,
            somaRespostas.resposta3 / feedbacksFiltrados.length,
            somaRespostas.resposta4 / feedbacksFiltrados.length,
            somaRespostas.resposta5 / feedbacksFiltrados.length,
        ];

        return medias;
    };

    const medias = calcularMedias();

    const data = {
        labels: ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'],
        datasets: [{
            data: medias,
            colors: [
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6'
            ]
        }]
    };

    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor); // Define o professor selecionado
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
                recipientTeacher: { id: professorSelecionado.id } // Usa o ID do professor selecionado
            };

            const response = await axios.post('http://10.0.2.2:3000/api/feedbackStudent', feedback);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
            } else {
                Alert.alert('Erro', 'Não foi possível enviar o feedback.');
            }
        } catch (error) {
            console.error('Erro ao enviar feedback:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao enviar o feedback.');
        }

        setProfessorSelecionado(null);
        setTitulo('');
        setConteudo('');
    };

    return (
        <ScrollView>
            <HeaderSimples titulo="FEEDBACK" />
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <View style={{ backgroundColor: formBackgroundColor, padding: 20, borderRadius: 20 }}>
                    <View style={{ width: '100%', alignItems: 'flex-end', marginLeft: 12 }}>
                        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
                                Bimestre
                            </Text>
                            <TouchableOpacity
                                style={{ backgroundColor: perfilBackgroundColor, padding: 8, width: 32, alignItems: 'center', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={{ color: 'blue', fontSize: 18, fontWeight: 'bold' }}>
                                    v
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

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

                    <BarChart
                        data={data}
                        width={screenWidth * 0.99}
                        height={200}
                        yAxisSuffix="%"
                        fromZero
                        showBarTops={false}
                        withCustomBarColorFromData={true}
                        flatColor={true}
                        chartConfig={{
                            backgroundGradientFrom: perfilBackgroundColor,
                            backgroundGradientTo: perfilBackgroundColor,
                            decimalPlaces: 0,
                            color: () => '#1E6BE6',
                            labelColor: () => textColor,
                            barPercentage: 1.2,
                            fillShadowGradient: '#A9C1F7',
                            fillShadowGradientOpacity: 1,
                        }}
                        style={styles.chart}
                    />
                </View>

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
                                onPress={() => selecionarProfessor(professor)} // Seleciona o professor
                                onVerPerfil={() => navigation.navigate('ProfessorPerfil', { id: professor.id })} // Navega ao perfil
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
                                onVerPerfil={() => navigation.navigate('ProfessorPerfil', { id: professor.id })}
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
                                onVerPerfil={() => navigation.navigate('ProfessorPerfil', { id: professor.id })}
                                selecionado={professorSelecionado?.id === professor.id}
                            />
                        ))}
                    </View>

                    {/* Input de feedback (aparece apenas quando um professor é selecionado) */}
                    {professorSelecionado && (
                        <>
                            <TextInput
                                style={[styles.input, { backgroundColor: perfilBackgroundColor, color: textColor, height: 100 }]}
                                placeholder={`Escreva aqui seu feedback para o prof(a) ${professorSelecionado.nomeDocente}`}
                                placeholderTextColor={textColor}
                                multiline
                                value={conteudo}
                                onChangeText={setConteudo}
                            />

                            <TouchableOpacity
                                style={styles.botaoEnviar}
                                onPress={enviarFeedback}
                            >
                                <Text style={{ color: 'white' }}>
                                    Enviar
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
        backgroundColor: '#F0F7FF'
    },
    container2: {
        backgroundColor: 'white',
        padding: 10,
        marginTop: 20,
        borderRadius: 10
    },
    chart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        borderRadius: 10,
        padding: 10,
        marginTop: 20,
        width: '100%',
    },

    botaoEnviar: {
        backgroundColor: '#0077FF',
        padding: 10,
        borderRadius: 10,
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