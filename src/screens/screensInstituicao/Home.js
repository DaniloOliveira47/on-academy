import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, TouchableOpacity, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../path/ThemeContext';
import CardTurmas from '../../components/Home/CardTurmas';
import Avisos from '../../components/Home/Avisos';
import HeaderIns from '../../components/Home/HeaderIns';
import CustomAlert from '../../components/Gerais/CustomAlert';

export default function HomeInstituicao() {
    const { isDarkMode } = useTheme();
    const [scrollY] = useState(new Animated.Value(0));
    const [turmas, setTurmas] = useState([]);
    const [conteudoAviso, setConteudoAviso] = useState('');
    const [avisos, setAvisos] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [loadingTurmas, setLoadingTurmas] = useState(true);
    const [loadingAvisos, setLoadingAvisos] = useState(true);
    const [sendingAviso, setSendingAviso] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    setLoadingTurmas(true);
                    setLoadingAvisos(true);

                    const turmasResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class');
                    if (turmasResponse.data && Array.isArray(turmasResponse.data)) {
                        setTurmas(turmasResponse.data);
                    } else {
                        setTurmas([]);
                    }
                    setLoadingTurmas(false);

                    const avisosResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/reminder');
                    const avisosOrdenados = avisosResponse.data.sort((a, b) =>
                        new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
                    );
                    setAvisos(avisosOrdenados);
                    setLoadingAvisos(false);
                } catch {
                    setTurmas([]);
                    setAvisos([]);
                    setLoadingTurmas(false);
                    setLoadingAvisos(false);
                }
            };

            fetchData();
        }, [])
    );

    const handleSelecionarTurma = (id) => {
        setTurmaSelecionada(id);
    };

    const gerarCorAleatoria = () => {
    const letrasHex = '0123456789ABCDEF';
    let cor = '#';
    
    // Gera os 6 dígitos da cor hexadecimal
    for (let i = 0; i < 6; i++) {
        cor += letrasHex[Math.floor(Math.random() * 16)];
    }
    
    return cor;
};

    const enviarAviso = async () => {
        try {
            setSendingAviso(true);

            if (!turmaSelecionada) {
                setAlertTitle('Aviso');
                setAlertMessage('Por favor, selecione uma turma para postar o aviso');
                setAlertVisible(true);
                setSendingAviso(false);
                return;
            }

            const instituicaoId = await AsyncStorage.getItem('@user_id');
            const token = await AsyncStorage.getItem('@user_token');

            if (!instituicaoId || !token) {
                setAlertTitle('Erro');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                setSendingAviso(false);
                return;
            }

            const avisoTexto = conteudoAviso.trim();

            if (!avisoTexto) {
                setAlertTitle('Aviso');
                setAlertMessage('Por favor, digite um aviso ou lembrete para a turma antes de enviar.');
                setAlertVisible(true);
                setSendingAviso(false);
                return;
            }

            if (avisoTexto.length > 100) {
                setAlertTitle('Aviso muito longo');
                setAlertMessage('O aviso não pode ultrapassar 100 caracteres.');
                setAlertVisible(true);
                setSendingAviso(false);
                return;
            }

            const avisoData = {
                conteudo: avisoTexto,
                createdByInstitution: { id: parseInt(instituicaoId) },
                classSt: { id: turmaSelecionada },
            };

            await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/reminder', avisoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const avisosResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/reminder');
            const avisosOrdenados = avisosResponse.data.sort((a, b) =>
                new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
            );
            setAvisos(avisosOrdenados);

            setAlertTitle('Sucesso');
            setAlertMessage('Aviso enviado com sucesso!');
            setAlertVisible(true);
            setConteudoAviso('');
            setSendingAviso(false);
        } catch (error) {
            setAlertTitle('Erro');
            setAlertMessage(error.response?.data?.message || 'Falha ao enviar o aviso.');
            setAlertVisible(true);
            setSendingAviso(false);
        }
    };

    return (
        <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <HeaderIns isDarkMode={isDarkMode} />

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
                                Seja bem-vinda, Instituição 👋
                            </Text>
                            <Text style={[styles.subtitulo, { color: '#FFF' }]}>
                                O sucesso é a soma de pequenos esforços repetidos dia após dia.
                            </Text>
                        </View>
                        <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
                    </View>

                    {/* Container de Turmas */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Turmas</Text>
                        {loadingTurmas ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={isDarkMode ? '#A1C9FF' : '#0077FF'} />
                            </View>
                        ) : (
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
                                            subTitulo={`Sala ${turma.id}`}
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
                        )}
                    </View>

                    {/* Container de Aviso */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Aviso</Text>
                        <TextInput
                            style={[
                                styles.contAviso,
                                {
                                    backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
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
                            <TouchableOpacity
                                style={[styles.enviarButton, sendingAviso && styles.disabledButton]}
                                onPress={enviarAviso}
                                disabled={sendingAviso}
                            >
                                {sendingAviso ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.enviarText}>Enviar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Container de Avisos */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF', marginBottom: 10 }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>
                            Avisos
                        </Text>
                        {loadingAvisos ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={isDarkMode ? '#A1C9FF' : '#0077FF'} />
                            </View>
                        ) : (
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
                        )}
                    </View>
                </View>
            </ScrollView>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />
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
        padding: 15
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
        right: -17,
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
    disabledButton: {
        backgroundColor: '#8FBFFF',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 100,
    },
});