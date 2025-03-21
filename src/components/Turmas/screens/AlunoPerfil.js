import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Dimensions, TextInput } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { BarChart } from 'react-native-chart-kit';
import Perguntas from '../../Feedback/Perguntas';
import Avaliacao from '../../Feedback/Avaliacao';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlunoPerfil({ route }) {
    const { isDarkMode } = useTheme();
    const { alunoId } = route.params;
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratings, setRatings] = useState(Array(5).fill(0)); // Respostas atuais (em preenchimento)
    const [graphData, setGraphData] = useState(Array(5).fill(0)); // Dados do gráfico (só muda com o bimestre)
    const [bimestre, setBimestre] = useState(1);
    const [conteudoFeedback, setConteudoFeedback] = useState(''); // Estado para o conteúdo do feedback

    const fundoColor = isDarkMode ? '#33383E' : '#F0F7FF';
    const textInputColor = isDarkMode ? '#FFF' : '#33383E';

    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const sombra = isDarkMode ? '#FFF' : '#000';
    const formatarData = (dataCompleta) => {
        if (!dataCompleta) return ''; // Caso a data seja nula ou indefinida
    
        // Divide a data e o horário
        const [data, horario] = dataCompleta.split(' ');
    
        // Divide a data em ano, mês e dia
        const [ano, mes, dia] = data.split('-');
    
        // Reorganiza para o formato xx-xx-xxxx
        return `${dia}/${mes}/${ano}`;
    };

    useEffect(() => {
        const fetchAluno = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:3000/api/student/${alunoId}`);
                setAluno(response.data);
            } catch (error) {
                setError('Erro ao carregar os dados do aluno. Tente novamente mais tarde.');
                console.error('Erro ao buscar dados do aluno:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAluno();
    }, [alunoId]);

    useEffect(() => {
        if (alunoId) {
            fetchFeedback();
        }
    }, [bimestre, alunoId]);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/student/feedback/${alunoId}`);
            const feedbacks = response.data;

            // Filtra o feedback correspondente ao bimestre selecionado
            const feedbackDoBimestre = feedbacks.find(feedback => feedback.bimestre === bimestre);

            if (feedbackDoBimestre) {
                // Atualiza os dados do gráfico com as respostas do bimestre selecionado
                setGraphData([
                    feedbackDoBimestre.resposta1,
                    feedbackDoBimestre.resposta2,
                    feedbackDoBimestre.resposta3,
                    feedbackDoBimestre.resposta4,
                    feedbackDoBimestre.resposta5,
                ]);
            } else {
                // Se não houver feedback para o bimestre selecionado, reseta os dados do gráfico
                setGraphData(Array(5).fill(0));
            }

            // Reseta as respostas atuais para zero
            setRatings(Array(5).fill(0));
        } catch (error) {
            console.error('Erro ao carregar os feedbacks:', error);
        }
    };

    const enviarFeedback = async () => {
        // Verifica se todas as perguntas foram respondidas
        if (ratings.some(rating => rating === 0)) {
            Alert.alert('Erro', 'Por favor, avalie todas as perguntas antes de enviar.');
            return;
        }

        try {
            const professorId = await AsyncStorage.getItem('@user_id');
            const feedbackData = {
                resposta1: ratings[0],
                resposta2: ratings[1],
                resposta3: ratings[2],
                resposta4: ratings[3],
                resposta5: ratings[4],
                bimestre: bimestre,
                createdBy: { id: professorId },
                recipientStudent: { id: alunoId },
                conteudo: conteudoFeedback, // Adiciona o conteúdo do feedback
            };

            console.log('Dados do feedback a serem enviados:', feedbackData);

            const response = await axios.post('http://10.0.2.2:3000/api/feedbackForm', feedbackData);
            Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
            console.log('Resposta do servidor:', response.data);

            // Após enviar o feedback, atualiza os dados do gráfico
            fetchFeedback();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o feedback. Tente novamente.');
            console.error('Erro ao enviar feedback:', error.response ? error.response.data : error.message);
        }
    };

    const enviarFeedbackEscrito = async () => {
        if (!conteudoFeedback.trim()) {
            Alert.alert('Erro', 'Por favor, escreva algo antes de enviar.');
            return;
        }

        try {
            const professorId = await AsyncStorage.getItem('@user_id');
            const feedbackData = {
                conteudo: conteudoFeedback,
                createdBy: { id: professorId },
                recipientStudent: { id: alunoId },
            };

            console.log('Dados do feedback escrito a serem enviados:', feedbackData);

            const response = await axios.post('http://10.0.2.2:3000/api/feedbackTeacher', feedbackData);
            Alert.alert('Sucesso', 'Feedback escrito enviado com sucesso!');
            console.log('Resposta do servidor:', response.data);

            // Limpa o campo de feedback após o envio
            setConteudoFeedback('');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o feedback escrito. Tente novamente.');
            console.error('Erro ao enviar feedback escrito:', error.response ? error.response.data : error.message);
        }
    };

    const renderPergunta = (pergunta, index) => {
        return (
            <View key={index} style={styles.containerPerguntas}>
                <Perguntas numero={(index + 1).toString()} text={pergunta} />
                <View style={styles.avaliacaoContainer}>
                    {[...Array(10)].map((_, i) => (
                        <Avaliacao
                            key={i}
                            numero={(i + 1).toString()}
                            selected={ratings[index] === i + 1}
                            onPress={() => {
                                const newRatings = [...ratings];
                                newRatings[index] = i + 1; // Atualiza o valor da avaliação para a pergunta correspondente
                                setRatings(newRatings);
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    };

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

    // Dados para o gráfico
    const data = {
        labels: ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'],
        datasets: [{
            data: graphData, // Usa os dados do gráfico (não as respostas atuais)
            colors: [
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6'
            ]
        }]
    };

    const perguntas = [
        "Nível de Engajamento (O quanto a aula prendeu a atenção e motivou a participação?)",
        "Nível de Desempenho (O quanto o aluno demonstrou compreensão do conteúdo?)",
        "Nível de Entrega (O quanto o aluno entregou as atividades propostas?)",
        "Nível de Atenção (O quanto o aluno se manteve focado durante a aula?)",
        "Nível de Comportamento (O quanto o aluno se comportou adequadamente?)",
    ];

    return (
        <ScrollView>
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <HeaderSimples titulo="PERFIL" />
                <View style={{ padding: 15 }}>
                    <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor, marginTop: 0 }]} source={require('../../../assets/image/barraAzul.png')} />
                    <View style={[styles.form, {
                        backgroundColor: formBackgroundColor, shadowColor: isDarkMode ? '#FFF' : '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }]}>
                        <View style={styles.linhaUser}>
                            <Image source={require('../../../assets/image/Perfill.png')} />
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
                            <View style={[styles.campo,]}>
                                <Text style={[styles.label, { color: textColor }]}>
                                    Telefone
                                </Text>
                                <View style={[styles.inputContainer, { backgroundColor: fundoColor }]}>
                                    <Text
                                        style={[styles.colorInput, { color: textInputColor }]}
                                    >
                                        {aluno.telefoneAluno}
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.campo]}>
                                <Text style={[styles.label, { color: textColor }]}>
                                    Data de Nascimento
                                </Text>
                                <View style={[styles.inputContainer, { backgroundColor: fundoColor }]}>
                                    <Text
                                        style={[styles.colorInput, { color: textInputColor }]}
                                    >
                                        {formatarData(aluno.dataNascimentoAluno)} {/* Formata a data */}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <Campo label="Turma" text={aluno.turma.nomeTurma} textColor={textColor} />
                    </View>
                    <View style={[styles.grafico, { shadowColor: sombra, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, backgroundColor: formBackgroundColor }]}>
                        <View style={{ width: '100', alignItems: 'flex-start' }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
                                    Bimestre
                                </Text>
                                <Picker
                                    selectedValue={bimestre}
                                    onValueChange={(itemValue) => setBimestre(itemValue)}
                                    style={{ width: 100, height: 50 }}
                                >
                                    <Picker.Item label="1" value={1} />
                                    <Picker.Item label="2" value={2} />
                                    <Picker.Item label="3" value={3} />
                                    <Picker.Item label="4" value={4} />
                                </Picker>
                            </View>
                        </View>

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
                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#0077FF', fontSize: 16, fontWeight: 'bold' }}>
                                Dê seu feedback sobre o aluno(a)!
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: textColor }}>
                                Avalie os seguintes aspectos de 1 a 10 para nos ajudar a melhorar a experiência das aulas.
                            </Text>
                            <Swiper
                                loop={false}
                                showsPagination={true}
                                dotColor="#CCC"
                                activeDotColor="#1E6BE6"
                                style={styles.swiper}
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

                    {/* Input para escrever sobre o aluno */}
                    <View style={[styles.feedbackContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.feedbackLabel, { color: textColor }]}>Escreva sobre esse aluno:</Text>
                        <TextInput
                            style={[styles.feedbackInput, { color: textColor, borderColor: textColor }]}
                            placeholder="Digite seu feedback..."
                            placeholderTextColor={textColor}
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
        alignItems: 'flex-end'
    },
    chart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    barraAzul: {
        width: 382,
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
});