import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import CardMateria from '../../Turmas/CardMateria';
import CardNota from '../../Turmas/CardNota';
import { useTheme } from '../../../path/ThemeContext';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function NotasTurma() {
    const route = useRoute();
    const { turmaId } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);
    const [alunoSelecionado, setAlunoSelecionado] = useState(null);
    const { isDarkMode } = useTheme();
    const [alunos, setAlunos] = useState([]);
    const [turmaInfo, setTurmaInfo] = useState({ nomeTurma: '', periodoTurma: '' });
    const [disciplinas, setDisciplinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notaInput, setNotaInput] = useState('');
    const [bimestreInput, setBimestreInput] = useState(1); // Inicia com o bimestre 1
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [notasAluno, setNotasAluno] = useState([]);

    useEffect(() => {
        const fetchAlunos = async () => {
            try {
                const response = await axios.get(`http://10.0.2.2:3000/api/class/students/${turmaId}`);

                setTurmaInfo({
                    nomeTurma: response.data.nomeTurma,
                    periodoTurma: response.data.periodoTurma,
                });

                // Adiciona a média das notas ao aluno
                const alunosComNotas = response.data.students.map(aluno => {
                    if (aluno.nota && aluno.nota.length > 0) {
                        const totalNotas = aluno.nota.reduce((acc, curr) => acc + curr.valorNota, 0);
                        const media = totalNotas / aluno.nota.length;
                        return { ...aluno, mediaNota: media.toFixed(2) }; // Mantém duas casas decimais
                    }
                    return { ...aluno, mediaNota: '-' }; // Caso não tenha notas
                });

                setAlunos(alunosComNotas);
            } catch (error) {
                setError('Erro ao buscar alunos. Tente novamente mais tarde.');
                console.error('Erro ao buscar alunos:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchDisciplinas = async () => {
            try {
                if (turmaInfo.nomeTurma) {
                    const response = await axios.get('http://10.0.2.2:3000/api/class/discipline');
                    const turma = response.data.find((turma) => turma.nomeTurma === turmaInfo.nomeTurma);
                    if (turma && Array.isArray(turma.disciplinas)) {
                        setDisciplinas(turma.disciplinas);
                        setDisciplinaSelecionada(turma.disciplinas[0]?.id);
                    } else {
                        setError('Disciplinas não encontradas para a turma.');
                        console.error('Disciplinas não encontradas:', turma);
                    }
                }
            } catch (error) {
                setError('Erro ao buscar disciplinas. Tente novamente mais tarde.');
                console.error('Erro ao buscar disciplinas:', error);
            }
        };

        if (turmaId) {
            fetchAlunos();
            fetchDisciplinas();
        }
    }, [turmaId, turmaInfo.nomeTurma]);

    const abrirModal = async (aluno) => {
        setAlunoSelecionado(aluno);
        setModalVisible(true);
        if (aluno) {
            await buscarNotasAluno(aluno.id);
        }
    };

    const buscarNotasAluno = async (alunoId) => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/student/${alunoId}`);
            setNotasAluno(response.data.notas);
        } catch (error) {
            console.error('Erro ao buscar notas do aluno:', error);
        }
    };

    const adicionarNota = async () => {
        if (!notaInput || !alunoSelecionado || !disciplinaSelecionada) {
            Alert.alert('Erro', 'Preencha todos os campos e selecione uma disciplina.');
            return;
        }

        try {
            const novaNota = {
                studentId: alunoSelecionado.id,
                nota: parseFloat(notaInput),
                bimestre: bimestreInput,
                status: "Aprovado",
                disciplineId: disciplinaSelecionada,
            };

            // Envia a nota para o backend
            await axios.post('http://10.0.2.2:3000/api/note', novaNota);

            // Atualiza o estado local com a nova nota
            setNotasAluno(prevNotas => [...prevNotas, novaNota]);

            // Limpa os campos e fecha o modal
            setNotaInput('');
            setBimestreInput(1);
            Alert.alert('Sucesso', 'Nota adicionada com sucesso!');
            setModalVisible(false);

        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar a nota. Tente novamente.');
            console.error('Erro ao adicionar nota:', error);
        }
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
        <View style={[styles.tela, { backgroundColor: '#F0F7FF' }]}>
            <HeaderSimples />
            <View style={{ padding: 10 }}>
                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>
                        {turmaInfo.nomeTurma} - {turmaInfo.periodoTurma}
                    </Text>
                    <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
                </View>

                <View style={[styles.containerBranco, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor="#756262"
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>

                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerText, { flex: 2 }]}>Nome do aluno</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Matrícula</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Média(%)</Text>
                        <Text style={[styles.headerText, { flex: 1 }]}>Notas</Text>
                    </View>

                    <FlatList
                        data={alunos}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.tableRow}>
                                <Text style={[styles.rowText, { flex: 2, color: isDarkMode ? 'white' : 'black' }]}>{item.nomeAluno}</Text>
                                <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{item.identifierCode}</Text>
                                <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{item.mediaNota}</Text>
                                <TouchableOpacity style={styles.notasButton} onPress={() => abrirModal(item)}>
                                    <Text style={styles.notasText}>Ver Notas</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </View>

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{alunoSelecionado?.nomeAluno}</Text>
                        <Picker
                            selectedValue={disciplinaSelecionada}
                            onValueChange={(itemValue) => {
                                setDisciplinaSelecionada(itemValue);
                            }}
                            style={styles.picker}
                        >
                            {disciplinas.map((disciplina) => (
                                <Picker.Item key={disciplina.id} label={disciplina.nomeDisciplina} value={disciplina.id} />
                            ))}
                        </Picker>

                        <View style={styles.contBoletim}>
                            <View style={styles.columnMateria}>
                                {disciplinas.map((disciplina) => (
                                    <CardMateria key={disciplina.id} materia={disciplina.nomeDisciplina} />
                                ))}
                            </View>
                            <View style={styles.columnNotas}>
                                {disciplinas.map((disciplina) => {
                                    const notaDisciplina = notasAluno.find(nota => 
                                        nota.nomeDisciplina === disciplina.nomeDisciplina && 
                                        nota.bimestre === bimestreInput
                                    );
                                    return (
                                        <CardNota 
                                            key={`${disciplina.id}-${bimestreInput}`} 
                                            nota={notaDisciplina ? notaDisciplina.nota : '-'} 
                                        />
                                    );
                                })}
                            </View>
                        </View>

                        {/* Campo de Nota e Seletor de Bimestre */}
                        <View style={styles.notaBimestreContainer}>
                            <TextInput
                                style={styles.inputNota}
                                placeholder="Nota"
                                placeholderTextColor="#756262"
                                value={notaInput}
                                onChangeText={setNotaInput}
                                keyboardType="numeric"
                            />
                            <View style={styles.pickerBimestreContainer}>
                                <Text style={styles.bimestreText}>Bimestre: {bimestreInput}</Text>
                                <Picker
                                    selectedValue={bimestreInput}
                                    onValueChange={(itemValue) => setBimestreInput(itemValue)}
                                    style={styles.pickerBimestre}
                                >
                                    <Picker.Item label="1" value={1} />
                                    <Picker.Item label="2" value={2} />
                                    <Picker.Item label="3" value={3} />
                                    <Picker.Item label="4" value={4} />
                                </Picker>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.adicionarButton} onPress={adicionarNota}>
                            <Text style={styles.adicionarText}>Adicionar Nota</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.fecharButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.fecharText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: '#F0F7FF',
        paddingBottom: 50,
    },
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
    contBoletim: {
        flexDirection: 'row',
        gap: 40,
    },
    containerBranco: {
        backgroundColor: '#FFF',
        borderRadius: 15,
        padding: 15,
        marginTop: 5,
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    linha: {
        marginTop: -5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
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
        marginBottom: 10,
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1A85FF',
        padding: 10,
        borderRadius: 5,
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    rowText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    notasButton: {
        flex: 1,
        alignItems: 'center',
    },
    notasText: {
        color: '#1A85FF',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    picker: {
        width: '100%',
        marginBottom: 10,
    },
    fecharButton: {
        marginTop: 15,
        backgroundColor: '#1A85FF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    fecharText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    inputNota: {
        borderWidth: 1,
        borderColor: '#1A85FF',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        width: '60%', // Ajuste para caber ao lado do Picker
    },
    pickerBimestreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '35%',
    },
    pickerBimestre: {
        width: '60%',
    },
    bimestreText: {
        fontSize: 16,
        color: '#333',
    },
    notaBimestreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '80%',
    },
    adicionarButton: {
        backgroundColor: '#1A85FF',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    adicionarText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});