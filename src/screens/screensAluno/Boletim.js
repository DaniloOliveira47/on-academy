import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import CardMateria from '../../components/Boletim/CardMateria';
import Nota from '../../components/Boletim/Nota';
import { useTheme } from '../../path/ThemeContext';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system'; // Para baixar o PDF
import * as Print from 'expo-print'; // Para visualizar o PDF
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Boletim() {
    const [modalVisible, setModalVisible] = useState(false);
    const [bimestreSelecionado, setBimestreSelecionado] = useState("1º Bim.");
    const [notas, setNotas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [aluno, setAluno] = useState(null);

    const bimestres = ["1º Bim.", "2º Bim.", "3º Bim.", "4º Bim."];
    const { isDarkMode } = useTheme();
    const BackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const container = isDarkMode ? '#000' : '#FFF';
    const text = isDarkMode ? '#FFF' : '#000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Busca as disciplinas
                const disciplinasResponse = await axios.get('http://192.168.15.120:3000/api/discipline');
                setDisciplinas(disciplinasResponse.data);

                // Busca os dados do aluno e suas notas
                const alunoId = await AsyncStorage.getItem('@user_id'); // Substitua pelo ID do aluno logado
                const alunoResponse = await axios.get(`http://192.168.15.120:3000/api/student/${alunoId}`);
                setAluno(alunoResponse.data);
                setNotas(alunoResponse.data.notas);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, []);

    // Função para combinar disciplinas com notas
    const getNotasPorBimestre = (bimestre) => {
        const bimestreNumero = parseInt(bimestre[0]); // Extrai o número do bimestre (1, 2, 3, 4)
        const notasDoBimestre = notas.filter(nota => nota.bimestre === bimestreNumero);

        // Combina as disciplinas com as notas
        return disciplinas.map(disciplina => {
            const notaDaDisciplina = notasDoBimestre.find(nota => nota.nomeDisciplina === disciplina.nomeDisciplina);
            return {
                disciplina: disciplina.nomeDisciplina,
                nota: notaDaDisciplina ? notaDaDisciplina.nota : '-', // Se não houver nota, exibe '-'
            };
        });
    };

    const notasBimestreSelecionado = getNotasPorBimestre(bimestreSelecionado);

    // Função para baixar e visualizar o boletim
    const downloadAndViewBoletim = async () => {
        const alunoId = await AsyncStorage.getItem('@user_id'); // Obtém o ID do aluno logado
        const url = `http://192.168.15.120:3000/api/boletim/${alunoId}`; // URL do boletim com o ID do aluno
        const fileName = 'boletim.pdf'; // Nome do arquivo
        const fileUri = `${FileSystem.documentDirectory}${fileName}`; // Caminho onde o arquivo será salvo

        try {
            console.log('Iniciando download do boletim...');
            const { uri } = await FileSystem.downloadAsync(url, fileUri);

            console.log('Boletim baixado em:', uri);

            // Verifica se o arquivo foi baixado corretamente
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists) {
                Alert.alert('Sucesso', 'Boletim baixado com sucesso!');

                // Abre o PDF com o expo-print
                console.log('Abrindo o PDF...');
                await Print.printAsync({
                    uri: uri, // URI do arquivo baixado
                });
            } else {
                Alert.alert('Erro', 'O boletim não foi baixado corretamente.');
            }
        } catch (error) {
            console.error('Erro ao baixar ou visualizar o boletim:', error);
            Alert.alert('Erro', 'Não foi possível baixar ou visualizar o boletim.');
        }
    };

    return (
        <ScrollView>
            <View>
                <HeaderSimples titulo="BOLETIM" />
                <View style={[styles.tela, { backgroundColor: BackgroundColor, paddingBottom: 70 }]}>
                    <View style={{
                        backgroundColor: container, marginTop: 10, padding: 20, borderRadius: 20, paddingTop: 30, shadowColor: '#000',
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

                                <View style={styles.column}>
                                    {notasBimestreSelecionado.map((item, index) => (
                                        <CardMateria key={index} materia={item.disciplina} />
                                    ))}
                                </View>
                                <View style={styles.column}>
                                    {notasBimestreSelecionado.map((item, index) => (
                                        <Nota key={index} nota={item.nota.toString()} />
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    borderWidth: 2,
                                    width: 100,
                                    padding: 8,
                                    justifyContent: 'space-around',
                                    borderRadius: 10,
                                    borderColor: '#0077FF',
                                    marginLeft: 16,
                                }}
                                onPress={downloadAndViewBoletim} // Chama a função de download e visualização
                            >
                                <Image source={require('../../assets/image/baixar.png')} />
                                <Text style={{ fontSize: 18, color: '#000', fontWeight: 'bold' }}>PDF</Text>
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
        </ScrollView>
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
});