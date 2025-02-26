import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Perguntas from '../../Feedback/Perguntas';
import Avaliacao from '../../Feedback/Avaliacao';


export default function AlunoPerfil() {
    const { isDarkMode } = useTheme();
    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const sombra = isDarkMode ? '#FFF' : '#000';

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
    const ocorrencias = [
        { id: '1', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '2', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '3', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '4', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
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
                                    <Text style={[styles.nome, { color: textColor }]}>Renata Vieira</Text>
                                    <Text style={{ color: 'green' }}>(Ativo)</Text>
                                </View>
                                <Text style={[styles.email, { color: textColor }]}>revieira@gmail.com</Text>
                            </View>
                        </View>
                        <Campo label="Nome Completo" text="Renata Vieira de Souza" textColor={textColor} />
                        <Campo label="Email" text="revieira@gmail.com" textColor={textColor} />
                        <Campo label="Nº Matrícula" text="1106434448-1" textColor={textColor} />
                        <View style={styles.doubleCampo}>
                            <Campo label="Telefone" text="(11) 95312-8203" textColor={textColor} />
                            <Campo label="Data de Nascimento" text="23/01/2006" textColor={textColor} />
                        </View>
                        <Campo label="Turma" text="3 º A" textColor={textColor} />
                    </View>
                    <View style={[styles.grafico, { shadowColor: sombra, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, backgroundColor: formBackgroundColor }]}>
                        <View style={{ width: '100', alignItems: 'flex-start' }}>
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
                        <View style={{ width: '100%', marginTop: 20 }}>
                            <Text style={{ color: '#0077FF', fontSize: 16, fontWeight: 'bold' }}>
                                Dê seu feedback sobre o aluno(a)!
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: 'bold', color: textColor }}>
                                Avalie os seguintes aspectos de 1 a 10 para nos ajudar a melhorar a experiência das aulas.
                            </Text>
                            <View style={[styles.containerPerguntas, { backgroundColor: perfilBackgroundColor }]}>
                                <Perguntas
                                    numero="1"
                                />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                                    <Avaliacao
                                        numero="1"
                                    />
                                    <Avaliacao
                                        numero="2"
                                    />
                                    <Avaliacao
                                        numero="3"
                                    />
                                    <Avaliacao
                                        numero="4"
                                    />
                                    <Avaliacao
                                        numero="5"
                                    />
                                    <Avaliacao
                                        numero="6"
                                    />
                                    <Avaliacao
                                        numero="7"
                                    />
                                    <Avaliacao
                                        numero="8"
                                    />
                                    <Avaliacao
                                        numero="9"
                                    />
                                    <Avaliacao
                                        numero="10"
                                    />
                                </View>

                                <View style={styles.linhaPontilhadaContainer}>
                                    <Text style={styles.linhaPontilhada}>● ● ● ● ●</Text>
                                </View>
                            </View>
                            <View style={{ paddingTop: 10, borderTopWidth: 2, marginTop: 20, borderColor: textColor }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: textColor }}>
                                    Adicionar Feedback Escrito
                                </Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: perfilBackgroundColor, marginTop: 20 }]}
                                />
                                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 15 }}>
                                    <TouchableOpacity style={{ backgroundColor: '#0077FF', width: 120, alignItems: 'center', borderRadius: 8, padding: 5 }}>
                                        <Text style={{ color: 'white' }}>
                                            Enviar Respostas
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ backgroundColor: '#D24C4C', width: 120, alignItems: 'center', borderRadius: 8, padding: 5 }}>
                                        <Text style={{ color: 'white' }}>
                                            Cancelar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60
    },
    input: {
        backgroundColor: '#F0F7FF', borderRadius: 10
    },
    linhaPontilhadaContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    linhaPontilhada: {
        fontSize: 20,
        letterSpacing: 10,
        color: 'gray',
        fontWeight: 'bold',
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
    conText: {
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 40,
    },

    titulo: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    subTitulo: {
        fontWeight: 'bold',
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
    botao: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        width: 180,
        padding: 10,
        borderRadius: 13,
        justifyContent: 'space-between',
        gap: 0,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#0077FF'
    },
    textoBotao: {
        color: 'black',
        textAlign: 'center',
        fontSize: 15,
        marginRight: 10,
        fontWeight: 'bold'
    },
    icone: {
        width: 16,
        height: 9,
        marginTop: -1
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
    container: {
        width: '100%',
        alignItems: 'center'
    },
    tabelaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F0F7FF',
        padding: 8,
        marginBottom: 5,
        fontWeight: 'bold',
        borderRadius: 10
    },
    tabelaLinha: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 5,
        marginBottom: 20
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    linhaTexto: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    tabelaContainer: {
        borderBottomWidth: 2,

    }
});
