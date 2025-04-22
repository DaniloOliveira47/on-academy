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
    const [modalEditarVisible, setModalEditarVisible] = useState(false);
    const [modalNovaDisciplinaVisible, setModalNovaDisciplinaVisible] = useState(false);
    const [novaTurma, setNovaTurma] = useState('');
    const [novoAno, setNovoAno] = useState('2025');
    const [novoPeriodo, setNovoPeriodo] = useState('Manhã');
    const [novaCapacidade, setNovaCapacidade] = useState('');
    const [novaSala, setNovaSala] = useState('');
    const [novaDisciplina, setNovaDisciplina] = useState('');
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const [turmas, setTurmas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [turmasFiltradas, setTurmasFiltradas] = useState([]);
    const [turmaEditando, setTurmaEditando] = useState(null);
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [erros, setErros] = useState({
        nomeTurma: false,
        capacidade: false,
        sala: false,
        professores: false,
        disciplinas: false
    });
    const [carregando, setCarregando] = useState(false);

    const CARDS_POR_PAGINA = 3;

    const pickerStyle = {
        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
        color: isDarkMode ? 'white' : 'black',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: isDarkMode ? '#555' : '#D1D1D1',
    };

    const handleTurmaExcluida = (turmaId) => {
        setTurmas(turmas.filter(turma => turma.id !== turmaId));
        setTurmasFiltradas(turmasFiltradas.filter(turma => turma.id !== turmaId));
    };

    const fetchTurmas = async () => {
        setCarregando(true);
        try {
            const response = await axios.get('http://10.92.198.51:3000/api/class');
            setTurmas(response.data || []);
            setTurmasFiltradas(response.data || []);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as turmas. Verifique sua conexão.');
            setTurmas([]);
            setTurmasFiltradas([]);
        } finally {
            setCarregando(false);
        }
    };

    const fetchProfessores = async () => {
        try {
            const response = await axios.get('http://10.92.198.51:3000/api/teacher');
            setProfessores(response.data || []);
        } catch (error) {
            Alert.alert('Aviso', 'Não foi possível carregar a lista de professores');
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('http://10.92.198.51:3000/api/discipline');
            setDisciplinas(response.data || []);
        } catch (error) {
            Alert.alert('Aviso', 'Não foi possível carregar a lista de disciplinas');
        }
    };

    useEffect(() => {
        fetchTurmas();
        fetchProfessores();
        fetchDisciplinas();
    }, []);

    const abrirModalEditar = async (turma) => {
        setCarregando(true);
        try {
            const response = await axios.get(`http://10.92.198.51:3000/api/class/teacher/disciplinas/${turma.id}`);
            const turmaDetalhada = response.data;

            setTurmaEditando(turmaDetalhada);
            setNovaTurma(turmaDetalhada.nomeTurma);
            setNovoAno(new Date(turmaDetalhada.anoLetivoTurma).getFullYear().toString());
            setNovoPeriodo(turmaDetalhada.periodoTurma);
            setNovaCapacidade(turmaDetalhada.capacidadeMaximaTurma.toString());
            setNovaSala(turmaDetalhada.salaTurma.toString());

            setSelectedProfessores(turmaDetalhada.teachers.map(prof => prof.id));
            setSelectedDisciplinas(turmaDetalhada.disciplines.map(disc => disc.id));

            setModalEditarVisible(true);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da turma');
        } finally {
            setCarregando(false);
        }
    };

    const validarCampos = () => {
        const novosErros = {
            nomeTurma: !novaTurma.trim(),
            capacidade: !novaCapacidade.trim() || isNaN(novaCapacidade) || parseInt(novaCapacidade) <= 0,
            sala: !novaSala.trim() || isNaN(novaSala) || parseInt(novaSala) <= 0,
            professores: selectedProfessores.length === 0,
            disciplinas: selectedDisciplinas.length === 0
        };

        setErros(novosErros);

        if (novosErros.professores) {
            Alert.alert('Atenção', 'Selecione pelo menos um professor');
            return false;
        }

        if (novosErros.disciplinas) {
            Alert.alert('Atenção', 'Selecione pelo menos uma disciplina');
            return false;
        }

        return !Object.values(novosErros).some(erro => erro);
    };

    const criarTurma = async () => {
        if (!validarCampos()) return;

        setCarregando(true);
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
                return;
            }

            await axios.post(
                'http://10.92.198.51:3000/api/class',
                {
                    nomeTurma: novaTurma,
                    anoLetivoTurma: novoAno,
                    capacidadeMaximaTurma: parseInt(novaCapacidade),
                    salaTurma: parseInt(novaSala),
                    periodoTurma: novoPeriodo,
                    idTeacher: selectedProfessores,
                    disciplineId: selectedDisciplinas,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setModalCriarVisible(false);
            limparCampos();
            await fetchTurmas();
            Alert.alert('Sucesso', 'Turma criada com sucesso!');
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Falha ao criar turma';
            Alert.alert('Erro', mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const editarTurma = async () => {
        if (!validarCampos()) return;

        setCarregando(true);
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
                return;
            }

            const anoLetivoTurma = `${novoAno}-01-01T00:00:00.000Z`;

            await axios.put(
                `http://10.92.198.51:3000/api/class/${turmaEditando.id}`,
                {
                    nomeTurma: novaTurma,
                    anoLetivoTurma: anoLetivoTurma,
                    capacidadeMaximaTurma: parseInt(novaCapacidade),
                    salaTurma: parseInt(novaSala),
                    periodoTurma: novoPeriodo,
                    idTeacher: selectedProfessores,
                    disciplineId: selectedDisciplinas,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
            setModalEditarVisible(false);
            limparCampos();
            fetchTurmas();
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Erro ao editar turma';
            Alert.alert('Erro', mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const registrarNovaDisciplina = async () => {
        if (!novaDisciplina.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome para a disciplina');
            return;
        }

        setCarregando(true);
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
                return;
            }

            await axios.post(
                'http://10.92.198.51:3000/api/discipline',
                { nomeDisciplina: novaDisciplina },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert('Sucesso', 'Disciplina registrada com sucesso!');
            setModalNovaDisciplinaVisible(false);
            setNovaDisciplina('');
            fetchDisciplinas();
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Não foi possível registrar a disciplina';
            Alert.alert('Erro', mensagem);
        } finally {
            setCarregando(false);
        }
    };

    const limparCampos = () => {
        setNovaTurma('');
        setNovoAno('2025');
        setNovoPeriodo('Manhã');
        setNovaCapacidade('');
        setNovaSala('');
        setSelectedProfessores([]);
        setSelectedDisciplinas([]);
        setTurmaEditando(null);
        setErros({
            nomeTurma: false,
            capacidade: false,
            sala: false,
            professores: false,
            disciplinas: false
        });
    };

    const filtrarTurmas = (texto) => {
        setFiltro(texto);
        if (texto) {
            const filtradas = turmas.filter((turma) =>
                turma.nomeTurma.toLowerCase().includes(texto.toLowerCase()) ||
                turma.id.toString().includes(texto)
            );
            setTurmasFiltradas(filtradas);
        } else {
            setTurmasFiltradas(turmas);
        }
        setPaginaSelecionada(1);
    };

    const handleProfessorSelect = (id) => {
        const novosProfessores = selectedProfessores.includes(id)
            ? selectedProfessores.filter(profId => profId !== id)
            : [...selectedProfessores, id];

        setSelectedProfessores(novosProfessores);
        setErros({ ...erros, professores: novosProfessores.length === 0 });
    };

    const handleDisciplinaSelect = (id) => {
        const novasDisciplinas = selectedDisciplinas.includes(id)
            ? selectedDisciplinas.filter(discId => discId !== id)
            : [...selectedDisciplinas, id];

        setSelectedDisciplinas(novasDisciplinas);
        setErros({ ...erros, disciplinas: novasDisciplinas.length === 0 });
    };

    const indiceInicial = (paginaSelecionada - 1) * CARDS_POR_PAGINA;
    const indiceFinal = indiceInicial + CARDS_POR_PAGINA;
    const turmasPaginaAtual = turmasFiltradas.slice(indiceInicial, indiceFinal);
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

                    {carregando ? (
                        <View style={styles.carregandoContainer}>
                            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Carregando...</Text>
                        </View>
                    ) : (
                        <View style={styles.cards}>
                           // No seu componente Turmas, modifique a renderização dos cards:
                            {turmasPaginaAtual.length > 0 ? (
                                turmasPaginaAtual.map((turma) => (
                                    <CardTurmas
                                        key={turma.id}
                                        turma={`${turma.nomeTurma}`}
                                        numero={`Nº${turma.id}`}
                                        alunos={`${turma.alunosAtivos || 0} Alunos ativos`}
                                        periodo={`Período: ${turma.periodoTurma}`}
                                        turmaId={turma.id}
                                        navegacao="Alunos"
                                        onDelete={handleTurmaExcluida}
                                        onEditSuccess={fetchTurmas} // Adicione esta linha
                                    />
                                ))
                            ) : (
                                <Text style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>
                                    Nenhuma turma disponível.
                                </Text>
                            )}
                        </View>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 70, position: 'absolute', marginTop: 575, padding: 20 }}>
                        <TouchableOpacity
                            style={styles.botaoCriar}
                            onPress={() => setModalCriarVisible(true)}
                            disabled={carregando}
                        >
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.selecao}>
                            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => (
                                <CardSelecao
                                    key={numero}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => setPaginaSelecionada(numero)}
                                    disabled={carregando}
                                />
                            ))}
                            {totalPaginas > paginaSelecionada && (
                                <CardSelecao
                                    numero=">"
                                    selecionado={false}
                                    onPress={() => setPaginaSelecionada(paginaSelecionada + 1)}
                                    disabled={carregando}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Modal para criar nova turma */}
            <Modal visible={modalCriarVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Criar Nova Turma</Text>

                        <ScrollView>
                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Nome da Turma</Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    {
                                        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                        color: isDarkMode ? 'white' : 'black',
                                        borderColor: erros.nomeTurma ? 'red' : isDarkMode ? '#555' : '#D1D1D1'
                                    }
                                ]}
                                value={novaTurma}
                                onChangeText={(text) => {
                                    setNovaTurma(text);
                                    setErros({ ...erros, nomeTurma: false });
                                }}
                                placeholder="Digite o nome da turma"
                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                            />
                            {erros.nomeTurma && <Text style={styles.erroTexto}>Campo obrigatório</Text>}

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Ano Letivo</Text>
                            <Picker
                                selectedValue={novoAno}
                                style={pickerStyle}
                                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                                onValueChange={(itemValue) => setNovoAno(itemValue)}>
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                            </Picker>

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Período</Text>
                            <Picker
                                selectedValue={novoPeriodo}
                                style={pickerStyle}
                                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                                onValueChange={(itemValue) => setNovoPeriodo(itemValue)}>
                                <Picker.Item label="Vespertino" value="Vesprtino" />
                                <Picker.Item label="Matutino" value="Matutino" />
                                <Picker.Item label="Noturno" value="Noturno" />
                                <Picker.Item label="Integral" value="Integral" />
                            </Picker>

                            <View style={styles.rowLabels}>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Capacidade Máxima</Text>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Nº da Sala</Text>
                            </View>
                            <View style={styles.rowInputs}>
                                <View style={{ width: '48%' }}>
                                    <TextInput
                                        style={[
                                            styles.modalInput,
                                            styles.smallInput,
                                            {
                                                backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                                color: isDarkMode ? 'white' : 'black',
                                                borderColor: erros.capacidade ? 'red' : isDarkMode ? '#555' : '#D1D1D1'
                                            }
                                        ]}
                                        value={novaCapacidade}
                                        onChangeText={(text) => {
                                            setNovaCapacidade(text);
                                            setErros({ ...erros, capacidade: false });
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Ex: 35"
                                        placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                    />
                                    {erros.capacidade && <Text style={styles.erroTexto}>Valor inválido</Text>}
                                </View>
                                <View style={{ width: '48%' }}>
                                    <TextInput
                                        style={[
                                            styles.modalInput,
                                            styles.smallInput,
                                            {
                                                backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                                color: isDarkMode ? 'white' : 'black',
                                                borderColor: erros.sala ? 'red' : isDarkMode ? '#555' : '#D1D1D1'
                                            }
                                        ]}
                                        value={novaSala}
                                        onChangeText={(text) => {
                                            setNovaSala(text);
                                            setErros({ ...erros, sala: false });
                                        }}
                                        keyboardType="numeric"
                                        placeholder="Ex: 101"
                                        placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                    />
                                    {erros.sala && <Text style={styles.erroTexto}>Valor inválido</Text>}
                                </View>
                            </View>

                            <View style={styles.checkboxRow}>
                                <View style={styles.checkboxColumn}>
                                    <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Selecione os Professores</Text>
                                    {professores.map((professor) => (
                                        <View key={professor.id} style={styles.checkboxContainer}>
                                            <Checkbox
                                                status={selectedProfessores.includes(professor.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleProfessorSelect(professor.id)}
                                                color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                            />
                                            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{professor.nomeDocente}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.checkboxColumn}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -11 }}>
                                        <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Selecione as Disciplinas</Text>
                                        <TouchableOpacity
                                            onPress={() => setModalNovaDisciplinaVisible(true)}
                                            style={styles.botaoNovaDisciplina}
                                        >
                                            <Icon name="plus" size={20} color={isDarkMode ? '#1A85FF' : '#007AFF'} />
                                        </TouchableOpacity>
                                    </View>
                                    {disciplinas.map((disciplina) => (
                                        <View key={disciplina.id} style={styles.checkboxContainer}>
                                            <Checkbox
                                                status={selectedDisciplinas.includes(disciplina.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleDisciplinaSelect(disciplina.id)}
                                                color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                            />
                                            <Text style={{ color: isDarkMode ? 'white' : 'black' }}>{disciplina.nomeDisciplina}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.botaoAcao, styles.botaoCancelar]}
                                onPress={() => {
                                    setModalCriarVisible(false);
                                    limparCampos();
                                }}
                                disabled={carregando}
                            >
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoAcao, styles.botaoSalvar]}
                                onPress={criarTurma}
                                disabled={carregando}
                            >
                                <Text style={styles.textoBotao}>
                                    {carregando ? 'Criando...' : 'Criar Turma'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>



            {/* Modal para criar nova disciplina */}
            <Modal visible={modalNovaDisciplinaVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Registrar Nova Disciplina</Text>

                        <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Nome da Disciplina</Text>
                        <TextInput
                            style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                            value={novaDisciplina}
                            onChangeText={setNovaDisciplina}
                            placeholder="Digite o nome da disciplina"
                            placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.botaoAcao, styles.botaoCancelar]}
                                onPress={() => {
                                    setModalNovaDisciplinaVisible(false);
                                    setNovaDisciplina('');
                                }}
                            >
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoAcao, styles.botaoSalvar]}
                                onPress={registrarNovaDisciplina}
                            >
                                <Text style={styles.textoBotao}>Registrar</Text>
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
        height: '100%'
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        maxHeight: '85%',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalInput: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 5,
        borderWidth: 1,
        fontSize: 16
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
        width: '100%'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    botaoAcao: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 17
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    checkboxRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    checkboxColumn: {
        width: '48%',
    },
    botaoSalvar: {
        backgroundColor: '#007AFF',
    },
    botaoCancelar: {
        backgroundColor: '#FF453A',
    },
    botaoNovaDisciplina: {
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 20,
    },
    erroTexto: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        marginLeft: 5
    },
    carregandoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});