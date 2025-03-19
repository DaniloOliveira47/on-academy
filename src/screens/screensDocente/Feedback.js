import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useNavigation } from '@react-navigation/native';

export default function Turmas() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [turmas, setTurmas] = useState([]);
    const [turmasPagina, setTurmasPagina] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    const itensPorPagina = 3;

    useEffect(() => {
        const fetchTurmas = async () => {
            try {
                const professorId = await AsyncStorage.getItem('@user_id');
                if (!professorId) {
                    setError('ID do professor não encontrado.');
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://10.0.2.2:3000/api/class');
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
                console.error('Erro ao buscar turmas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTurmas();
    }, []);

    const atualizarTurmasPagina = (todasTurmas, pagina) => {
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const turmasDaPagina = todasTurmas.slice(inicio, fim);
        setTurmasPagina(turmasDaPagina);
    };

    const mudarPagina = (pagina) => {
        setPaginaSelecionada(pagina);
        atualizarTurmasPagina(turmas, pagina);
    };

    const handleNavigateToNotasTurma = (turmaId) => {
        navigation.navigate('NotasStack', {
            screen: 'NotasTurma',
            params: { turmaId },
        });
    };

    if (loading) {
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
        <View style={{ backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', height: '100%' }}>
            <HeaderSimples titulo="FEEDBACK" />

            <View style={styles.subTela}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor="#756262"
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>
                    <View style={styles.cards}>
                        {turmasPagina.length > 0 ? (
                            turmasPagina.map((turma, index) => (
                                <CardTurmas
                                    key={turma.id}
                                    turma={turma.nomeTurma}
                                    numero={`Nº${(paginaSelecionada - 1) * itensPorPagina + index + 1}`}
                                    alunos={`${turma.alunosAtivos || 0} Alunos ativos`}
                                    periodo={`Período: ${turma.periodoTurma}`}
                                    navegacao="AlunosFeedback" // Nome da tela de destino
                                    turmaId={turma.id} // Passa o ID da turma
                                />
                            ))
                        ) : (
                            <Text style={{ color: isDarkMode ? '#FFF' : '#000', textAlign: 'center', marginTop: 20 }}>
                                Nenhuma turma disponível.
                            </Text>
                        )}
                        <View style={styles.selecao}>
                            {[1, 2, '>'].map((numero, index) => (
                                <CardSelecao
                                    key={index}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => {
                                        if (numero === '>') {
                                            mudarPagina(paginaSelecionada + 1);
                                        } else {
                                            mudarPagina(numero);
                                        }
                                    }}
                                />
                            ))}
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
    tela: {
        padding: 25,
        backgroundColor: '#F0F7FF',
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0,
    },
    cards: {
        width: '100%',
        padding: 10,
        marginTop: 15,
    },
    subTela: {
        padding: 10,
        paddingTop: 0,
    },
    container: {
        backgroundColor: 'white',
        width: '100%',
        height: '100%',
        borderRadius: 16,
        alignItems: 'center',
        padding: 10,
        marginTop: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        marginTop: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
});