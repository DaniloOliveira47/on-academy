import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    Animated,
    Easing,
    TouchableOpacity
} from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useFocusEffect } from '@react-navigation/native';

export default function Turmas() {
    const { isDarkMode } = useTheme();
    const [turmas, setTurmas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const animationRefs = useRef(new Map()).current;

    // Pagination variables
    const CARDS_POR_PAGINA = 3;
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const [turmasFiltradas, setTurmasFiltradas] = useState([]);
    const MAX_BOTOES_VISIVEIS = 3;

    const totalPaginas = Math.ceil(turmasFiltradas.length / CARDS_POR_PAGINA);

    const fetchTurmas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const professorId = await AsyncStorage.getItem('@user_id');
           
            if (!professorId) {
                throw new Error('ID do professor não encontrado.');
            }

            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class');
            const turmasDoProfessor = response.data.filter(turma =>
                turma.teachers.some(teacher => teacher.id === parseInt(professorId))
            );

            if (turmasDoProfessor.length === 0) {
                throw new Error('Nenhuma turma encontrada para o professor.');
            }

            setTurmas(turmasDoProfessor);
            setTurmasFiltradas(turmasDoProfessor);
            setShouldAnimate(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const timer = setTimeout(() => {
                if (isActive) {
                    fetchTurmas();
                }
            }, 300); // Pequeno delay para evitar conflitos com animações de transição

            return () => {
                isActive = false;
                clearTimeout(timer);
                setShouldAnimate(false);
                animationRefs.clear();
            };
        }, [fetchTurmas])
    );

    const AnimatedCard = React.memo(({ turma, index }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const slideAnim = useRef(new Animated.Value(20)).current;

        useEffect(() => {
            animationRefs.set(turma.id, { fadeAnim, slideAnim });
           
            if (shouldAnimate) {
                fadeAnim.setValue(0);
                slideAnim.setValue(20);

                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 500,
                        delay: index * 100,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.quad)
                    }),
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 500,
                        delay: index * 100,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.quad)
                    })
                ]).start();
            }

            return () => {
                animationRefs.delete(turma.id);
            };
        }, [shouldAnimate]);

        return (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <CardTurmas
                    key={turma.id}
                    turma={turma.nomeTurma}
                    numero={`Nº${turma.id}`}
                    alunos={`${turma.alunosAtivos || 0} Alunos ativos`}
                    periodo={`Período: ${turma.periodoTurma}`}
                    navegacao="NotasTurma"
                    turmaId={turma.id}
                />
            </Animated.View>
        );
    });

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTurmas();
    }, [fetchTurmas]);

    const filtrarTurmas = useCallback((texto) => {
        setFiltro(texto);
        if (texto === '') {
            setTurmasFiltradas(turmas);
            setPaginaSelecionada(1);
            return;
        }

        const filtradas = turmas.filter(turma =>
            turma.nomeTurma.toLowerCase().includes(texto.toLowerCase()) ||
            turma.id.toString().includes(texto)
        );
        setTurmasFiltradas(filtradas);
        setPaginaSelecionada(1);
    }, [turmas]);

    // Calculate visible pages for pagination
    const paginaInicial = Math.max(1, paginaSelecionada - 1);
    const paginaFinal = Math.min(totalPaginas, paginaInicial + MAX_BOTOES_VISIVEIS - 1);
    const paginasVisiveis = [];

    for (let i = paginaInicial; i <= paginaFinal; i++) {
        paginasVisiveis.push(i);
    }

    // Get turmas for current page
    const indiceInicial = (paginaSelecionada - 1) * CARDS_POR_PAGINA;
    const indiceFinal = indiceInicial + CARDS_POR_PAGINA;
    const turmasPaginaAtual = turmasFiltradas.slice(indiceInicial, indiceFinal);

    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
            <HeaderSimples titulo="TURMAS" />

            <View style={styles.subTela}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                        <TextInput
                            maxLength={20}
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
                            {loading && !refreshing ? (
                                <ActivityIndicator size="large" color="#1A85FF" style={styles.loadingIndicator} />
                            ) : error ? (
                                <Text style={[styles.errorText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                                    {error}
                                </Text>
                            ) : turmasPaginaAtual.length > 0 ? (
                                turmasPaginaAtual.map((turma, index) => (
                                    <AnimatedCard
                                        key={`${turma.id}-${paginaSelecionada}`}
                                        turma={turma}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <Text style={[styles.emptyText, { color: isDarkMode ? '#FFF' : '#000' }]}>
                                    Nenhuma turma encontrada.
                                </Text>
                            )}
                        </ScrollView>
                    </View>

                    {/* Pagination Controls */}
                    <View style={styles.footerContainer}>
                        <View style={styles.selecao}>
                            {paginaInicial > 1 && (
                                <CardSelecao
                                    numero="<"
                                    selecionado={false}
                                    onPress={() => setPaginaSelecionada(paginaInicial - 1)}
                                    disabled={loading}
                                />
                            )}

                            {paginasVisiveis.map((numero) => (
                                <CardSelecao
                                    key={numero}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => setPaginaSelecionada(numero)}
                                    disabled={loading}
                                />
                            ))}

                            {paginaFinal < totalPaginas && (
                                <CardSelecao
                                    numero=">"
                                    selecionado={false}
                                    onPress={() => setPaginaSelecionada(paginaFinal + 1)}
                                    disabled={loading || paginaSelecionada >= totalPaginas}
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
        height: 50
    },
    icon: {
        marginLeft: 10,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
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
        marginBottom: 30
    },
});