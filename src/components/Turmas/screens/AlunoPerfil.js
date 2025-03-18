import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Perguntas from '../../Feedback/Perguntas';
import Avaliacao from '../../Feedback/Avaliacao';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AlunoPerfil({ route }) {
    const { isDarkMode } = useTheme();
    const { alunoId } = route.params; // Recebe o ID do aluno como parâmetro
    const [aluno, setAluno] = useState(null); // Estado para armazenar os dados do aluno
    const [loading, setLoading] = useState(true); // Estado para controlar o carregamento
    const [error, setError] = useState(null); // Estado para armazenar erros
    const [ratings, setRatings] = useState(Array(5).fill(0)); // Estado para armazenar as avaliações de cada pergunta
    const [bimestre, setBimestre] = useState(1); // Estado para armazenar o bimestre selecionado

    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const sombra = isDarkMode ? '#FFF' : '#000';

    // Requisição para buscar os dados do aluno
    useEffect(() => {
        const fetchAluno = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:3000/api/student/${alunoId}`);
                setAluno(response.data); // Armazena os dados do aluno
            } catch (error) {
                setError('Erro ao carregar os dados do aluno. Tente novamente mais tarde.');
                console.error('Erro ao buscar dados do aluno:', error);
            } finally {
                setLoading(false); // Finaliza o carregamento
            }
        };

        fetchAluno();
    }, [alunoId]);

    // Função para enviar o feedback
    const enviarFeedback = async () => {
        if (ratings.some(rating => rating === 0)) {
            Alert.alert('Erro', 'Por favor, avalie todas as perguntas antes de enviar.');
            return;
        }

        try {
            const professorId = await AsyncStorage.getItem('@user_id'); // Substitua pelo ID do professor logado
            const feedbackData = {
                resposta1: ratings[0],
                resposta2: ratings[1],
                resposta3: ratings[2],
                resposta4: ratings[3],
                resposta5: ratings[4],
                bimestre: bimestre,
                createdBy: { id: professorId },
                recipientStudent: { id: alunoId },
            };

            const response = await axios.post('http://10.0.2.2:3000/api/feedbackForm', feedbackData);
            Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
            console.log('Resposta do servidor:', response.data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível enviar o feedback. Tente novamente.');
            console.error('Erro ao enviar feedback:', error);
        }
    };

    // Exibir um indicador de carregamento enquanto os dados são buscados
    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: perfilBackgroundColor }]}>
                <ActivityIndicator size="large" color="#1E6BE6" />
            </View>
        );
    }

    // Exibir uma mensagem de erro se ocorrer um problema
    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: perfilBackgroundColor }]}>
                <Text style={{ color: textColor, textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    // Se não houver dados do aluno, exibir uma mensagem
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
            data: [80, 50, 90, 70, 40],
            colors: [
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6'
            ]
        }]
    };

    // Perguntas para o carrossel
    const perguntas = [
        "Nível de Engajamento (O quanto a aula prendeu a atenção e motivou a participação?)",
        "Nível de Desempenho (O quanto o aluno demonstrou compreensão do conteúdo?)",
        "Nível de Entrega (O quanto o aluno entregou as atividades propostas?)",
        "Nível de Atenção (O quanto o aluno se manteve focado durante a aula?)",
        "Nível de Comportamento (O quanto o aluno se comportou adequadamente?)",
    ];

    // Função para renderizar cada item do carrossel
    // Função para renderizar cada item do carrossel
    const renderPergunta = (pergunta, index) => {
        return (
            <View key={index} style={[styles.containerPerguntas, { backgroundColor: perfilBackgroundColor }]}>
                <Perguntas numero={(index + 1).toString()} text={pergunta} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                    {[...Array(10)].map((_, i) => (
                        <Avaliacao
                            key={i}
                            numero={(i + 1).toString()}
                            selected={ratings[index] === i + 1} // Marca a avaliação selecionada
                            onPress={() => {
                                const newRatings = [...ratings];
                                newRatings[index] = i + 1; // Atualiza o estado com a avaliação selecionada
                                setRatings(newRatings);
                            }}
                        />
                    ))}
                </View>
            </View>
        );
    };

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
                            <Campo label="Telefone" text={aluno.telefoneAluno} textColor={textColor} />
                            <Campo label="Data de Nascimento" text={aluno.dataNascimentoAluno} textColor={textColor} />
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
                                <TouchableOpacity style={{ backgroundColor: '#D24C4C', width: 120, alignItems: 'center', borderRadius: 8, padding: 5 }}>
                                    <Text style={{ color: 'white' }}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
        paddingBottom: 35
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
});