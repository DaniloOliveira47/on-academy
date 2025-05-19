import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CardSelecao from '../../components/Turmas/CardSelecao';

export default function Turmas() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [turmas, setTurmas] = useState([]);
    const [turmasPagina, setTurmasPagina] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filtro, setFiltro] = useState('');

    const itensPorPagina = 3;
    const totalPaginas = Math.ceil(turmas.length / itensPorPagina);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTurmas();
        setRefreshing(false);
    };

    const fetchTurmas = async () => {
        try {
            const professorId = await AsyncStorage.getItem('@user_id');
            if (!professorId) {
                setError('ID do professor não encontrado.');
                setLoading(false);
                return;
            }

            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class');
            const turmasDoProfessor = response.data.filter(turma =>
                turma.teachers.some(teacher => teacher.id === parseInt(professorId))
            );

            if (turmasDoProfessor.length > 0) {
                setTurmas(turmasDoProfessor);
                atualizarTurmasPagina(turmasDoProfessor, 1);
            } else {
                setError('Nenhuma turma encontrada para o professor.');
            }
        } catch (error) {
            setError('Erro ao buscar turmas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const filtrarTurmas = (texto) => {
        setFiltro(texto);
        if (texto === '') {
            atualizarTurmasPagina(turmas, 1);
            setPaginaSelecionada(1);
            return;
        }

        const turmasFiltradas = turmas.filter(turma =>
            turma.nomeTurma.toLowerCase().includes(texto.toLowerCase()) ||
            turma.id.toString().includes(texto)
        );

        atualizarTurmasPagina(turmasFiltradas, 1);
        setPaginaSelecionada(1);
    };

    const atualizarTurmasPagina = (todasTurmas, pagina) => {
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const turmasDaPagina = todasTurmas.slice(inicio, fim);
        setTurmasPagina(turmasDaPagina);
    };

    const mudarPagina = (pagina) => {
        if (pagina < 1 || pagina > totalPaginas) return;
        setPaginaSelecionada(pagina);
        atualizarTurmasPagina(turmas, pagina);
    };

    useEffect(() => {
        fetchTurmas();
    }, []);

    if (loading && !refreshing) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <ActivityIndicator size="large" color="#1A85FF" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <Text style={{ color: isDarkMode ? '#FFF' : '#000', textAlign: 'center' }}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
            <HeaderSimples titulo="TURMAS" />

            <View style={styles.subTela}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                    {/* Search Input */}
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? 'white' : '#333' }]}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor="#756262"
                            value={filtro}
                            onChangeText={filtrarTurmas}
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>


                    <View style={styles.scrollContainer}>
                        <ScrollView

                            contentContainerStyle={styles.scrollContent}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#1A85FF']}
                                    tintColor={isDarkMode ? '#1A85FF' : '#1A85FF'}
                                />
                            }
                            showsVerticalScrollIndicator={false}
                        >
                            {turmasPagina.length > 0 ? (
                                turmasPagina.map((turma, index) => (
                                    <CardTurmas
                                        key={turma.id}
                                        turma={turma.nomeTurma}
                                        numero={`Nº${(paginaSelecionada - 1) * itensPorPagina + index + 1}`}
                                        alunos={`${turma.alunosAtivos || 0} Alunos ativos`}
                                        periodo={`Período: ${turma.periodoTurma}`}
                                        navegacao="NotasTurma"
                                        turmaId={turma.id}
                                    />
                                ))
                            ) : (
                                <Text style={{
                                    color: isDarkMode ? '#FFF' : '#000',
                                    textAlign: 'center',
                                    marginTop: 20
                                }}>
                                    Nenhuma turma encontrada.
                                </Text>
                            )}
                        </ScrollView>
                    </View>


                    <View style={styles.paginationContainer}>
                        <View style={styles.selecao}>
                            {paginaSelecionada > 1 && (
                                <CardSelecao
                                    numero="<"
                                    selecionado={false}
                                    onPress={() => mudarPagina(paginaSelecionada - 1)}
                                />
                            )}

                            {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
                                let pagina;
                                if (totalPaginas <= 3) {
                                    pagina = i + 1;
                                } else if (paginaSelecionada === 1) {
                                    pagina = i + 1;
                                } else if (paginaSelecionada === totalPaginas) {
                                    pagina = totalPaginas - 2 + i;
                                } else {
                                    pagina = paginaSelecionada - 1 + i;
                                }

                                return (
                                    <CardSelecao
                                        key={pagina}
                                        numero={pagina}
                                        selecionado={paginaSelecionada === pagina}
                                        onPress={() => mudarPagina(pagina)}
                                    />
                                );
                            })}

                            {paginaSelecionada < totalPaginas && (
                                <CardSelecao
                                    numero=">"
                                    selecionado={false}
                                    onPress={() => mudarPagina(paginaSelecionada + 1)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    subTela: {
        flex: 1,
        padding: 10,
    },
    container: {
        flex: 1,
        borderRadius: 16,
        padding: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 10,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 90,
    },
    cards: {
        width: '100%',
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingVertical: 10,
    },
});