import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, TextInput, ScrollView, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Campo from '../../Perfil/Campo';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../path/ThemeContext';

export default function PerfilAluno() {
    const route = useRoute();
    const { alunoId } = route.params; // Obtenha o ID do aluno da navegação
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        matricula: '',
        telefone: '',
        nascimento: '',
        turma: '',
        senha: '********',
    });
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [ocorrencias, setOcorrencias] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]); // Estado para armazenar os feedbacks
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1); // Estado para o bimestre selecionado
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false); // Estado para o modal de seleção de bimestre

    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';

    // Busca os dados do aluno
    const fetchAluno = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/student/${alunoId}`);
            if (response.data) {
                const alunoData = response.data;
                setPerfil({
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: alunoData.dataNascimentoAluno.split(' ')[0], // Formata a data
                    turma: alunoData.turma.nomeTurma,
                    senha: '********',
                });
                setPerfilEdit({
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: alunoData.dataNascimentoAluno.split(' ')[0],
                    turma: alunoData.turma.nomeTurma,
                    senha: '********',
                });
            } else {
                setError('Aluno não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do aluno:', error);
            setError('Erro ao carregar dados do aluno.');
        } finally {
            setLoading(false);
        }
    };

    // Busca os feedbacks do aluno
    const fetchFeedbacks = async () => {
        try {
            const response = await axios.get(`http://10.0.2.2:3000/api/student/feedback/${alunoId}`);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Erro ao buscar feedbacks:', error);
        }
    };

    useEffect(() => {
        if (alunoId) {
            fetchAluno();
            fetchFeedbacks();
        } else {
            setError('ID do aluno não fornecido.');
            setLoading(false);
        }
    }, [alunoId]);

    // Filtra os feedbacks pelo bimestre selecionado
    const feedbacksFiltrados = feedbacks.filter(feedback => feedback.bimestre === bimestreSelecionado);

    // Calcula as médias das respostas para o gráfico
    const calcularMedias = () => {
        if (feedbacksFiltrados.length === 0) {
            return [0, 0, 0, 0, 0]; // Retorna zeros se não houver feedbacks
        }

        const somaRespostas = feedbacksFiltrados.reduce((acc, feedback) => {
            return {
                resposta1: acc.resposta1 + feedback.resposta1,
                resposta2: acc.resposta2 + feedback.resposta2,
                resposta3: acc.resposta3 + feedback.resposta3,
                resposta4: acc.resposta4 + feedback.resposta4,
                resposta5: acc.resposta5 + feedback.resposta5,
            };
        }, { resposta1: 0, resposta2: 0, resposta3: 0, resposta4: 0, resposta5: 0 });

        const medias = [
            somaRespostas.resposta1 / feedbacksFiltrados.length,
            somaRespostas.resposta2 / feedbacksFiltrados.length,
            somaRespostas.resposta3 / feedbacksFiltrados.length,
            somaRespostas.resposta4 / feedbacksFiltrados.length,
            somaRespostas.resposta5 / feedbacksFiltrados.length,
        ];

        return medias;
    };

    const medias = calcularMedias();

    const data = {
        labels: ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'],
        datasets: [{
            data: medias,
            colors: [
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6'
            ]
        }]
    };

    const handleEditSave = () => {
        setPerfil(perfilEdit);
        setModalEditVisible(false);
    };

    const handleDelete = () => {
        console.log('Perfil excluído');
        setModalDeleteVisible(false);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: perfilBackgroundColor }]}>
                <ActivityIndicator size="large" color="#1E6BE6" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: perfilBackgroundColor }]}>
                <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
            <HeaderSimples titulo="PERFIL" />
            <View style={{ padding: 15 }}>
                <Image
                    style={[styles.barraAzul, { backgroundColor: barraAzulColor }]}
                    source={require('../../../assets/image/barraAzul.png')}
                />
                <View style={[styles.form, { backgroundColor: formBackgroundColor }]}>
                    <View style={styles.linhaUser}>
                        <Image source={require('../../../assets/image/Perfill.png')} />
                        <View style={styles.name}>
                            <Text style={[styles.nome, { color: textColor }]}>{perfil.nome}</Text>
                            <Text style={[styles.email, { color: textColor }]}>{perfil.email}</Text>
                        </View>
                    </View>
                    <Campo label="Nome Completo" text={perfil.nome} textColor={textColor} />
                    <Campo label="Email" text={perfil.email} textColor={textColor} />
                    <Campo label="Nº Matrícula" text={perfil.matricula} textColor={textColor} />
                    <View style={styles.inlineFieldsContainer}>
                        <Campo label="Telefone" text={perfil.telefone} textColor={textColor} isInline={true} />
                        <Campo label="Data de Nascimento" text={perfil.nascimento} textColor={textColor} isInline={true} />
                    </View>
                    <View style={styles.inlineFieldsContainer}>
                        <Campo label="Senha" text={perfil.senha} textColor={textColor} isPassword={true} isInline={true} />
                        <Campo label="Turma" text={perfil.turma} textColor={textColor} isInline={true} />
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={() => setModalEditVisible(true)} style={styles.iconeBotao}>
                            <Icon name="edit" size={20} color={isDarkMode ? 'white' : 'black'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalDeleteVisible(true)} style={styles.iconeBotao}>
                            <Icon name="trash" size={20} color={isDarkMode ? 'red' : 'darkred'} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.tabelaContainer, { backgroundColor: formBackgroundColor }]}>
                    <View style={[styles.tabelaHeader, { backgroundColor: '#F0F7FF' }]}>
                        <Text style={[styles.tabelaHeaderText, { color: 'black' }]}>Ocorrência</Text>
                        <Text style={[styles.tabelaHeaderText, { color: 'black' }]}>Turma</Text>
                        <Text style={[styles.tabelaHeaderText, { color: 'black' }]}>Data</Text>
                    </View>
                    <FlatList
                        data={ocorrencias}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.tabelaRow}>
                                <Text style={[styles.tabelaText, { color: textColor }]}>{item.ocorrencia}</Text>
                                <Text style={[styles.tabelaText, { color: textColor }]}>{item.turma}</Text>
                                <Text style={[styles.tabelaText, { color: textColor }]}>{item.data}</Text>
                            </View>
                        )}
                    />
                    {/* Seleção de Bimestre */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => setModalBimestreVisible(true)}
                        >
                            <Text style={{ color: textColor, marginRight: 10 }}>Bimestre: {bimestreSelecionado}º</Text>
                            <Icon name="chevron-down" size={20} color={textColor} />
                        </TouchableOpacity>
                    </View>
                    <BarChart
                        data={data}
                        width={screenWidth * 0.99}
                        height={200}
                        yAxisSuffix="%"
                        fromZero
                        showBarTops={false}
                        withCustomBarColorFromData={true}
                        flatColor={true}
                        chartConfig={{
                            backgroundGradientFrom: perfilBackgroundColor,
                            backgroundGradientTo: perfilBackgroundColor,
                            decimalPlaces: 0,
                            color: () => '#1E6BE6',
                            labelColor: () => textColor,
                            barPercentage: 1.2,
                            fillShadowGradient: '#A9C1F7',
                            fillShadowGradientOpacity: 1,
                        }}
                        style={[styles.chart, { borderTopWidth: 2, color: textColor }]}
                    />
                </View>
            </View>

            {/* Modal de Seleção de Bimestre */}
            <Modal visible={modalBimestreVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Selecione o Bimestre</Text>
                        {[1, 2, 3, 4].map((bimestre) => (
                            <TouchableOpacity
                                key={bimestre}
                                style={styles.modalItem}
                                onPress={() => {
                                    setBimestreSelecionado(bimestre);
                                    setModalBimestreVisible(false);
                                }}
                            >
                                <Text style={[styles.modalText, { color: textColor }]}>
                                    {bimestre}º Bimestre
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* Modal de Edição */}
            <Modal visible={modalEditVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Editar Perfil</Text>
                        <View style={styles.modalInputContainer}>
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.nome}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nome: text })}
                                placeholder="Nome Completo"
                                placeholderTextColor={textColor}
                            />
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.email}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, email: text })}
                                placeholder="Email"
                                placeholderTextColor={textColor}
                            />
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.telefone}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, telefone: text })}
                                placeholder="Telefone"
                                placeholderTextColor={textColor}
                            />
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.nascimento}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nascimento: text })}
                                placeholder="Data de Nascimento"
                                placeholderTextColor={textColor}
                            />
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.senha}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, senha: text })}
                                placeholder="Senha"
                                placeholderTextColor={textColor}
                                secureTextEntry
                            />
                            <TextInput
                                style={[styles.input, { color: textColor, borderColor: textColor }]}
                                value={perfilEdit.turma}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, turma: text })}
                                placeholder="Turma"
                                placeholderTextColor={textColor}
                            />
                        </View>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
                                <Text style={styles.buttonText}>Salvar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalEditVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal de Exclusão */}
            <Modal visible={modalDeleteVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Tem certeza que deseja excluir o perfil?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalDeleteVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60,
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
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    barraAzul: {
        width: '100%',
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    form: {
        padding: 25,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    iconeBotao: {
        padding: 10,
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalInputContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        backgroundColor: '#F2F2F2',
        padding: 12,
        width: '80%',
        marginBottom: 15,
        borderRadius: 10,
        borderWidth: 1,
    },
    saveButton: {
        backgroundColor: '#1E6BE6',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        marginRight: '5%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#999',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        marginRight: '5%',
        alignItems: 'center',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inlineFieldsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    tabelaContainer: {
        marginTop: 20,
        padding: 25,
        paddingBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    tabelaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 10,
        paddingVertical: 10,
    },
    tabelaHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        width: '30%',
        textAlign: 'center',
    },
    tabelaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabelaText: {
        fontSize: 16,
        width: '30%',
        textAlign: 'center',
    },
    chart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});