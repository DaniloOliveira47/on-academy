import React, { useState } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import CardMateria from '../../components/Boletim/CardMateria';
import Nota from '../../components/Boletim/Nota';
import BarraAzul from '../../components/Boletim/barraAzul';
import { useTheme } from '../../path/ThemeContext';

export default function Boletim() {
    const [modalVisible, setModalVisible] = useState(false);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(" 1º Bim.");

    const bimestres = ["1º Bim.", "2º Bim.", "3º Bim.", "4º Bim."];
    const notas = [
        { materia: 'Português', nota: 98.5 },
        { materia: 'Matemática', nota: 75.6 },
        { materia: 'Inglês', nota: 90.6 },
        { materia: 'Ciências', nota: 60.2 },
        { materia: 'Artes', nota: 85.3 },
    ];
    const { isDarkMode } = useTheme();
    const BackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const container = isDarkMode ? '#000' : '#FFF'
    const text = isDarkMode ? '#FFF' : '#000'



    return (
        <View>
            <HeaderSimples
                titulo="BOLETIM"
            />
            <View style={[styles.tela, { backgroundColor: BackgroundColor }]}>

                <View style={{
                    backgroundColor: container, marginTop: 40, padding: 20, borderRadius: 20, paddingTop: 30, shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                }}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={styles.botao}>
                            <Text style={styles.textoBotao}>Selecione o Bimestre</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <View style={{
                                    backgroundColor: '#0077FF',
                                    padding: 10,
                                    borderRadius: 20,
                                    height: 28,
                                    width: 28,
                                    alignItems: 'center'
                                }}>
                                    <Image style={styles.icone} source={require('../../assets/image/OptionWhite.png')} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.boletim}>
                        <View style={styles.titulos}>
                            <View style={styles.containers}>
                                <Text style={styles.contText}>
                                    Matéria
                                </Text>
                            </View>
                            <View style={styles.containers}>
                                <Text style={styles.contText}>
                                    {bimestreSelecionado}
                                </Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <BarraAzul />
                            <View style={styles.column}>
                                <CardMateria materia="Português" />
                                <CardMateria materia="Matemática" />
                                <CardMateria materia="Inglês" />
                                <CardMateria materia="Ciências" />
                                <CardMateria materia="Artes" />
                            </View>
                            <View style={styles.column}>
                                <Nota nota="98.5" />
                                <Nota nota="75.6" />
                                <Nota nota="90.6" />
                                <Nota nota="60.2" />
                                <Nota nota="85.3" />
                            </View>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, width: 100, padding: 8, justifyContent: 'space-around', borderRadius: 10, borderColor: '#0077FF', marginLeft: 16 }}>
                            <Image source={require('../../assets/image/baixar.png')} />
                            <Text style={{ fontSize: 18, color: text, fontWeight: 'bold' }}>PDF</Text>
                        </TouchableOpacity>
                    </View>

                    <Modal visible={modalVisible} transparent animationType="fade">
                        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                            <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
                                <FlatList
                                    data={bimestres}
                                    keyExtractor={(item) => item}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.modalItem}
                                            onPress={() => {
                                                setBimestreSelecionado(item);
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
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    boletim: {
        padding: 6
    },
    column: {
        marginTop: 30
    },
    contText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Epilogue-Bold'
    },
    containers: {
        backgroundColor: '#0077FF',
        padding: 16,
        borderRadius: 13,
        width: 130,
        alignItems: 'center'
    },
    tela: {
        padding: 15,
        paddingTop: 0,
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
    },
    titulos: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077FF',
        width: 350,
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
})