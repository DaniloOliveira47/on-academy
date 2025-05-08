import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity, ScrollView, Alert, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/Feather';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useTheme } from '../../path/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CadastroProfessorModal from '../../components/EditarTurmas/ModalCadProfessor';
import CardProfessorIns from '../../components/Ocorrência/CardProfessoreIns';

export default function ProfessoresFeedback() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [professores, setProfessores] = useState([]);
    const [professoresFiltrados, setProfessoresFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const professoresPorPagina = 6;
    const totalPaginas = Math.ceil(professoresFiltrados.length / professoresPorPagina);

    const fetchProfessores = useCallback(async () => {
        let isActive = true;
        
        try {
            if (isActive) setLoading(true);
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher');
            if (isActive) {
                const professoresOrdenados = response.data.sort((a, b) => b.id - a.id);
                setProfessores(professoresOrdenados);
                setProfessoresFiltrados(professoresOrdenados);
                setPaginaSelecionada(1);
            }
        } catch {
            // Em caso de erro, simplesmente limpa a lista sem mostrar mensagem
            if (isActive) {
                setProfessores([]);
                setProfessoresFiltrados([]);
            }
        } finally {
            if (isActive) setLoading(false);
        }

        return () => { isActive = false };
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchProfessores();
        }, [fetchProfessores])
    );

    useEffect(() => {
        if (searchTerm === '') {
            setProfessoresFiltrados(professores);
            setPaginaSelecionada(1);
        } else {
            const filtrados = professores.filter(professor =>
                professor.nomeDocente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professor.id.toString().includes(searchTerm)
            );
            setProfessoresFiltrados(filtrados);
            setPaginaSelecionada(1);
        }
    }, [searchTerm, professores]);

    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
    };

    const handlePaginaChange = (pagina) => {
        if (pagina === '>') {
            if (paginaSelecionada < totalPaginas) {
                setPaginaSelecionada(paginaSelecionada + 1);
            }
        } else if (pagina === '<') {
            if (paginaSelecionada > 1) {
                setPaginaSelecionada(paginaSelecionada - 1);
            }
        } else {
            setPaginaSelecionada(pagina);
        }
    };

    const getProfessoresPagina = () => {
        const inicio = (paginaSelecionada - 1) * professoresPorPagina;
        const fim = inicio + professoresPorPagina;
        return professoresFiltrados.slice(inicio, fim);
    };

    const handleCriarProfessor = async (dadosProfessor) => {
        try {
            setIsCreating(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher', dadosProfessor, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                await fetchProfessores();
            }
        } catch {
            // Não mostra mensagem de erro, apenas recarrega
            await fetchProfessores();
        } finally {
            setIsCreating(false);
            setModalCriarVisible(false);
        }
    };

    const renderProfessores = () => {
        const professoresPagina = getProfessoresPagina();
        const rows = [];
        
        for (let i = 0; i < professoresPagina.length; i += 2) {
            const rowProfessores = professoresPagina.slice(i, i + 2);
            rows.push(
                <View key={i} style={styles.row}>
                    {rowProfessores.map((professor, index) => (
                        <CardProfessorIns
                            key={index}
                            nome={"Prof - " + professor.nomeDocente}
                            imageUrl={professor.imageUrl}
                            id={professor.id}
                            onPress={() => selecionarProfessor(professor)}
                            selecionado={professorSelecionado?.id === professor.id}
                        />
                    ))}
                </View>
            );
        }
        
        while (rows.length < 3) {
            rows.push(
                <View key={`empty-${rows.length}`} style={styles.row}>
                    <View style={styles.emptyCard}></View>
                    <View style={styles.emptyCard}></View>
                </View>
            );
        }
        
        return rows;
    };

    const renderPaginacao = () => {
        const paginas = [];
        const maxPaginas = 5;
        
        if (totalPaginas > 1) {
            paginas.push(
                <CardSelecao
                    key="prev"
                    numero="<"
                    selecionado={false}
                    onPress={() => handlePaginaChange('<')}
                    disabled={paginaSelecionada <= 1}
                />
            );
        }

        if (totalPaginas <= maxPaginas) {
            for (let i = 1; i <= totalPaginas; i++) {
                paginas.push(
                    <CardSelecao
                        key={i}
                        numero={i}
                        selecionado={paginaSelecionada === i}
                        onPress={() => handlePaginaChange(i)}
                    />
                );
            }
        } else {
            let inicio = Math.max(1, paginaSelecionada - 2);
            let fim = Math.min(totalPaginas, paginaSelecionada + 2);

            if (paginaSelecionada <= 3) {
                fim = Math.min(maxPaginas, totalPaginas);
            } else if (paginaSelecionada >= totalPaginas - 2) {
                inicio = totalPaginas - maxPaginas + 1;
            }

            if (inicio > 1) {
                paginas.push(
                    <CardSelecao
                        key={1}
                        numero={1}
                        selecionado={false}
                        onPress={() => handlePaginaChange(1)}
                    />
                );
                if (inicio > 2) {
                    paginas.push(
                        <Text key="left-ellipsis" style={[styles.ellipsis, { color: isDarkMode ? 'white' : 'black' }]}>
                            ...
                        </Text>
                    );
                }
            }

            for (let i = inicio; i <= fim; i++) {
                paginas.push(
                    <CardSelecao
                        key={i}
                        numero={i}
                        selecionado={paginaSelecionada === i}
                        onPress={() => handlePaginaChange(i)}
                    />
                );
            }

            if (fim < totalPaginas) {
                if (fim < totalPaginas - 1) {
                    paginas.push(
                        <Text key="right-ellipsis" style={[styles.ellipsis, { color: isDarkMode ? 'white' : 'black' }]}>
                            ...
                        </Text>
                    );
                }
                paginas.push(
                    <CardSelecao
                        key={totalPaginas}
                        numero={totalPaginas}
                        selecionado={false}
                        onPress={() => handlePaginaChange(totalPaginas)}
                    />
                );
            }
        }

        if (totalPaginas > 1) {
            paginas.push(
                <CardSelecao
                    key="next"
                    numero=">"
                    selecionado={false}
                    onPress={() => handlePaginaChange('>')}
                    disabled={paginaSelecionada >= totalPaginas}
                />
            );
        }
        
        return paginas;
    };

    return (
        <View style={styles.mainContainer}>
            <HeaderSimples titulo="PROFESSORES" />
            
            <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? 'white' : 'black' }]}
                            placeholder="Digite o nome ou número da matrícula"
                            placeholderTextColor={isDarkMode ? '#999' : '#756262'}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>

                    <View style={styles.contentWrapper}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#1A85FF" style={styles.loader} />
                        ) : professoresFiltrados.length === 0 ? (
                            <Text style={[styles.textoVazio, { color: isDarkMode ? 'white' : 'black' }]}>
                                {searchTerm ? 'Nenhum professor encontrado' : 'Nenhum professor cadastrado'}
                            </Text>
                        ) : (
                            <ScrollView 
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {renderProfessores()}
                            </ScrollView>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity 
                            style={[styles.botaoCriar, isDarkMode && styles.botaoCriarDark]} 
                            onPress={() => setModalCriarVisible(true)}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Icon name="plus" size={24} color="white" />
                            )}
                        </TouchableOpacity>
                        
                        <View style={styles.paginacaoContainer}>
                            <View style={styles.paginacao}>
                                {renderPaginacao()}
                            </View>
                        </View>
                    </View>
                </View>

                <CadastroProfessorModal 
                    visible={modalCriarVisible} 
                    onClose={() => !isCreating && setModalCriarVisible(false)}
                    onCreate={handleCriarProfessor}
                    isCreating={isCreating}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    tela: {
        flex: 1,
        width: '100%',
        padding: 10,
        paddingBottom: 50
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
        padding: 10,
        borderRadius: 16,
        position: 'relative',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        marginBottom: 10,
        marginTop: 10
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 10,
    },
    contentWrapper: {
        flex: 1,
        marginBottom: 70,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 20
    },
    emptyCard: {
        width: '45%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textoVazio: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    footer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    paginacaoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 0,
    },
    paginacao: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ellipsis: {
        marginHorizontal: 5,
        fontSize: 16,
    },
    botaoCriar: {
        width: 60,
        height: 60,
        backgroundColor: '#1A85FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    botaoCriarDark: {
        backgroundColor: '#1A85FF',
    },
});