import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableOpacity,
    Text,
    ScrollView,
    Alert,
    RefreshControl,
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
import { useFocusEffect } from '@react-navigation/native';

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
    const [refreshing, setRefreshing] = useState(false);

    const CARDS_POR_PAGINA = 3;

    const pickerStyle = {
        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
        color: isDarkMode ? 'white' : 'black',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: isDarkMode ? '#555' : '#D1D1D1',
    };

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setRefreshing(true);
                try {
                    await Promise.all([fetchTurmas(), fetchProfessores(), fetchDisciplinas()]);
                } catch (error) {
                    Alert.alert('Erro', 'Não foi possível carregar os dados');
                } finally {
                    setRefreshing(false);
                }
            };

            loadData();

            return () => {
                // Limpeza se necessário
            };
        }, [])
    );

    useEffect(() => {
        const loadDataForModal = async () => {
            if (modalCriarVisible) {
                try {
                    setCarregando(true);
                    await Promise.all([fetchProfessores(), fetchDisciplinas()]);
                } catch (error) {
                    Alert.alert('Erro', 'Não foi possível carregar os dados necessários');
                } finally {
                    setCarregando(false);
                }
            }
        };

        loadDataForModal();
    }, [modalCriarVisible]);

    const fetchTurmas = async () => {
        setCarregando(true);
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class');
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
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher');
            setProfessores(response.data || []);
            return true;
        } catch (error) {
            Alert.alert('Aviso', 'Não foi possível carregar a lista de professores');
            return false;
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline');
            setDisciplinas(response.data || []);
            return true;
        } catch (error) {
            Alert.alert('Aviso', 'Não foi possível carregar a lista de disciplinas');
            return false;
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTurmas().finally(() => setRefreshing(false));
    }, []);

    const handleTurmaExcluida = (turmaId) => {
        setTurmas(turmas.filter(turma => turma.id !== turmaId));
        setTurmasFiltradas(turmasFiltradas.filter(turma => turma.id !== turmaId));
    };

    const abrirModalEditar = async (turma) => {
        setCarregando(true);
        try {
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/teacher/disciplinas/${turma.id}`);
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
            capacidade: !novaCapacidade.trim() ||
                isNaN(novaCapacidade) ||
                parseInt(novaCapacidade) < 20 ||
                parseInt(novaCapacidade) <= 0,
            sala: !novaSala.trim() ||
                isNaN(novaSala) ||
                parseInt(novaSala) <= 0,
            professores: selectedProfessores.length === 0,
            disciplinas: selectedDisciplinas.length === 0
        };

        setErros(novosErros);

        if (novosErros.capacidade && novaCapacidade.trim() && !isNaN(novaCapacidade)) {
            if (parseInt(novaCapacidade) < 20) {
                Alert.alert('Atenção', 'A capacidade mínima da turma é 20 alunos.');
            } else {
                Alert.alert('Atenção', 'Capacidade inválida. Digite um número válido.');
            }
            return false;
        }

        if (novosErros.professores) {
            Alert.alert('Atenção', 'Selecione pelo menos um professor.');
            return false;
        }

        if (novosErros.disciplinas) {
            Alert.alert('Atenção', 'Selecione pelo menos uma disciplina.');
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
                'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class',
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
                'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline',
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

                    <View style={{ flex: 1 }}>
                        <ScrollView
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={onRefresh}
                                    colors={['#1A85FF']}
                                    tintColor={isDarkMode ? '#1A85FF' : '#1A85FF'}
                                />
                            }
                        >
                            {carregando ? (
                                <View style={styles.carregandoContainer}>
                                    <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Carregando...</Text>
                                </View>
                            ) : (
                                <View style={styles.cards}>
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
                                                onEditSuccess={fetchTurmas}
                                            />
                                        ))
                                    ) : (
                                        <Text style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>
                                            Nenhuma turma disponível.
                                        </Text>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>

                    <View style={styles.footerContainer}>
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
            {/* Modal para criar nova turma - Versão melhorada */}
            <Modal visible={modalCriarVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Criar Nova Turma</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setModalCriarVisible(false);
                                    limparCampos();
                                }}
                                style={styles.closeButton}
                            >
                                <Icon name="x" size={24} color={isDarkMode ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Seção de Informações Básicas */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Informações Básicas</Text>

                                {/* Nome da Turma */}
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Nome da Turma *</Text>
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
                                        placeholder="Ex: Turma A"
                                        placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                    />
                                    {erros.nomeTurma && <Text style={styles.erroTexto}>Este campo é obrigatório</Text>}
                                </View>

                                {/* Ano Letivo e Período */}
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Ano Letivo</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF' }]}>
                                            <Picker
                                                selectedValue={novoAno}
                                                onValueChange={(itemValue) => setNovoAno(itemValue)}
                                                style={{ color: isDarkMode ? 'white' : 'black' }}
                                                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                                            >
                                                <Picker.Item label="2024" value="2024" />
                                                <Picker.Item label="2025" value="2025" />
                                                <Picker.Item label="2026" value="2026" />
                                            </Picker>
                                        </View>
                                    </View>

                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Período</Text>
                                        <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF' }]}>
                                            <Picker
                                                selectedValue={novoPeriodo}
                                                onValueChange={(itemValue) => setNovoPeriodo(itemValue)}
                                                style={{ color: isDarkMode ? 'white' : 'black' }}
                                                dropdownIconColor={isDarkMode ? 'white' : 'black'}
                                            >
                                                <Picker.Item label="Matutino" value="Matutino" />
                                                <Picker.Item label="Vespertino" value="Vespertino" />
                                                <Picker.Item label="Noturno" value="Noturno" />
                                                <Picker.Item label="Integral" value="Integral" />
                                            </Picker>
                                        </View>
                                    </View>
                                </View>

                                {/* Capacidade e Sala */}
                                <View style={styles.row}>
                                    <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Capacidade *</Text>
                                        <TextInput
                                            style={[
                                                styles.modalInput,
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
                                            placeholder="Ex: 40"
                                            placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                        />
                                        {erros.capacidade && (
                                            <Text style={styles.erroTexto}>
                                                {parseInt(novaCapacidade) < 20 ? 'Mínimo 20 alunos' : 'Valor inválido'}
                                            </Text>
                                        )}
                                    </View>

                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Sala *</Text>
                                        <TextInput
                                            style={[
                                                styles.modalInput,
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
                            </View>

                            {/* Seção de Professores */}
                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Professores *</Text>
                                {erros.professores && <Text style={[styles.erroTexto, { marginBottom: 10 }]}>Selecione pelo menos um professor</Text>}

                                <View style={styles.checkboxList}>
                                    {professores.map((professor) => (
                                        <View key={professor.id} style={styles.checkboxItem}>
                                            <Checkbox
                                                status={selectedProfessores.includes(professor.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleProfessorSelect(professor.id)}
                                                color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                            />
                                            <Text style={[styles.checkboxLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                                {professor.nomeDocente.split(' ')[0]} {professor.nomeDocente.split(' ')[1]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Seção de Disciplinas */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Disciplinas *</Text>
                                    <TouchableOpacity
                                        onPress={() => setModalNovaDisciplinaVisible(true)}
                                        style={styles.addButton}
                                    >
                                        <Icon name="plus" size={20} color={isDarkMode ? '#1A85FF' : '#007AFF'} />
                                    </TouchableOpacity>
                                </View>
                                {erros.disciplinas && <Text style={[styles.erroTexto, { marginBottom: 10 }]}>Selecione pelo menos uma disciplina</Text>}

                                <View style={styles.checkboxList}>
                                    {disciplinas.map((disciplina) => (
                                        <View key={disciplina.id} style={styles.checkboxItem}>
                                            <Checkbox
                                                status={selectedDisciplinas.includes(disciplina.id) ? 'checked' : 'unchecked'}
                                                onPress={() => handleDisciplinaSelect(disciplina.id)}
                                                color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                            />
                                            <Text style={[styles.checkboxLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                                {disciplina.nomeDisciplina}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => {
                                    setModalCriarVisible(false);
                                    limparCampos();
                                }}
                                disabled={carregando}
                            >
                                <Text style={styles.actionButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton, carregando && { opacity: 0.6 }]}
                                onPress={criarTurma}
                                disabled={carregando}
                            >
                                <Text style={styles.actionButtonText}>
                                    {carregando ? 'Criando...' : 'Criar Turma'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para criar nova disciplina */}
           {/* Modal para criar nova disciplina */}
<Modal visible={modalNovaDisciplinaVisible} animationType="slide" transparent>
    <View style={styles.modalContainer}>
        <View style={[styles.modalDisciplinaContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
            <Text style={[styles.modalDisciplinaTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                Registrar Nova Disciplina
            </Text>
            
            <Text style={{ 
                color: isDarkMode ? 'white' : 'black', 
                marginBottom: 5,
                alignSelf: 'flex-start'
            }}>
                Nome da Disciplina *
            </Text>
            
            <TextInput
                style={[
                    styles.modalDisciplinaInput,
                    { 
                        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                        color: isDarkMode ? 'white' : 'black'
                    }
                ]}
                value={novaDisciplina}
                onChangeText={setNovaDisciplina}
                placeholder="Digite o nome da disciplina"
                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
            />
            
            <View style={styles.modalDisciplinaButtons}>
                <TouchableOpacity
                    style={[
                        styles.modalDisciplinaButton,
                        styles.modalDisciplinaCancelButton
                    ]}
                    onPress={() => {
                        setModalNovaDisciplinaVisible(false);
                        setNovaDisciplina('');
                    }}
                >
                    <Text style={styles.modalDisciplinaButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[
                        styles.modalDisciplinaButton,
                        styles.modalDisciplinaConfirmButton,
                        carregando && { opacity: 0.6 }
                    ]}
                    onPress={registrarNovaDisciplina}
                    disabled={carregando}
                >
                    <Text style={styles.modalDisciplinaButtonText}>
                        {carregando ? 'Registrando...' : 'Registrar'}
                    </Text>
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
        height: '100%',
        flexDirection: 'column',
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
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        maxHeight: '90%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        marginBottom: 25,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        marginBottom: 8,
        fontWeight: '500',
    },
    modalInput: {
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    pickerContainer: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    checkboxList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        marginBottom: 12,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 15,
    },
    addButton: {
        padding: 5,
        borderRadius: 20,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    actionButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#FF3B30',
        marginRight: 10,
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    erroTexto: {
        color: 'red',
        fontSize: 12,
        marginTop: -10,
        marginBottom: 10,
        marginLeft: 5
    },
    carregandoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    footerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 100,
        padding: 20,
        paddingBottom: 50,
    },
        modalDisciplinaContent: {
            width: '100%',
            borderTopRightRadius: 15,
            borderTopLeftRadius: 15,
            padding: 25,
            alignItems: 'center',
        },
        modalDisciplinaTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 20,
         
        },
        modalDisciplinaInput: {
            width: '100%',
        
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
            borderWidth: 1,
            
        },
        modalDisciplinaButtons: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        modalDisciplinaButton: {
            flex: 1,
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginHorizontal: 5,
        },
        modalDisciplinaCancelButton: {
            backgroundColor: '#FF3B30',
        },
        modalDisciplinaConfirmButton: {
            backgroundColor: '#007AFF',
        },
        modalDisciplinaButtonText: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
        },
 
});