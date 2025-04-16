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

    // Estados para os checkboxes de professores e disciplinas
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);

    // Número de cards por página
    const CARDS_POR_PAGINA = 3;

    // Estilo para os pickers
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

    // Função para buscar turmas, professores e disciplinas
    const fetchTurmas = async () => {
        try {
            const response = await axios.get('http://192.168.2.11:3000/api/class');
            if (response.data && Array.isArray(response.data)) {
                setTurmas(response.data);
                setTurmasFiltradas(response.data);
            } else {
                setTurmas([]);
                setTurmasFiltradas([]);
            }
        } catch (error) {
            setTurmas([]);
            setTurmasFiltradas([]);
        }
    };

    const fetchProfessores = async () => {
        try {
            const response = await axios.get('http://192.168.2.11:3000/api/teacher');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('http://192.168.2.11:3000/api/discipline');
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

    // Função para abrir o modal de edição com dados detalhados
    const abrirModalEditar = async (turma) => {
        try {
            const response = await axios.get(`http://192.168.2.11:3000/api/class/teacher/disciplinas/${turma.id}`);
            const turmaDetalhada = response.data;

            setTurmaEditando(turmaDetalhada);
            setNovaTurma(turmaDetalhada.nomeTurma);
            setNovoAno(new Date(turmaDetalhada.anoLetivoTurma).getFullYear().toString());
            setNovoPeriodo(turmaDetalhada.periodoTurma);
            setNovaCapacidade(turmaDetalhada.capacidadeMaximaTurma.toString());
            setNovaSala(turmaDetalhada.salaTurma.toString());

            // Set selected professors
            const professoresIds = turmaDetalhada.teachers.map(prof => prof.id);
            setSelectedProfessores(professoresIds);

            // Set selected disciplines
            const disciplinasIds = turmaDetalhada.disciplines.map(disc => disc.id);
            setSelectedDisciplinas(disciplinasIds);

            setModalEditarVisible(true);
        } catch (error) {
            console.error('Erro ao buscar detalhes da turma:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da turma');
        }
    };

    // Função para criar uma nova turma
    const criarTurma = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no Async Storage');
                return;
            }

            const anoLetivoTurma = novoAno;

            const turmaData = {
                nomeTurma: novaTurma,
                anoLetivoTurma: anoLetivoTurma,
                capacidadeMaximaTurma: parseInt(novaCapacidade),
                salaTurma: parseInt(novaSala),
                periodoTurma: novoPeriodo,
                idTeacher: selectedProfessores,
                disciplineId: selectedDisciplinas,
            };

            await axios.post('http://192.168.2.11:3000/api/class', turmaData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Alert.alert('Sucesso', 'Turma criada com sucesso!');
            setModalCriarVisible(false);
            limparCampos();
            fetchTurmas();
        } catch (error) {
            Alert.alert('Erro', 'Erro ao criar turma. Tente novamente.');
        }
    };

    // Função para editar uma turma existente
    const editarTurma = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no Async Storage');
                return;
            }

            const anoLetivoTurma = `${novoAno}-01-01T00:00:00.000Z`;

            const turmaData = {
                nomeTurma: novaTurma,
                anoLetivoTurma: anoLetivoTurma,
                capacidadeMaximaTurma: parseInt(novaCapacidade),
                salaTurma: parseInt(novaSala),
                periodoTurma: novoPeriodo,
                idTeacher: selectedProfessores,
                disciplineId: selectedDisciplinas,
            };

            await axios.put(`http://192.168.2.11:3000/api/class/${turmaEditando.id}`, turmaData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
            setModalEditarVisible(false);
            limparCampos();
            fetchTurmas();
        } catch (error) {
            console.error('Erro ao editar turma:', error);
            Alert.alert('Erro', 'Erro ao editar turma. Tente novamente.');
        }
    };

    // Função para registrar uma nova disciplina
    const registrarNovaDisciplina = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no Async Storage');
                return;
            }

            if (!novaDisciplina.trim()) {
                Alert.alert('Erro', 'Por favor, insira um nome para a disciplina');
                return;
            }

            const response = await axios.post(
                'http://192.168.2.11:3000/api/discipline',
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
            fetchDisciplinas(); // Atualiza a lista de disciplinas
        } catch (error) {
            console.error('Erro ao registrar disciplina:', error);
            Alert.alert('Erro', 'Não foi possível registrar a disciplina. Tente novamente.');
        }
    };

    // Função para limpar os campos do formulário
    const limparCampos = () => {
        setNovaTurma('');
        setNovoAno('2025');
        setNovoPeriodo('Manhã');
        setNovaCapacidade('');
        setNovaSala('');
        setSelectedProfessores([]);
        setSelectedDisciplinas([]);
        setTurmaEditando(null);
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
            setTurmasFiltradas(turmas);
        }
        setPaginaSelecionada(1);
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
                                    alunos={`${turma.alunosAtivos || 0} Alunos ativos`}
                                    periodo={`Período: ${turma.periodoTurma}`}
                                    turmaId={turma.id}
                                    navegacao="Alunos"
                                    onEditPress={() => abrirModalEditar(turma)}
                                    onDelete={handleTurmaExcluida}
                                />
                            ))
                        ) : (
                            <Text style={{ color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>
                                Nenhuma turma disponível.
                            </Text>
                        )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 70, position: 'absolute', marginTop: 570, padding: 20 }}>
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

            {/* Modal para criar nova turma */}
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
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: -11}}>
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
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]} onPress={() => {
                                setModalCriarVisible(false);
                                limparCampos();
                            }}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]} onPress={criarTurma}>
                                <Text style={styles.textoBotao}>Criar Turma</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para editar turma */}
            <Modal visible={modalEditarVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Editar Turma</Text>

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
                                    <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Selecione as Disciplinas</Text>
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
                                    <TouchableOpacity
                                        style={[styles.botaoNovaDisciplina, { backgroundColor: isDarkMode ? '#1A85FF' : '#007AFF' }]}
                                        onPress={() => setModalNovaDisciplinaVisible(true)}
                                    >
                                        <Text style={{ color: 'white', textAlign: 'center' }}>Registrar Nova Disciplina</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoCancelar]} onPress={() => {
                                setModalEditarVisible(false);
                                limparCampos();
                            }}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botaoAcao, styles.botaoSalvar]} onPress={editarTurma}>
                                <Text style={styles.textoBotao}>Salvar Alterações</Text>
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
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#D1D1D1',
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
        width: '48%'
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
});