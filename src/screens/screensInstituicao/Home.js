import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Home/Header';
import { useTheme } from '../../path/ThemeContext';
import CardTurmas from '../../components/Home/CardTurmas';
import Avisos from '../../components/Home/Avisos';
import HeaderIns from '../../components/Home/HeaderIns';

export default function HomeInstituicao() {
    const { isDarkMode } = useTheme();
    const [scrollY] = useState(new Animated.Value(0));
    const [turmas, setTurmas] = useState([]);
    const [conteudoAviso, setConteudoAviso] = useState('');
    const [avisos, setAvisos] = useState([]);
    const [turmaSelecionada, setTurmaSelecionada] = useState(null);

    // Carrega os dados sempre que a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                try {
                    // Fetch das turmas
                    const turmasResponse = await axios.get('http://192.168.2.11:3000/api/class');
                    console.log('Resposta da API (Turmas):', turmasResponse.data);
                    
                    if (turmasResponse.data && Array.isArray(turmasResponse.data)) {
                        setTurmas(turmasResponse.data);
                    } else {
                        setTurmas([]);
                    }

                    // Fetch dos avisos
                    const avisosResponse = await axios.get('http://192.168.2.11:3000/api/reminder');
                    const avisosOrdenados = avisosResponse.data.sort((a, b) =>
                        new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
                    );
                    setAvisos(avisosOrdenados);
                } catch (error) {
                    console.error('Erro ao carregar dados:', error);
                    setTurmas([]);
                    setAvisos([]);
                }
            };

            fetchData();
        }, [])
    );

    const handleSelecionarTurma = (id) => {
        setTurmaSelecionada(id);
        console.log('Turma selecionada:', id);
    };

    const gerarCorAleatoria = () => {
        return '#0077FF';
    };

    const enviarAviso = async () => {
        try {
            if (!turmaSelecionada) {
                Alert.alert('Aviso', 'Por favor, selecione uma turma.');
                return;
            }
    
            const instituicaoId = await AsyncStorage.getItem('@user_id');
            const token = await AsyncStorage.getItem('@user_token');
            
            if (!instituicaoId || !token) {
                Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
                return;
            }
    
            if (!conteudoAviso.trim()) {
                Alert.alert('Aviso', 'Por favor, digite um aviso antes de enviar.');
                return;
            }
    
            const avisoData = {
                conteudo: conteudoAviso,
                createdByInstitution: { id: parseInt(instituicaoId) },
                classSt: { id: turmaSelecionada },
            };
    
            await axios.post('http://192.168.2.11:3000/api/reminder', avisoData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            // Recarrega os avisos após o envio
            const avisosResponse = await axios.get('http://192.168.2.11:3000/api/reminder');
            const avisosOrdenados = avisosResponse.data.sort((a, b) =>
                new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
            );
            setAvisos(avisosOrdenados);
    
            Alert.alert('Sucesso', 'Aviso enviado com sucesso!');
            setConteudoAviso('');
        } catch (error) {
            console.error('Erro ao enviar aviso:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Erro ao enviar aviso. Tente novamente.');
        }
    };

    return (
        <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <HeaderIns isDarkMode={isDarkMode} />

            <ScrollView style={styles.scrollTela} showsVerticalScrollIndicator={false}>
                <View style={styles.subtela}>
                    {/* Seção de boas-vindas */}
                    <View style={[styles.infoContainer, {
                        backgroundColor: '#1E6BE6',
                        shadowColor: isDarkMode ? '#FFF' : '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 5,
                    }]}>
                        <View style={styles.textContainer}>
                            <Text style={[styles.titulo, { color: '#FFF' }]}>
                                Seja bem-vindo, Instituição 👋
                            </Text>
                            <Text style={[styles.subtitulo, { color: '#FFF' }]}>
                                O sucesso é a soma de pequenos esforços repetidos dia após dia.
                            </Text>
                        </View>
                        <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
                    </View>

                    {/* Seção de turmas com ScrollView */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
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

                    {/* Seção de avisos com TextInput */}
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
                            <TouchableOpacity style={styles.enviarButton} onPress={enviarAviso}>
                                <Text style={styles.enviarText}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Seção de avisos gerais com ScrollView */}
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
                                avisos.map((aviso) => {
                                    // Extrai os dois primeiros nomes do criador do aviso
                                    const doisPrimeirosNomes = aviso.criadoPorNome ?
                                        aviso.criadoPorNome.split(' ').slice(0, 2).join(' ') :
                                        'Instituição';

                                    return (
                                        <Avisos
                                            key={aviso.id}
                                            abreviacao={aviso.initials}
                                            nome={doisPrimeirosNomes}
                                            horario={new Date(aviso.horarioSistema).toLocaleTimeString([], {
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