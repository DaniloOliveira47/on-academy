import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

export default function AlunoPerfil() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

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
                </View>
                <View style={styles.grafico}>
                <BarChart
    data={data}
    width={screenWidth}
    height={200}
    yAxisSuffix="%"
    fromZero
    withInnerLines={false}
    withHorizontalLabels={false}
    showBarTops={false}
    withCustomBarColorFromData={true}
    flatColor={true}
    chartConfig={{
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: () => '#1E6BE6',
        labelColor: () => '#000',
        barPercentage: 1.2,
        fillShadowGradient: '#A9C1F7',
        fillShadowGradientOpacity: 1,
    }}
    style={[styles.chart, { alignItems: 'center' }]}
/>

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
    grafico: {
        alignItems: 'center'
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
