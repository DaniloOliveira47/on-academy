import React, { useState } from 'react'
import HeaderSimples from '../../components/Gerais/HeaderSimples'
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { useTheme } from '../../path/ThemeContext'
import CardOcorrencia from '../../components/Ocorrência/CardOcorrencia'
import CardProfessor from '../../components/Ocorrência/CardProfessor'
import { BarChart } from 'react-native-chart-kit'

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState(" 1º Bim.");
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const screenWidth = Dimensions.get('window').width - 40;

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
    return (
        <ScrollView>
            <HeaderSimples
                titulo="FEEDBACK"
            />
            <View style={[styles.tela, {backgroundColor: perfilBackgroundColor}]}>
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

                <View style={[styles.container2, {backgroundColor: formBackgroundColor}]}>
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
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20, marginBottom: 20 }}>
                        <TextInput style={{ backgroundColor: perfilBackgroundColor, borderRadius: 10, width: 260, fontSize: 11, color: textColor }}
                            placeholder='Escreva aqui seu feedback para o prof(a) Karla Dias'
                            placeholderTextColor={textColor}
                        />
                        <TouchableOpacity style={{ backgroundColor: '#0077FF', padding: 7, borderRadius: 10 }}>
                            <Text style={{ color: 'white' }}>
                                Enviar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Modal visible={modalVisible} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                        <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
                            <FlatList
                                data={tipos}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setTipoSelecionado(item);
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </ScrollView>
    )
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
    grupoText: {
        marginLeft: 5
    },
    filtro: {
        backgroundColor: '#8A8A8A',
        flexDirection: 'row',
        marginTop: 32,
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 7
    },
    filtroTexto: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    conteudo: {
        marginTop: 35,
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingBottom: 40,
        padding: 10,
    },
    headerTabela: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#8A8A8A',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
        marginBottom: 10
    },
    headerTexto: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    perfil: {
        position: 'absolute',
        flexDirection: 'row',
        marginTop: -35,
        marginLeft: 20,
        alignItems: 'center'
    },
    barraAzul: {
        width: '100%',
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        height: 60
    },
    form: {
        backgroundColor: 'white',
        height: 'auto',
        width: '100%',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077FF',
        width: '100%',
        padding: 10,
        borderRadius: 13,
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
    },
    textoBotao: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        marginRight: 10,
        fontWeight: 'bold'
    },
    icone: {
        width: 20,
        height: 12,
        marginTop: 0
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
})
