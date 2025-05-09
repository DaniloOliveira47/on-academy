import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, TextInput, ScrollView, Alert, View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../path/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';

export default function CardTurmas({ turma, alunos, periodo, numero, navegacao, turmaId, onDelete, onEditSuccess }) {
    const formatarNomeProfessor = (nomeCompleto) => {
        const nomes = nomeCompleto.split(' ');
        if (nomes.length <= 2) return nomeCompleto;
        return `${nomes[0]} ${nomes[1]}`;
    };
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
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

    // Busca professores e disciplinas ao carregar o componente
    useEffect(() => {
        fetchProfessores();
        fetchDisciplinas();
    }, []);

    // Função para registrar nova disciplina
    const registrarNovaDisciplina = async () => {
        if (!novaDisciplina.trim()) {
            Alert.alert('Erro', 'Por favor, insira um nome para a disciplina');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no AsyncStorage');
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

            // Atualiza a lista de disciplinas
            await fetchDisciplinas();

            // Seleciona automaticamente a nova disciplina
            setSelectedDisciplinas(prev => [...prev, response.data.id]);

            Alert.alert('Sucesso', 'Disciplina registrada com sucesso!');
            setModalNovaDisciplinaVisible(false);
            setNovaDisciplina('');
        } catch (error) {
            console.error('Erro ao registrar disciplina:', error);
            Alert.alert('Erro', 'Não foi possível registrar a disciplina');
        } finally {
            setIsLoading(false);
        }
    };

    // Função para abrir o modal e buscar os detalhes da turma
    const abrirModalEdicao = async () => {
        setModalVisible(true);
        setIsFetchingDetails(true);

        try {
            // Busca os detalhes completos da turma
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/teacher/disciplinas/${turmaId}`);
            const turmaDetalhada = response.data;

            // Atualiza os estados com os dados da turma
            setEditTurma(turmaDetalhada.nomeTurma || '');
            setEditAnoLetivo(turmaDetalhada.anoLetivoTurma || '2025');
            setEditPeriodo(turmaDetalhada.periodoTurma || periodo || 'Manhã');
            setEditCapacidade(turmaDetalhada.capacidadeMaximaTurma?.toString() || '35');
            setEditSala(turmaDetalhada.salaTurma?.toString() || '01');

            // Atualiza professores e disciplinas selecionados
            const professoresIds = turmaDetalhada.teachers.map(prof => prof.id);
            setSelectedProfessores(professoresIds);

            const disciplinasIds = turmaDetalhada.disciplines.map(disc => disc.id);
            setSelectedDisciplinas(disciplinasIds);

        } catch (error) {
            console.error('Erro ao buscar detalhes da turma:', error);
            Alert.alert('Erro', 'Não foi possível carregar os detalhes da turma');
        } finally {
            setIsFetchingDetails(false);
        }
    };

    // Navega para outra tela com os dados da turma
    const handleNavigate = () => {
        navigation.navigate(navegacao, { turmaId });
    };

    // Função para excluir a turma
    const deletarTurma = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no AsyncStorage');
                return;
            }

            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir esta turma?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: async () => {
                            setIsLoading(true);
                            try {
                                await axios.delete(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class/${turmaId}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                });

                                Alert.alert('Sucesso', 'Turma excluída com sucesso!');
                                onDelete(turmaId); // Chame a função onDelete passada como prop
                            } catch (error) {
                                console.error('Erro ao deletar turma:', error);
                                Alert.alert('Erro', 'Erro ao deletar turma. Tente novamente.');
                            } finally {
                                setIsLoading(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Erro', 'Erro ao deletar turma. Tente novamente.');
        }
    };

    // Função para salvar as alterações da turma
    const salvarEdicao = async () => {
        // Validação dos campos numéricos
        if (isNaN(parseInt(editCapacidade)) || isNaN(parseInt(editSala))) {
            Alert.alert('Erro', 'Capacidade e Sala devem ser números válidos');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                console.error('Token não encontrado no AsyncStorage');
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

            Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
            setModalVisible(false);
            if (onEditSuccess) onEditSuccess(); // Notifica o componente pai sobre a edição
        } catch (error) {
            console.error('Erro ao atualizar turma:', error);
            Alert.alert('Erro', 'Erro ao atualizar turma. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

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

    const fetchProfessores = async () => {
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net//teacher');
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao buscar professores:', error);
        }
    };

    const fetchDisciplinas = async () => {
        try {
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline');
            setDisciplinas(response.data);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
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

            {/* Modal de Edição */}
             {/* Modal de Edição */}
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
                                {/* Informações Básicas */}
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Informações Básicas</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Nome da Turma</Text>
                                        <TextInput
                                            style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                            value={editTurma}
                                            onChangeText={setEditTurma}
                                            placeholder="Digite o nome da turma"
                                            placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                        />
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
                                            <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Capacidade</Text>
                                            <TextInput
                                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                                value={editCapacidade}
                                                onChangeText={setEditCapacidade}
                                                keyboardType="numeric"
                                                placeholder="Ex: 35"
                                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                            />
                                        </View>

                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.inputLabel, { color: isDarkMode ? 'white' : 'black' }]}>Sala</Text>
                                            <TextInput
                                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                                value={editSala}
                                                onChangeText={setEditSala}
                                                keyboardType="numeric"
                                                placeholder="Ex: 101"
                                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Professores */}
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Professores</Text>
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
                                        <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>Disciplinas</Text>
                                        <TouchableOpacity
                                            onPress={() => setModalNovaDisciplinaVisible(true)}
                                            style={styles.addButton}
                                        >
                                            <Icon name="plus" size={20} color={isDarkMode ? '#1A85FF' : '#007AFF'} />
                                        </TouchableOpacity>
                                    </View>
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
        borderColor: '#E0E0E0',
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
});