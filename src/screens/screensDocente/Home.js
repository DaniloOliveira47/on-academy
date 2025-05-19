import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Home/Header';
import { useTheme } from '../../path/ThemeContext';
import CardTurmas from '../../components/Home/CardTurmas';
import Avisos from '../../components/Home/Avisos';
import HeaderDoc from '../../components/Home/HeaderDoc';

export default function HomeDocente() {
    const { isDarkMode } = useTheme();
    const [scrollY] = useState(new Animated.Value(0));
    const [turmas, setTurmas] = useState([]);
    const [conteudoAviso, setConteudoAviso] = useState('');
    const [avisos, setAvisos] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    const handleSelecionarTurma = (id) => {
        setTurmaSelecionada(id);
        console.log('Turma selecionada:', id);
    };

    const gerarCorAleatoria = () => {
        let cor = '#0077FF';
        return cor;
    };


    const fetchMessages = async () => {
        try {
            const { data } = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/reminder');
            data.sort((a, b) =>
                new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
            );
            setAvisos(data);
        } catch (error) {
            console.error('Erro ao carregar avisos:', error);
        }
    };

    const fetchTurmas = async () => {
        try {
            const professorId = await AsyncStorage.getItem('@user_id');
            if (!professorId) {
                setTurmas([]);
                return;
            }
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/classes/${professorId}`);
            console.log('Resposta da API:', response.data);
            if (response.data && Array.isArray(response.data.classes)) {
                setTurmas(response.data.classes);
            } else {
                setTurmas([]);
            }
        } catch (error) {
            console.error('Erro ao carregar turmas:', error);
            setTurmas([]);
        }
    };


    useFocusEffect(
        useCallback(() => {
            fetchTurmas();
            fetchMessages();
        }, [])
    );

    const enviarAviso = async () => {
        try {
            if (!turmaSelecionada) {
                Alert.alert('Aviso', 'Por favor, selecione uma turma.');
                return;
            }
            const professorId = await AsyncStorage.getItem('@user_id');
            const token = await AsyncStorage.getItem('@user_token');
            if (!professorId || !token) {
                Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
                return;
            }
            if (!conteudoAviso.trim()) {
                Alert.alert('Aviso', 'Por favor, digite um aviso antes de enviar.');
                return;
            }
            const avisoData = {
                conteudo: conteudoAviso,
                createdBy: { id: parseInt(professorId) },
                classSt: { id: turmaSelecionada },
            };
            await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/reminder', avisoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            Alert.alert('Sucesso', 'Aviso enviado com sucesso!');
            setConteudoAviso('');

            await fetchMessages();
        } catch (error) {
            console.error('Erro ao enviar aviso:', error);
            Alert.alert('Erro', 'Erro ao enviar aviso. Tente novamente.');
        }
    };

    return (
        <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <HeaderDoc isDarkMode={isDarkMode} />

            <ScrollView style={styles.scrollTela} showsVerticalScrollIndicator={false}>
                <View style={styles.subtela}>

                    <View style={[styles.infoContainer, {
                        backgroundColor: '#1E6BE6',
                        shadowColor: isDarkMode ? '#FFF' : '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                    }]}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.titulo, { color: '#FFF' }]}>
                                Seja bem-vindo, Docente 👋
                            </Text>
                            <Text style={[styles.subtitulo, { color: '#FFF' }]}>
                                O sucesso é a soma de pequenos esforços repetidos dia após dia.
                            </Text>
                        </View>
                        <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
                    </View>


                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Turmas</Text>
                        <ScrollView
                            style={styles.turmasScrollView}
                            contentContainerStyle={styles.turmasScrollContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {turmas.length > 0 ? (
                                turmas.map((turma, index) => (
                                    <CardTurmas
                                        key={turma.id}
                                        titulo={`${turma.nomeTurma}`}
                                        subTitulo={`Sala ${index + 1}`}
                                        isSelected={turmaSelecionada === turma.id}
                                        onPress={() => handleSelecionarTurma(turma.id)}
                                    />
                                ))
                            ) : (
                                <Text style={[styles.emptyMessage, { color: isDarkMode ? '#AAA' : '#555' }]}>
                                    Nenhuma turma disponível
                                </Text>
                            )}
                        </ScrollView>
                    </View>


                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Aviso</Text>
                        <TextInput
                            style={[
                                styles.contAviso,
                                {
                                    backgroundColor: isDarkMode ? '#141414' : '#F0F7FF',
                                    height: 200,
                                    textAlignVertical: 'top',
                                    color: isDarkMode ? '#fff' : '#000'
                                },
                            ]}
                            placeholder="Digite o aviso..."
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            multiline
                            value={conteudoAviso}
                            onChangeText={setConteudoAviso}
                        />
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity style={styles.enviarButton} onPress={enviarAviso}>
                                <Text style={styles.enviarText}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>
                            Avisos
                        </Text>
                        <ScrollView
                            style={styles.avisosScrollView}
                            contentContainerStyle={styles.avisosScrollContent}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                        >
                            {avisos.length > 0 ? (
                                avisos
                                    .filter(aviso => {
                                        const agora = new Date();
                                        const dataAviso = new Date(aviso.horarioSistema);
                                        const diferencaEmDias = (agora - dataAviso) / (1000 * 60 * 60 * 24);
                                        return diferencaEmDias <= 7;
                                    })
                                    .map((aviso) => {
                                        const doisPrimeirosNomes = aviso.criadoPorNome ?
                                            aviso.criadoPorNome.split(' ').slice(0, 2).join(' ') :
                                            'Instituição';

                                        return (
                                            <Avisos
                                                key={aviso.id}
                                                abreviacao={aviso.initials}
                                                nome={doisPrimeirosNomes}
                                                horario={new Date(new Date(aviso.horarioSistema).getTime() - 3 * 60 * 60 * 1000).toLocaleString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                                texto={aviso.conteudo}
                                                aleatorio={gerarCorAleatoria()}
                                            />
                                        );
                                    })

                            ) : (
                                <Text style={[styles.emptyMessage, { color: isDarkMode ? '#AAA' : '#555' }]}>
                                    Nenhum aviso disponível.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: '#F0F7FF'
    },
    scrollTela: {
        flex: 1,
        marginBottom: 40
    },
    contTurmas: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 20,
        padding: 15,
        marginTop: 20
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subtela: {
        paddingTop: 10,
        alignItems: 'center',
        padding: 20
    },
    infoContainer: {
        flexDirection: 'row',
        width: '100%',
        padding: 20,
        borderRadius: 20,
        position: 'relative'
    },
    textContainer: {
        flex: 1,
        zIndex: 2
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        width: 150
    },
    subtitulo: {
        fontSize: 14,
        width: 190
    },
    infoImage: {
        position: 'absolute',
        right: -25,
        bottom: -7,
        width: 200,
        height: 150,
        resizeMode: 'contain'
    },
    emptyMessage: {
        textAlign: 'center',
        marginTop: 10,
        paddingVertical: 20
    },
    contAviso: {
        padding: 10,
        borderRadius: 18,
        marginTop: 8
    },
    enviarButton: {
        backgroundColor: '#1A85FF',
        alignItems: 'center',
        width: 100,
        padding: 8,
        borderRadius: 10,
        marginTop: 10
    },
    enviarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17
    },
    turmasScrollView: {
        maxHeight: Dimensions.get('window').height * 0.3,
    },
    turmasScrollContent: {
        paddingRight: 10,
    },
    avisosScrollView: {
        maxHeight: Dimensions.get('window').height * 0.4,
    },
    avisosScrollContent: {
        paddingRight: 10,
    },
});