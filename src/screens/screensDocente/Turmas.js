import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CardSelecao from '../../components/Turmas/CardSelecao';

export default function Turmas() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1); // Estado para controlar a página atual
    const { isDarkMode } = useTheme();
    const [turmas, setTurmas] = useState([]); // Estado para armazenar todas as turmas
    const [turmasPagina, setTurmasPagina] = useState([]); // Estado para armazenar as turmas da página atual

    const itensPorPagina = 3; // Limite de 3 cards por página

    useEffect(() => {
        const fetchTurmas = async () => {
            try {
                // Recupera o ID do professor do Async Storage
                const professorId = await AsyncStorage.getItem('@user_id');
                if (!professorId) {
                    console.error('ID do professor não encontrado no Async Storage');
                    return;
                }

                // Faz a requisição à API para buscar as turmas do professor
                const response = await axios.get(`http://10.0.2.2:3000/api/teacher/${professorId}`);
                console.log('Resposta da API:', response.data);

                // Verifica se a resposta contém o array de turmas
                if (response.data && Array.isArray(response.data.classes)) {
                    setTurmas(response.data.classes); // Atualiza o estado com todas as turmas
                    atualizarTurmasPagina(response.data.classes, 1); // Exibe as turmas da primeira página
                } else {
                    console.error('Resposta da API não contém um array de turmas:', response.data);
                }
            } catch (error) {
                console.error('Erro ao buscar turmas:', error);
            }
        };

        fetchTurmas();
    }, []);

    // Função para atualizar as turmas da página atual
    const atualizarTurmasPagina = (todasTurmas, pagina) => {
        const inicio = (pagina - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const turmasDaPagina = todasTurmas.slice(inicio, fim); // Divide as turmas em grupos de 3
        setTurmasPagina(turmasDaPagina);
    };

    // Função para mudar de página
    const mudarPagina = (pagina) => {
        setPaginaSelecionada(pagina);
        atualizarTurmasPagina(turmas, pagina);
    };

    return (
        <View style={{ backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', height: '100%' }}>
            <HeaderSimples
                titulo="TURMAS"
            />

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
                                    numero={`Nº${(paginaSelecionada - 1) * itensPorPagina + index + 1}`} // Número sequencial global
                                    alunos={`${turma.quantidadeAlunos || 0} Alunos ativos`}
                                    periodo={`Período: ${turma.periodoTurma}`}
                                    navegacao="NotasTurma"
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
                                            mudarPagina(paginaSelecionada + 1); // Avança para a próxima página
                                        } else {
                                            mudarPagina(numero); // Vai para a página específica
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
    tela: {
        padding: 25,
        backgroundColor: '#F0F7FF'
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0,
    },
    cards: {
        width: '100%',
        padding: 10,
        marginTop: 15
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
        marginTop: 20
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
        marginTop: 10
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    }
});