import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, TouchableOpacity, TextInput, Alert } from 'react-native';
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
    const [avisos, setAvisos] = useState([]); // Estado para os avisos

    const gerarCorAleatoria = () => {
        let cor = '#0077FF';
        return cor;
    };
 
    useEffect(() => {
        const fetchTurmas = async () => {
            try {
                const professorId = await AsyncStorage.getItem('@user_id');
                if (!professorId) {
                    console.error('ID do professor não encontrado no Async Storage');
                    setTurmas([]);
                    return;
                }

                const response = await axios.get(`http://10.0.2.2:3000/api/teacher/classes/${professorId}`);
                console.log('Resposta da API:', response.data);

                if (response.data && Array.isArray(response.data.classes)) {
                    setTurmas(response.data.classes);
                } else {
                    console.error('Resposta da API não contém um array de classes:', response.data);
                    setTurmas([]);
                }
            } catch (error) {
                console.error('Erro ao buscar turmas:', error);
                setTurmas([]);
            }
        };

        const fetchMessages = async () => {
            try {
                const { data } = await axios.get('http://10.0.2.2:3000/api/reminder');
 
                data.sort((a, b) =>
                    new Date(b.horarioSistema).getTime() - new Date(a.horarioSistema).getTime()
                );
 
                setAvisos(data);
            } catch (error) {
                console.error('Erro ao carregar avisos:', error);
            }
        };

        fetchTurmas();
        fetchMessages();
    }, []);

    const enviarAviso = async () => {
        try {
            const professorId = await AsyncStorage.getItem('@user_id');
            if (!professorId) {
                console.error('ID do professor não encontrado no Async Storage');
                return;
            }

            // Verifica se o conteúdo do aviso está vazio
            if (!conteudoAviso.trim()) {
                Alert.alert('Aviso', 'Por favor, digite um aviso antes de enviar.');
                return;
            }

            if (turmas.length === 0) {
                console.error('Nenhuma turma disponível para enviar o aviso.');
                return;
            }

            for (const turma of turmas) {
                const avisoData = {
                    conteudo: conteudoAviso, // Usa o conteúdo do estado
                    createdBy: { id: parseInt(professorId) }, // ID do professor logado
                    classSt: { id: turma.id }, // ID da turma
                };

                const response = await axios.post('http://10.0.2.2:3000/api/reminder', avisoData);
                console.log(`Aviso enviado para a turma ${turma.id}:`, response.data);
            }

            Alert.alert('Sucesso', 'Aviso enviado com sucesso para todas as turmas!');
            setConteudoAviso(''); // Limpa o campo de texto após o envio
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
                                Seja bem-vindo, Docente 👋
                            </Text>
                            <Text style={[styles.subtitulo, { color: '#FFF' }]}>
                                O sucesso é a soma de pequenos esforços repetidos dia após dia.
                            </Text>
                        </View>
                        <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
                    </View>

                    {/* Seção de turmas */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={styles.title}>Turmas</Text>
                        <View style={styles.scrollWrapper}>
                            <ScrollView
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.cards}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                            >
                                {turmas.length > 0 ? (
                                    turmas.map((turma, index) => (
                                        <CardTurmas
                                            key={turma.id}
                                            titulo={`${turma.nomeTurma} `}
                                            subTitulo={`Sala ${index + 1} `}
                                        />
                                    ))
                                ) : (
                                    <Text style={styles.emptyMessage}>Nenhuma turma disponível</Text>
                                )}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Seção de avisos */}
                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Aviso</Text>
                        <TextInput
                            style={[
                                styles.contAviso,
                                {
                                    backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                    height: 200,
                                    textAlignVertical: 'top', // Alinha o texto no topo
                                },
                            ]}
                            placeholder="Digite o aviso..."
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            multiline
                            value={conteudoAviso} // Valor do estado
                            onChangeText={setConteudoAviso} // Atualiza o estado conforme o usuário digita
                        />
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity style={styles.enviarButton} onPress={enviarAviso}>
                                <Text style={styles.enviarText}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Seção de avisos gerais */}
                    <View style={{ backgroundColor: isDarkMode ? '#000' : '#FFF', width: '100%', borderRadius: 20, marginTop: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10, color: isDarkMode ? '#FFF' : '#000' }}>
                            Avisos
                        </Text>
                        <View style={{ padding: 10 }}>
                            {avisos.length > 0 ? (
                                avisos.map((aviso) => (
                                    <Avisos
                                        key={aviso.id}
                                        abreviacao={aviso.initials}
                                        nome={aviso.criadoPorNome}
                                        horario={new Date(aviso.horarioSistema).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        texto={aviso.conteudo}
                                        aleatorio={gerarCorAleatoria()} // Passa a cor aleatória
                                    />
                                ))
                            ) : (
                                <Text style={{ color: isDarkMode ? '#FFF' : '#000', textAlign: 'center' }}>
                                    Nenhum aviso disponível.
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: '#F0F7FF' },
    scrollTela: { flex: 1, marginBottom: 40 },
    contTurmas: { backgroundColor: 'white', width: '100%', borderRadius: 30, padding: 15, marginTop: 20 },
    title: { color: '#0077FF', fontSize: 20, fontWeight: 'bold' },
    subtela: { paddingTop: 10, alignItems: 'center', padding: 20 },
    infoContainer: { flexDirection: 'row', width: '100%', padding: 20, borderRadius: 20, position: 'relative' },
    textContainer: { flex: 1, zIndex: 2 },
    titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, width: 150 },
    subtitulo: { fontSize: 14, width: 190 },
    infoImage: { position: 'absolute', right: -25, bottom: -10, width: 200, height: 150, resizeMode: 'contain' },
    emptyMessage: { textAlign: 'center', color: '#888', marginTop: 10 },
    contAviso: { backgroundColor: '#F0F7FF', padding: 10, borderRadius: 18, marginTop: 8 },
    enviarButton: { backgroundColor: '#1A85FF', alignItems: 'center', width: 100, padding: 8, borderRadius: 10, marginTop: 10 },
    enviarText: { color: 'white', fontWeight: 'bold', fontSize: 17 },
});