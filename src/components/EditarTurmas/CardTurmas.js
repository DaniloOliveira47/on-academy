import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, TextInput, ScrollView, Alert, View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../path/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';
import CustomAlert from '../Gerais/CustomAlert';
import DeleteAlert from '../Gerais/DeleteAlert';

export default function CardTurmas({ turma, alunos, periodo, numero, navegacao, turmaId, onDelete, onEditSuccess }) {
    const formatarNomeProfessor = (nomeCompleto) => {
        const nomes = nomeCompleto.split(' ');
        if (nomes.length <= 2) return nomeCompleto;
        return `${nomes[0]} ${nomes[1]}`;
    };
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalNovaDisciplinaVisible, setModalNovaDisciplinaVisible] = useState(false);
    const [novaDisciplina, setNovaDisciplina] = useState('');
    const [editTurma, setEditTurma] = useState('');
    const [editAnoLetivo, setEditAnoLetivo] = useState('2025');
    const [editPeriodo, setEditPeriodo] = useState('');
    const [editCapacidade, setEditCapacidade] = useState('35');
    const [editSala, setEditSala] = useState('01');
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(false);
    const [erros, setErros] = useState({
        nomeTurma: false,
        capacidade: false,
        sala: false,
        professores: false,
        disciplinas: false
    });


    useEffect(() => {
        fetchProfessores();
        fetchDisciplinas();
    }, []);


    const registrarNovaDisciplina = async () => {
        if (!novaDisciplina.trim()) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, insira um nome para a disciplina');
            setAlertVisible(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                setAlertTitle('Erro');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                return;
            }

            setIsLoading(true);

            const response = await axios.post('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline', {
                nomeDisciplina: novaDisciplina
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            await fetchDisciplinas();
            setSelectedDisciplinas(prev => [...prev, response.data.id]);

            setAlertTitle('Sucesso');
            setAlertMessage('Disciplina registrada com sucesso!');
            setAlertVisible(true);

            setModalNovaDisciplinaVisible(false);
            setNovaDisciplina('');
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Não foi possível registrar a disciplina';
            setAlertTitle('Erro');
            setAlertMessage(mensagem);
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };


    const abrirModalEdicao = async () => {
        setModalVisible(true);
        setIsFetchingDetails(true);

        try {
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/teacher/disciplinas/${turmaId}`);
            const turmaDetalhada = response.data;

            setEditTurma(turmaDetalhada.nomeTurma || '');
            setEditAnoLetivo(turmaDetalhada.anoLetivoTurma || '2025');
            setEditPeriodo(turmaDetalhada.periodoTurma || periodo || 'Manhã');
            setEditCapacidade(turmaDetalhada.capacidadeMaximaTurma?.toString() || '35');
            setEditSala(turmaDetalhada.salaTurma?.toString() || '01');

            const professoresIds = turmaDetalhada.teachers.map(prof => prof.id);
            setSelectedProfessores(professoresIds);

            const disciplinasIds = turmaDetalhada.disciplines.map(disc => disc.id);
            setSelectedDisciplinas(disciplinasIds);

            setErros({
                nomeTurma: false,
                capacidade: false,
                sala: false,
                professores: false,
                disciplinas: false
            });

        } catch (error) {
            console.error('Erro ao buscar detalhes da turma:', error);
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível carregar os detalhes da turma');
            setAlertVisible(true);
        } finally {
            setIsFetchingDetails(false);
        }
    };


    const handleNavigate = () => {
        navigation.navigate(navegacao, { turmaId });
    };


    const deletarTurma = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                setAlertTitle('Erro');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                return;
            }

            // Show our custom delete alert instead of the default Alert.alert
            setDeleteAlertVisible(true);
        } catch (error) {
            setAlertTitle('Erro');
            setAlertMessage('Erro ao deletar turma. Tente novamente.');
            setAlertVisible(true);
        }
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('@user_token');
            await axios.delete(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/${turmaId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlertTitle('Sucesso');
            setAlertMessage('Turma excluída com sucesso!');
            setAlertVisible(true);
            setDeleteAlertVisible(false);
            onDelete(turmaId);
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Erro ao deletar turma. Tente novamente.';
            setAlertTitle('Erro');
            setAlertMessage(mensagem);
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };


    const validarCampos = () => {
        const nomeTrimado = editTurma.trim();
        const capacidadeValida = !isNaN(parseInt(editCapacidade)) && parseInt(editCapacidade) >= 20;
        const salaValida = !isNaN(parseInt(editSala)) && parseInt(editSala) > 0;

        const novosErros = {
            nomeTurma: nomeTrimado === '',
            capacidade: !capacidadeValida,
            sala: !salaValida,
            professores: selectedProfessores.length === 0,
            disciplinas: selectedDisciplinas.length === 0,
        };

        setErros(novosErros);

        if (nomeTrimado === '') {
            setAlertTitle('Atenção');
            setAlertMessage('Revise os campos');
            setAlertVisible(true);
            return false;
        }

        if (!capacidadeValida) {
            setAlertTitle('Atenção');
            setAlertMessage('Revise os campos');
            setAlertVisible(true);
            return false;
        }

        if (!salaValida) {
            setAlertTitle('Atenção');
            setAlertMessage('Revise os campos');
            setAlertVisible(true);
            return false;
        }

        if (novosErros.professores) {
            setAlertTitle('Atenção');
            setAlertMessage('Revise os campos');
            setAlertVisible(true);
            return false;
        }

        if (novosErros.disciplinas) {
            setAlertTitle('Atenção');
            setAlertMessage('Revise os campos');
            setAlertVisible(true);
            return false;
        }

        return true;
    };


    const salvarEdicao = async () => {
        if (!validarCampos()) return;

        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                setAlertTitle('Erro');
                setAlertMessage('Sessão expirada. Faça login novamente.');
                setAlertVisible(true);
                return;
            }

            setIsLoading(true);

            const dadosAtualizados = {
                nomeTurma: editTurma,
                anoLetivoTurma: editAnoLetivo,
                periodoTurma: editPeriodo,
                capacidadeMaximaTurma: parseInt(editCapacidade),
                salaTurma: parseInt(editSala),
                idTeacher: selectedProfessores,
                disciplineId: selectedDisciplinas
            };

            await axios.put(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/${turmaId}`, dadosAtualizados, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setAlertTitle('Sucesso');
            setAlertMessage('Turma atualizada com sucesso!');
            setAlertVisible(true);

            setModalVisible(false);
            if (onEditSuccess) onEditSuccess();
        } catch (error) {
            const mensagem = error.response?.data?.message || 'Erro ao atualizar turma. Tente novamente.';
            setAlertTitle('Erro');
            setAlertMessage(mensagem);
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
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

    const fetchProfessores = async () => {
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
            setAlertTitle('Aviso');
            setAlertMessage('Não foi possível carregar a lista de professores');
            setAlertVisible(true);
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline');
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            setAlertTitle('Aviso');
            setAlertMessage('Não foi possível carregar a lista de disciplinas');
            setAlertVisible(true);
        }
    };


    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
            <View style={styles.linha}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: isDarkMode ? 'white' : 'black' }}>
                    {turma?.nomeTurma || turma}
                </Text>
                <Text style={{ fontWeight: 'bold', color: isDarkMode ? 'white' : 'black' }}>
                    {numero}
                </Text>
            </View>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}>
                {alunos}
            </Text>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}>
                {turma?.periodoTurma || periodo}
            </Text>

            <View style={styles.botoesContainer}>
                <TouchableOpacity
                    onPress={handleNavigate}
                    style={styles.botao}
                    disabled={isLoading}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        {isLoading ? 'Carregando...' : 'Visualizar Turma'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={abrirModalEdicao}
                    style={styles.iconeBotao}
                    disabled={isLoading}
                >
                    <Icon name="edit" size={20} color={isLoading ? 'gray' : (isDarkMode ? 'white' : 'black')} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={deletarTurma}
                    style={styles.iconeBotao}
                    disabled={isLoading}
                >
                    <Icon name="trash" size={20} color={isLoading ? 'gray' : (isDarkMode ? 'red' : 'darkred')} />
                </TouchableOpacity>
            </View>


            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Editar Turma</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Icon name="x" size={24} color={isDarkMode ? 'white' : 'black'} />
                            </TouchableOpacity>
                        </View>

                        {isFetchingDetails ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Carregando detalhes da turma...</Text>
                            </View>
                        ) : (
                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >

                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Informações Básicas</Text>

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
                                            value={editTurma}
                                            onChangeText={(text) => {
                                                setEditTurma(text);
                                                setErros({ ...erros, nomeTurma: false });
                                            }}
                                            placeholder="Digite o nome da turma"
                                            placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                        />
                                        {erros.nomeTurma && (
                                            <Text style={styles.erroTexto}>Este campo é obrigatório</Text>
                                        )}
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                            <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Ano Letivo</Text>
                                            <View style={[styles.pickerContainer, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF' }]}>
                                                <Picker
                                                    selectedValue={editAnoLetivo}
                                                    onValueChange={(itemValue) => setEditAnoLetivo(itemValue)}
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
                                                    selectedValue={editPeriodo}
                                                    onValueChange={(itemValue) => setEditPeriodo(itemValue)}
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
                                                value={editCapacidade}
                                                onChangeText={(text) => {
                                                    setEditCapacidade(text);
                                                    setErros({ ...erros, capacidade: false });
                                                }}
                                                keyboardType="numeric"
                                                placeholder="Ex: 35"
                                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                            />
                                            {erros.capacidade && (
                                                <Text style={styles.erroTexto}>
                                                    {parseInt(editCapacidade) < 20 ? 'Mínimo 20 alunos' : 'Preencha este campo'}
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
                                                value={editSala}
                                                onChangeText={(text) => {
                                                    setEditSala(text);
                                                    setErros({ ...erros, sala: false });
                                                }}
                                                keyboardType="numeric"
                                                placeholder="Ex: 101"
                                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                            />
                                            {erros.sala && (
                                                <Text style={styles.erroTexto}>Preencha este campo</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>


                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Professores *</Text>
                                    {erros.professores && (
                                        <Text style={[styles.erroTexto, { marginBottom: 10 }]}>Selecione pelo menos um professor</Text>
                                    )}
                                    <View style={styles.checkboxList}>
                                        {professores.map((professor) => (
                                            <View key={professor.id} style={styles.checkboxItem}>
                                                <Checkbox
                                                    status={selectedProfessores.includes(professor.id) ? 'checked' : 'unchecked'}
                                                    onPress={() => handleProfessorSelect(professor.id)}
                                                    color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                                    disabled={isLoading}
                                                />
                                                <Text style={[styles.checkboxLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                                    {formatarNomeProfessor(professor.nomeDocente)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Disciplinas */}
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
                                    {erros.disciplinas && (
                                        <Text style={[styles.erroTexto, { marginBottom: 10 }]}>Selecione pelo menos uma disciplina</Text>
                                    )}
                                    <View style={styles.checkboxList}>
                                        {disciplinas.map((disciplina) => (
                                            <View key={disciplina.id} style={styles.checkboxItem}>
                                                <Checkbox
                                                    status={selectedDisciplinas.includes(disciplina.id) ? 'checked' : 'unchecked'}
                                                    onPress={() => handleDisciplinaSelect(disciplina.id)}
                                                    color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                                    disabled={isLoading}
                                                />
                                                <Text style={[styles.checkboxLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                                    {disciplina.nomeDisciplina}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>
                        )}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={isLoading || isFetchingDetails}
                            >
                                <Text style={styles.actionButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton, (isLoading || isFetchingDetails) && { opacity: 0.6 }]}
                                onPress={salvarEdicao}
                                disabled={isLoading || isFetchingDetails}
                            >
                                <Text style={styles.actionButtonText}>
                                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                                    isLoading && { opacity: 0.6 }
                                ]}
                                onPress={registrarNovaDisciplina}
                                disabled={isLoading}
                            >
                                <Text style={styles.modalDisciplinaButtonText}>
                                    {isLoading ? 'Registrando...' : 'Registrar'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />
            <DeleteAlert
                visible={deleteAlertVisible}
                onDismiss={() => setDeleteAlertVisible(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta turma permanentemente?"
                confirmText="EXCLUIR"
                cancelText="CANCELAR"
            />
        </View>
    );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        padding: 10,
        borderRadius: 15,
        marginBottom: 40
    },
    botao: {
        backgroundColor: '#1A85FF',
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
        flex: 1
    },
    iconeBotao: {
        padding: 6,
        marginLeft: 10
    },
    subTexto: {
        fontWeight: 'bold'
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    botoesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
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
        height: 50
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
        width: width * 0.4,
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
        padding: 5,
        borderRadius: 20,
    },
    erroTexto: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
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
        height: 50
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