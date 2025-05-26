import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import CardMateria from '../../components/Boletim/CardMateria';
import Nota from '../../components/Boletim/Nota';
import { useTheme } from '../../path/ThemeContext';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Boletim() {
    const [modalVisible, setModalVisible] = useState(false);
    const [bimestreSelecionado, setBimestreSelecionado] = useState("1º Bim.");
    const [notas, setNotas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [aluno, setAluno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const bimestres = ["1º Bim.", "2º Bim.", "3º Bim.", "4º Bim."];
    const { isDarkMode } = useTheme();
    const BackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const container = isDarkMode ? '#000' : '#FFF';
    const text = isDarkMode ? '#FFF' : '#000';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const alunoId = await AsyncStorage.getItem('@user_id');
                const alunoResponse = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`);

                setAluno(alunoResponse.data);

                const disciplinasDoAluno = alunoResponse.data.turma.disciplinaTurmas.map(d => ({
                    id: d.id,
                    nomeDisciplina: d.nomeDisciplina.trim()
                }));

                setDisciplinas(disciplinasDoAluno);
                setNotas(alunoResponse.data.notas || []);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                Alert.alert("Erro", "Não foi possível carregar os dados do boletim");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getNotasPorBimestre = (bimestre) => {
        const bimestreNumero = parseInt(bimestre[0]);
        const notasDoBimestre = notas.filter(nota => nota.bimestre === bimestreNumero);

        return disciplinas.map(disciplina => {
            const notaDaDisciplina = notasDoBimestre.find(nota =>
                nota.nomeDisciplina.trim() === disciplina.nomeDisciplina
            );
            return {
                disciplina: disciplina.nomeDisciplina,
                nota: notaDaDisciplina ? notaDaDisciplina.nota : '-',
            };
        });
    };

    const notasBimestreSelecionado = getNotasPorBimestre(bimestreSelecionado);

    const downloadAndSavePDF = async () => {
        try {
            setDownloading(true);
            const alunoId = await AsyncStorage.getItem('@user_id');
            const url = `https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/boletim/${alunoId}`;
            const fileName = `boletim_${alunoId}_${new Date().toISOString().slice(0, 10)}.pdf`;

            const downloadUri = FileSystem.cacheDirectory + fileName;
            const { uri } = await FileSystem.downloadAsync(url, downloadUri);

            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists || fileInfo.size === 0) {
                throw new Error('O arquivo PDF está vazio');
            }

            if (Platform.OS === 'android') {
                try {
                    const { status } = await MediaLibrary.requestPermissionsAsync();
                    if (status !== 'granted') {
                        throw new Error('Permissão para acessar arquivos foi negada');
                    }

                    const asset = await MediaLibrary.createAssetAsync(uri);
                    await MediaLibrary.createAlbumAsync('Downloads', asset, false);

                    Alert.alert(
                        'Sucesso',
                        'Boletim salvo na pasta Downloads',
                        [
                            {
                                text: 'Abrir',
                                onPress: () => openPDF(uri)
                            },
                            { text: 'OK' }
                        ]
                    );
                    return;
                } catch (mediaError) {
                    console.warn('Erro ao salvar com MediaLibrary:', mediaError);
                }
            }

            await shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Salvar Boletim',
                UTI: 'com.adobe.pdf'
            });

        } catch (error) {
            console.error('Erro completo:', error);
            Alert.alert(
                'Erro',
                error.message || 'Não foi possível salvar o boletim'
            );
        } finally {
            setDownloading(false);
        }
    };

    const openPDF = async (uri) => {
        try {
            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(uri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: 'application/pdf'
                });
            } else {
                await shareAsync(uri, {
                    mimeType: 'application/pdf',
                    UTI: 'com.adobe.pdf'
                });
            }
        } catch (error) {
            Alert.alert('Erro', 'Nenhum aplicativo encontrado para abrir PDF');
        }
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: BackgroundColor }]}>
                <ActivityIndicator size="large" color="#0077FF" />
                <Text style={[styles.loadingText, { color: text }]}>Carregando boletim...</Text>
            </View>
        );
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false}>

            <View>

                <HeaderSimples titulo="BOLETIM" />

                <View style={[styles.tela, { backgroundColor: BackgroundColor, paddingBottom: 70 }]}>

                    <View style={{
                        backgroundColor: container,
                        marginTop: 10,
                        padding: 20,
                        borderRadius: 20,
                        paddingTop: 30,
                        shadowColor: '#000',
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
                                    <Text style={styles.contText}>Matéria</Text>
                                </View>
                                <View style={styles.containers}>
                                    <Text style={styles.contText}>{bimestreSelecionado}</Text>
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
                                onPress={downloadAndSavePDF}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <ActivityIndicator size="small" color="#0077FF" />
                                ) : (
                                    <>
                                        <Image source={require('../../assets/image/baixar.png')} />
                                        <Text style={{ fontSize: 18, color: isDarkMode ? '#FFF' : '#000', fontWeight: 'bold' }}>PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>

                        <Modal visible={modalVisible} transparent animationType="fade">
                            <TouchableOpacity
                                style={styles.modalOverlay}
                                onPress={() => setModalVisible(false)}
                                activeOpacity={1}
                            >
                                <View style={[styles.modalContainer, {
                                    backgroundColor: isDarkMode ? '#141414' : '#FFF'
                                }]}>
                                    {/* Cabeçalho com logo */}
                                    <View style={[styles.modalHeader, {
                                        backgroundColor: isDarkMode ? '#0077FF' : '#0077FF'
                                    }]}>
                                        <View style={[styles.logoSquare, {
                                            backgroundColor: isDarkMode ? '#333' : '#FFF'
                                        }]}>
                                            <Image
                                                source={require('../../assets/image/logo.png')}
                                                style={styles.logo}
                                                resizeMode="contain"
                                            />
                                        </View>

                                    </View>

                                    <Text style={[styles.modalTitle, {
                                        color: isDarkMode ? '#FFF' : '#000'
                                    }]}>
                                        Selecione o Bimestre
                                    </Text>


                                    <FlatList
                                        data={bimestres}
                                        keyExtractor={(item) => item}
                                        style={styles.modalList}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[styles.modalItem, {
                                                    borderBottomColor: isDarkMode ? '#444' : '#EEE'
                                                }]}
                                                onPress={() => {
                                                    setBimestreSelecionado(item);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text style={[styles.modalText, {
                                                    color: isDarkMode ? '#FFF' : '#333'
                                                }]}>
                                                    {item === 'Todas as Notas' ? item : `${item}º Bimestre`}
                                                </Text>

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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
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
    },
    icone: {
        width: 20,
        height: 12,
        marginTop: 0
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '85%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        maxHeight: '70%',
    },
    modalHeader: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 25,
    },
    logoSquare: {
        width: 70,
        height: 70,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logo: {
        width: 50,
        height: 50,
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 15,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    modalList: {
        width: '100%',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    modalText: {
        fontSize: 16,
    },
});