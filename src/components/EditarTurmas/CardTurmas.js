import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Modal, TextInput, ScrollView, Alert, View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../path/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';

export default function CardTurmas({ turma, alunos, periodo, numero, navegacao, turmaId, onDelete }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [editTurma, setEditTurma] = useState('');
    const [editAnoLetivo, setEditAnoLetivo] = useState('2025-01-01');
    const [editPeriodo, setEditPeriodo] = useState('');
    const [editCapacidade, setEditCapacidade] = useState('35');
    const [editSala, setEditSala] = useState('01');
    const [selectedProfessores, setSelectedProfessores] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [professores, setProfessores] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Inicializa os estados com os dados da turma
    useEffect(() => {
        if (turma) {
            setEditTurma(turma.nomeTurma || '');
            setEditAnoLetivo(turma.anoLetivoTurma || '2025-01-01');
            setEditPeriodo(turma.periodoTurma || periodo || 'Manhã');
            setEditCapacidade(turma.capacidadeMaximaTurma?.toString() || '35');
            setEditSala(turma.salaTurma?.toString() || '01');
            setSelectedProfessores(turma.idTeacher || []);
            setSelectedDisciplinas(turma.disciplineId || []);
        }
    }, [turma, periodo]);

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
                                await axios.delete(`http://10.0.2.2:3000/api/class/${turmaId}`, {
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                });

                                Alert.alert('Sucesso', 'Turma excluída com sucesso!');
                                onDelete(turmaId);
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
            console.error('Erro ao deletar turma:', error);
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

            await axios.put(`http://10.0.2.2:3000/api/class/${turmaId}`, dadosAtualizados, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            Alert.alert('Sucesso', 'Turma atualizada com sucesso!');
            setModalVisible(false);
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

    // Busca professores e disciplinas ao carregar o componente
    useEffect(() => {
        fetchProfessores();
        fetchDisciplinas();
    }, []);

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
                    onPress={() => setModalVisible(true)} 
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
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Editar Turma</Text>

                        <ScrollView>
                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Nome da Turma</Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                value={editTurma}
                                onChangeText={setEditTurma}
                                placeholder="Digite o nome da turma"
                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                            />

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Ano Letivo</Text>
                            <Picker
                                selectedValue={editAnoLetivo.split('-')[0]}
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                onValueChange={(itemValue) => setEditAnoLetivo(`${itemValue}-01-01`)}>
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                            </Picker>

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Período</Text>
                            <Picker
                                selectedValue={editPeriodo}
                                style={[styles.modalInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                onValueChange={(itemValue) => setEditPeriodo(itemValue)}>
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
                                    value={editCapacidade}
                                    onChangeText={setEditCapacidade}
                                    keyboardType="numeric"
                                    placeholder="Ex: 35"
                                    placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                />
                                <TextInput
                                    style={[styles.modalInput, styles.smallInput, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF', color: isDarkMode ? 'white' : 'black' }]}
                                    value={editSala}
                                    onChangeText={setEditSala}
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
                                                color={isDarkMode ? '#1A85FF' : '#007AFF'}
                                                disabled={isLoading}
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
                                                disabled={isLoading}
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
                                onPress={() => setModalVisible(false)}
                                disabled={isLoading}
                            >
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.botaoAcao, styles.botaoSalvar, isLoading && { opacity: 0.6 }]} 
                                onPress={salvarEdicao}
                                disabled={isLoading}
                            >
                                <Text style={styles.textoBotao}>
                                    {isLoading ? 'Salvando...' : 'Salvar'}
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '90%',
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
});