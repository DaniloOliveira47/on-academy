import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ActivityIndicator,
    ScrollView,
    RefreshControl,
    Animated,
    Easing
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
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [turmas, setTurmas] = useState([]);
    const [turmasPagina, setTurmasPagina] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const animationRefs = useRef(new Map()).current;
 
    const itensPorPagina = 3;
    const totalPaginas = Math.ceil(turmas.length / itensPorPagina);
 
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
            atualizarTurmasPagina(turmasDoProfessor, 1);
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
                        delay: index * 100, // Reduzido o delay para animação mais rápida
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
                    numero={`Nº${(paginaSelecionada - 1) * itensPorPagina + index + 1}`}
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
    }, [turmas]);
 
    const atualizarTurmasPagina = useCallback((todasTurmas, pagina) => {
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        setTurmasPagina(todasTurmas.slice(inicio, fim));
    }, []);
 
    const mudarPagina = useCallback((pagina) => {
        if (pagina < 1 || pagina > totalPaginas) return;
        setPaginaSelecionada(pagina);
        atualizarTurmasPagina(turmas, pagina);
    }, [turmas, totalPaginas, atualizarTurmasPagina]);
 
    const renderPagination = useCallback(() => {
        if (loading || turmas.length === 0) return null;
 
        let paginas = [];
        const maxVisiblePages = 3;
 
        if (totalPaginas <= maxVisiblePages) {
            paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);
        } else {
            const startPage = Math.max(1, Math.min(
                paginaSelecionada - Math.floor(maxVisiblePages / 2),
                totalPaginas - maxVisiblePages + 1
            ));
           
            paginas = Array.from({ length: maxVisiblePages }, (_, i) => startPage + i);
        }
 
        return (
            <View style={styles.paginationContainer}>
                <View style={styles.selecao}>
                    {paginaSelecionada > 1 && (
                        <CardSelecao
                            numero="<"
                            selecionado={false}
                            onPress={() => mudarPagina(paginaSelecionada - 1)}
                        />
                    )}
 
                    {paginas.map(pagina => (
                        <CardSelecao
                            key={pagina}
                            numero={pagina}
                            selecionado={paginaSelecionada === pagina}
                            onPress={() => mudarPagina(pagina)}
                        />
                    ))}
 
                    {paginaSelecionada < totalPaginas && (
                        <CardSelecao
                            numero=">"
                            selecionado={false}
                            onPress={() => mudarPagina(paginaSelecionada + 1)}
                        />
                    )}
                </View>
            </View>
        );
    }, [loading, turmas.length, totalPaginas, paginaSelecionada, mudarPagina]);
 
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
                            ) : turmasPagina.length > 0 ? (
                                turmasPagina.map((turma, index) => (
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
 
                    {renderPagination()}
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
        paddingBottom: 90,
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