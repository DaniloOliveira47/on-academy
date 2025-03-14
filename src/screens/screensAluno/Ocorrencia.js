import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Modal } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import { BarChart } from 'react-native-chart-kit';

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState(" 1º Bim.");
    const [professores, setProfessores] = useState([]);
    const [professorSelecionado, setProfessorSelecionado] = useState(null); // Estado para o professor selecionado
    const [titulo, setTitulo] = useState(''); // Estado para o título do feedback
    const [conteudo, setConteudo] = useState(''); // Estado para o conteúdo do feedback
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const screenWidth = Dimensions.get('window').width - 40;

    useEffect(() => {
        axios.get('http://10.0.2.2:3000/api/teacher')
            .then(response => {
                setProfessores(response.data);
            })
            .catch(error => {
                console.error('Erro ao buscar professores:', error);
            });
    }, []);

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

    const tipos = ["Aproveitamento", "Comportamento", "Conselho", "Evasão", "Frequência", "Orientação", "Saúde Mental"];

    // Função para selecionar o professor
    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
    };

    // Função para enviar o feedback
    const enviarFeedback = () => {
        if (!professorSelecionado || !titulo || !conteudo) {
            Alert.alert('Erro', 'Preencha todos os campos antes de enviar.');
            return;
        }

        const feedback = {
            professorId: professorSelecionado.id,
            titulo: titulo,
            conteudo: conteudo,
        };

        console.log('Feedback enviado:', feedback);

        // Aqui você pode fazer uma requisição POST para enviar o feedback
        // axios.post('http://10.0.2.2:3000/api/feedback', feedback)
        //     .then(response => {
        //         Alert.alert('Sucesso', 'Feedback enviado com sucesso!');
        //     })
        //     .catch(error => {
        //         console.error('Erro ao enviar feedback:', error);
        //         Alert.alert('Erro', 'Não foi possível enviar o feedback.');
        //     });

        // Limpa os campos após o envio
        setProfessorSelecionado(null);
        setTitulo('');
        setConteudo('');
    };

    return (
        <ScrollView>
            <HeaderSimples titulo="FEEDBACK" />
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <View style={{
                    backgroundColor: formBackgroundColor, padding: 20, borderRadius: 20
                }}>
                    <View style={{ width: '100%', alignItems: 'flex-end', marginLeft: 12 }}>
                        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 5 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
                                Bimestre
                            </Text>
                            <TouchableOpacity style={{ backgroundColor: perfilBackgroundColor, padding: 8, width: 32, alignItems: 'center', borderTopRightRadius: 10, borderTopLeftRadius: 10 }}>
                                <Text style={{ color: 'blue', fontSize: 18, fontWeight: 'bold' }}>
                                    v
                                </Text>
                            </TouchableOpacity>
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        {professores.slice(0, 2).map((professor, index) => (
                            <CardProfessor
                                key={index}
                                nome={"Prof - " + professor.nomeDocente}
                                id={professor.id}
                                onPress={() => selecionarProfessor(professor)} // Passa a função para selecionar o professor
                                selecionado={professorSelecionado?.id === professor.id} // Destaca o card selecionado
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

                    {/* Campos de Título e Conteúdo */}
                    <TextInput
                        style={[styles.input, { backgroundColor: perfilBackgroundColor, color: textColor }]}
                        placeholder="Título do Feedback"
                        placeholderTextColor={textColor}
                        value={titulo}
                        onChangeText={setTitulo}
                    />
                    <TextInput
                        style={[styles.input, { backgroundColor: perfilBackgroundColor, color: textColor, height: 100 }]}
                        placeholder={`Escreva aqui seu feedback para o prof(a) ${professorSelecionado ? professorSelecionado.nomeDocente : '...'}`}
                        placeholderTextColor={textColor}
                        multiline
                        value={conteudo}
                        onChangeText={setConteudo}
                    />

                    {/* Botão de Enviar */}
                    <TouchableOpacity
                        style={styles.botaoEnviar}
                        onPress={enviarFeedback}
                    >
                        <Text style={{ color: 'white' }}>
                            Enviar
                        </Text>
                    </TouchableOpacity>
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