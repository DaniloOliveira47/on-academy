import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, ActivityIndicator, Alert, ScrollView } from 'react-native';
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
    const [bimestreFiltro, setBimestreFiltro] = useState(1);
    const [disciplinaSelecionada, setDisciplinaSelecionada] = useState(null);
    const [notasAluno, setNotasAluno] = useState([]);
    const [mostrarCamposNota, setMostrarCamposNota] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const alunosResponse = await axios.get(`http://192.168.2.11:3000/api/class/students/${turmaId}`);

                setTurmaInfo({
                    nomeTurma: alunosResponse.data.nomeTurma,
                    periodoTurma: alunosResponse.data.periodoTurma,
                });

                const alunosComNotas = alunosResponse.data.students.map(aluno => {
                    if (aluno.nota && aluno.nota.length > 0) {
                        const totalNotas = aluno.nota.reduce((acc, curr) => acc + curr.valorNota, 0);
                        const media = totalNotas / aluno.nota.length;
                        return { ...aluno, mediaNota: media.toFixed(2) };
                    }
                    return { ...aluno, mediaNota: '-' };
                });

                setAlunos(alunosComNotas);

                const disciplinasResponse = await axios.get('http://192.168.2.11:3000/api/class/discipline');
                const turma = disciplinasResponse.data.find(t => t.nomeTurma === alunosResponse.data.nomeTurma);

                if (turma && Array.isArray(turma.disciplinas)) {
                    setDisciplinas(turma.disciplinas);
                    setDisciplinaSelecionada(turma.disciplinas[0]?.id);
                } else {
                    setError('Disciplinas não encontradas para a turma.');
                }
            } catch (error) {
                setError('Erro ao buscar dados. Tente novamente mais tarde.');
            } finally {
                setLoading(false);
            }
        };

        if (turmaId) fetchData();
    }, [turmaId]);

    const abrirModal = async (aluno) => {
        setAlunoSelecionado(aluno);
        setModalVisible(true);
        setMostrarCamposNota(false);
        if (aluno) {
            await buscarNotasAluno(aluno.id);
        }
    };

    const buscarNotasAluno = async (alunoId) => {
        try {
            const response = await axios.get(`http://192.168.2.11:3000/api/student/${alunoId}`);
            setNotasAluno(response.data.notas || []);
        } catch (error) {
            console.error("Erro ao buscar notas:", error);
            setNotasAluno([]);
        }
    };

    const adicionarNota = async () => {
        if (!notaInput || !alunoSelecionado || !disciplinaSelecionada) {
            Alert.alert('Erro', 'Preencha todos os campos e selecione uma disciplina.');
            return;
        }

        try {
            const disciplina = disciplinas.find(d => d.id === disciplinaSelecionada);

            const novaNota = {
                studentId: alunoSelecionado.id,
                nota: parseFloat(notaInput),
                bimestre: bimestreFiltro,
                status: "Aprovado",
                disciplineId: disciplinaSelecionada,
                nomeDisciplina: disciplina?.nomeDisciplina || 'Desconhecida'
            };

            await axios.post('http://192.168.2.11:3000/api/note', novaNota);

            const updatedNotas = [...notasAluno, novaNota];
            setNotasAluno(updatedNotas);

            const notasFiltradas = updatedNotas.filter(nota =>
                nota.disciplineId === disciplinaSelecionada
            );

            const total = notasFiltradas.reduce((sum, nota) => sum + nota.nota, 0);
            const media = (total / notasFiltradas.length).toFixed(2);

            setAlunos(alunos.map(aluno =>
                aluno.id === alunoSelecionado.id
                    ? { ...aluno, mediaNota: media }
                    : aluno
            ));

            setNotaInput('');
            Alert.alert('Sucesso', 'Nota adicionada com sucesso!');
            setMostrarCamposNota(false);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar a nota. Tente novamente.');
        }
    };

    const notasPorBimestreEDisciplina = () => {
        return notasAluno.filter(nota => nota.bimestre === bimestreFiltro);
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
        <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
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
                        renderItem={({ item }) => {
                            const nomeCompleto = item.nomeAluno.split(' ');
                            const doisPrimeirosNomes = nomeCompleto.slice(0, 2).join(' ');

                            return (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.rowText, { flex: 2, color: isDarkMode ? 'white' : 'black' }]}>
                                        {doisPrimeirosNomes}
                                    </Text>
                                    <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>
                                        {item.identifierCode}
                                    </Text>
                                    <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>
                                        {item.mediaNota}
                                    </Text>
                                    <TouchableOpacity style={styles.notasButton} onPress={() => abrirModal(item)}>
                                        <Text style={styles.notasText}>Ver Notas</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>

            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, {
                        backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
                        maxHeight: '85%'
                    }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                                {alunoSelecionado?.nomeAluno}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="x" size={24} color={isDarkMode ? 'white' : '#1A85FF'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filtroContainer}>
                            <Text style={[styles.filtroLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                Bimestre:
                            </Text>
                            <View style={styles.filtroBimestre}>
                                {[1, 2, 3, 4].map((bimestre) => (
                                    <TouchableOpacity
                                        key={bimestre}
                                        style={[
                                            styles.bimestreButton,
                                            bimestreFiltro === bimestre && styles.bimestreButtonSelected,
                                            { borderColor: isDarkMode ? '#444' : '#1A85FF' }
                                        ]}
                                        onPress={() => setBimestreFiltro(bimestre)}
                                    >
                                        <Text style={[
                                            styles.bimestreButtonText,
                                            { color: isDarkMode ? 'white' : 'black' },
                                            bimestreFiltro === bimestre && styles.bimestreButtonTextSelected
                                        ]}>
                                            {bimestre}º
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
                            <View style={styles.contBoletim}>
                                <View style={styles.columnMateria}>
                                    {disciplinas.map((disciplina) => (
                                        <CardMateria
                                            key={disciplina.id}
                                            materia={disciplina.nomeDisciplina}
                                        />
                                    ))}
                                </View>
                                <View style={styles.columnNotas}>
                                    {disciplinas.map((disciplina) => {
                                        const notaDisciplina = notasPorBimestreEDisciplina()
                                            .find(nota => nota.nomeDisciplina === disciplina.nomeDisciplina);

                                        return (
                                            <CardNota
                                            key={`${disciplina.id}-${bimestreFiltro}`}
                                            nota={notaDisciplina ? notaDisciplina.nota.toString() : '-'}
                                            notaId={notaDisciplina?.idNota}
                                            alunoId={alunoSelecionado?.id}
                                            disciplinaId={disciplina.id}
                                            bimestre={bimestreFiltro}
                                            onNotaUpdated={(novaNota) => {
                                                const notasAtualizadas = notasAluno.map(nota =>
                                                    nota.id === notaDisciplina.id ? { ...nota, nota: novaNota } : nota
                                                );
                                                setNotasAluno(notasAtualizadas);
                                        
                                                const notasFiltradas = notasAtualizadas.filter(nota =>
                                                    nota.disciplineId === disciplinaSelecionada
                                                );
                                                const total = notasFiltradas.reduce((sum, nota) => sum + nota.nota, 0);
                                                const media = (total / notasFiltradas.length).toFixed(2);
                                        
                                                setAlunos(alunos.map(aluno =>
                                                    aluno.id === alunoSelecionado.id
                                                        ? { ...aluno, mediaNota: media }
                                                        : aluno
                                                ));
                                            }}
                                        />
                                        );
                                    })}
                                </View>
                            </View>

                            {mostrarCamposNota ? (
                                <>
                                    <View style={styles.notaInputContainer}>
                                        <View style={styles.pickerContainer}>
                                            <Text style={[styles.pickerLabel, { color: isDarkMode ? 'white' : 'black' }]}>
                                                Disciplina:
                                            </Text>
                                            <Picker
                                                selectedValue={disciplinaSelecionada}
                                                onValueChange={setDisciplinaSelecionada}
                                                style={[styles.picker, { color: isDarkMode ? 'white' : 'black' }]}
                                                dropdownIconColor={isDarkMode ? 'white' : '#1A85FF'}
                                            >
                                                {disciplinas.map((disciplina) => (
                                                    <Picker.Item
                                                        key={disciplina.id}
                                                        label={disciplina.nomeDisciplina}
                                                        value={disciplina.id}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>

                                        <TextInput
                                            style={[styles.inputNota, {
                                                borderColor: isDarkMode ? '#444' : '#1A85FF',
                                                color: isDarkMode ? 'white' : 'black'
                                            }]}
                                            placeholder="Digite a nota"
                                            placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                            value={notaInput}
                                            onChangeText={setNotaInput}
                                            keyboardType="numeric"
                                        />
                                    </View>

                                    <View style={styles.actionButtonsContainer}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                                            onPress={adicionarNota}
                                        >
                                            <Text style={styles.actionButtonText}>Salvar Nota</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                                            onPress={() => setMostrarCamposNota(false)}
                                        >
                                            <Text style={styles.actionButtonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#1A85FF' }]}
                                    onPress={() => setMostrarCamposNota(true)}
                                >
                                    <Text style={styles.actionButtonText}>Adicionar Nota</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.fecharButton, { backgroundColor: isDarkMode ? '#333' : '#E0E0E0' }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.fecharText, { color: isDarkMode ? 'white' : 'black' }]}>Fechar</Text>
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
        marginBottom: 20,
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
        width: '90%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 20,
        maxHeight: '85%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
    },
    modalScroll: {
        width: '100%',
    },
    modalScrollContent: {
        paddingBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        marginBottom: 15,
        overflow: 'hidden',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    notaInputContainer: {
        marginBottom: 15,
    },
    inputNota: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginTop: 10,
        fontSize: 16,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    actionButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fecharButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    fecharText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    columnMateria: {
        flex: 1,
    },
    columnNotas: {
        flex: 1,
    },
    filtroContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    filtroLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    filtroBimestre: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    bimestreButton: {
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginHorizontal: 2,
    },
    bimestreButtonSelected: {
        backgroundColor: '#1A85FF',
        borderColor: '#1A85FF',
    },
    bimestreButtonText: {
        fontSize: 14,
    },
    bimestreButtonTextSelected: {
        color: 'white',
        fontWeight: 'bold',
    },
    pickerLabel: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
});