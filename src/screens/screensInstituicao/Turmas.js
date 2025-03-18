import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,
    Text,
    ScrollView,
    Alert,
} from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/EditarTurmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import CardSelecao from '../../components/Turmas/CardSelecao';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';

export default function Turmas() {
    const { isDarkMode } = useTheme();
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
    const [novaTurma, setNovaTurma] = useState('');
    const [novoAno, setNovoAno] = useState('2025');
    const [novoPeriodo, setNovoPeriodo] = useState('Manhã');
    const [novaCapacidade, setNovaCapacidade] = useState('');
    const [novaSala, setNovaSala] = useState('');
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const [turmas, setTurmas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [turmasFiltradas, setTurmasFiltradas] = useState([]);

    // Estados para os checkboxes de professores e disciplinas
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    // Número de cards por página
    const CARDS_POR_PAGINA = 3;

    // Função para buscar turmas, professores e disciplinas
    const fetchTurmas = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/api/class');
            if (response.data && Array.isArray(response.data)) {
                setTurmas(response.data);
                setTurmasFiltradas(response.data); // Inicializa as turmas filtradas
            } else {
                console.error('Resposta da API não contém um array de turmas:', response.data);
                setTurmas([]);
                setTurmasFiltradas([]);
            }
        } catch (error) {
            console.error('Erro ao buscar turmas:', error);
            setTurmas([]);
            setTurmasFiltradas([]);
        }
    };

    const fetchProfessores = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/api/teacher');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('http://10.0.2.2:3000/api/discipline');
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
        }
    };

    // Busca turmas, professores e disciplinas ao carregar o componente
    useEffect(() => {
        fetchTurmas();
        fetchProfessores();
        fetchDisciplinas();
    }, []);

    // Função para criar uma nova turma
    const criarTurma = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token'); // Token de autenticação
            if (!token) {
                console.error('Token não encontrado no Async Storage');
                return;
            }

            const anoLetivoTurma = `${novoAno}-01-01T00:00:00.000Z`; // Exemplo de data fixa

            const turmaData = {
                nomeTurma: novaTurma,
                anoLetivoTurma: anoLetivoTurma,
                capacidadeMaximaTurma: parseInt(novaCapacidade),
                salaTurma: parseInt(novaSala),
                periodoTurma: novoPeriodo,
                idTeacher: selectedProfessores, // IDs dos professores selecionados
                disciplineId: selectedDisciplinas, // IDs das disciplinas selecionadas
            };

            const response = await axios.post('http://10.0.2.2:3000/api/class', turmaData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Alert.alert('Sucesso', 'Turma criada com sucesso!');
            setModalCriarVisible(false);
            fetchTurmas();
        } catch (error) {
            console.error('Erro ao criar turma:', error);
            Alert.alert('Erro', 'Erro ao criar turma. Tente novamente.');
        }
    };

    // Função para filtrar turmas pelo nome ou código
    const filtrarTurmas = (texto) => {
        setFiltro(texto);
        if (texto) {
            const turmasFiltradas = turmas.filter((turma) =>
                turma.nomeTurma.toLowerCase().includes(texto.toLowerCase()) ||
                turma.id.toString().includes(texto)
            );
            setTurmasFiltradas(turmasFiltradas);
        } else {
            setTurmasFiltradas(turmas); // Mostra todas as turmas se o filtro estiver vazio
        }
        setPaginaSelecionada(1); // Reseta a página para a primeira ao aplicar o filtro
    };

    // Função para lidar com a seleção dos checkboxes
    const handleProfessorSelect = (id) => {
        setSelectedProfessores((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((profId) => profId !== id)
                : [...prevSelected, id]
        );
    };

    const handleDisciplinaSelect = (id) => {
        setSelectedDisciplinas((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((discId) => discId !== id)
                : [...prevSelected, id]
        );
    };

    // Calcula os índices dos cards a serem exibidos
    const indiceInicial = (paginaSelecionada - 1) * CARDS_POR_PAGINA;
    const indiceFinal = indiceInicial + CARDS_POR_PAGINA;
    const turmasPaginaAtual = turmasFiltradas.slice(indiceInicial, indiceFinal);

    // Calcula o número total de páginas
    const totalPaginas = Math.ceil(turmasFiltradas.length / CARDS_POR_PAGINA);

    return (
        <View style={{ backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', flex: 1 }}>
            <HeaderSimples titulo="TURMAS" />

            <View style={styles.subTela}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
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

                    <View style={styles.cards}>
                        {turmasPaginaAtual.length > 0 ? (
                            turmasPaginaAtual.map((turma) => (
                                <CardTurmas
                                    key={turma.id}
                                    turma={`${turma.nomeTurma}`}
                                    numero={`Nº${turma.id}`}
                                    alunos={`${turma.quantidadeAlunos || 0} Alunos ativos`}
                                    periodo={`Período: ${turma.periodoTurma}`}
                                    turmaId={turma.id}
                                    navegacao="Alunos"
                                />
                            ))
                        ) : (
                            <Text style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>
                                Nenhuma turma disponível.
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>
                        <TouchableOpacity
                            style={styles.botaoCriar}
                            onPress={() => setModalCriarVisible(true)}>
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.selecao}>
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                                <CardSelecao
                                    key={numero}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => setPaginaSelecionada(numero)}
                                />
                            ))}
                            {totalPaginas > paginaSelecionada && (
                                <CardSelecao
                                    numero=">"
                                    selecionado={false}
                                    onPress={() => setPaginaSelecionada(paginaSelecionada + 1)}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>
            <Modal visible={modalCriarVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Criar Nova Turma</Text>

                        <ScrollView>
                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Nome da Turma</Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                value={novaTurma}
                                onChangeText={setNovaTurma}
                                placeholder="Digite o nome da turma"
                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                            />

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Ano Letivo</Text>
                            <Picker
                                selectedValue={novoAno}
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                onValueChange={(itemValue) => setNovoAno(itemValue)}>
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                            </Picker>

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Período</Text>
                            <Picker
                                selectedValue={novoPeriodo}
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                onValueChange={(itemValue) => setNovoPeriodo(itemValue)}>
                                <Picker.Item label="Manhã" value="Manhã" />
                                <Picker.Item label="Tarde" value="Tarde" />
                                <Picker.Item label="Noite" value="Noite" />
                            </Picker>

                            <View style={styles.rowLabels}>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Capacidade Máxima</Text>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Nº da Sala</Text>
                            </View>
                            <View style={styles.rowInputs}>
                                <TextInput
                                    style={[styles.modalInput, styles.smallInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                    value={novaCapacidade}
                                    onChangeText={setNovaCapacidade}
                                    keyboardType="numeric"
                                    placeholder="Ex: 35"
                                    placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                />
                                <TextInput
                                    style={[styles.modalInput, styles.smallInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                    value={novaSala}
                                    onChangeText={setNovaSala}
                                    keyboardType="numeric"
                                    placeholder="Ex: 101"
                                    placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                />
                            </View>

                            {/* Checkboxes para selecionar professores e disciplinas */}
                            <View style={styles.checkboxRow}>
                                <View style={styles.checkboxColumn}>
                                    <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Selecione os Professores</Text>
                                    {professores.map((professor) => (
                                        <View key={professor.id} style={styles.checkboxContainer}>
                                            <Checkbox
                                                status={selectedProfessores.includes(professor.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleProfessorSelect(professor.id)}
                                            />
                                            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{professor.nomeDocente}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.checkboxColumn}>
                                    <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Selecione as Disciplinas</Text>
                                    {disciplinas.map((disciplina) => (
                                        <View key={disciplina.id} style={styles.checkboxContainer}>
                                            <Checkbox
                                                status={selectedDisciplinas.includes(disciplina.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleDisciplinaSelect(disciplina.id)}
                                            />
                                            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{disciplina.nomeDisciplina}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]} onPress={() => setModalCriarVisible(false)}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]} onPress={criarTurma}>
                                <Text style={styles.textoBotao}>Criar Turma</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    subTela: {
        padding: 10,
        paddingTop: 10,
        flex: 1
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0,
    },
    container: {
        width: '100%',
        borderRadius: 16,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 15
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 10
    },
    cards: {
        width: '100%',
        padding: 5
    },
    botaoCriar: {
        backgroundColor: '#1A85FF',
        width: 56,
        height: 56,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    subTela: {
        padding: 10,
        paddingTop: 10,
        flex: 1
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0,
    },
    container: {
        width: '100%',
        borderRadius: 16,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 15
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 10
    },
    cards: {
        width: '100%',
        padding: 5
    },
    botaoCriar: {
        backgroundColor: '#1A85FF',
        width: 56,
        height: 56,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 15,
        padding: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalInput: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    rowLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    smallInput: {
        width: '48%'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    botaoAcao: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    checkboxColumn: {
        width: '48%',
    },
    botaoSalvar: {
        backgroundColor: '#1A85FF',
    },
    botaoCancelar: {
        backgroundColor: '#FF3B30',
    },
});