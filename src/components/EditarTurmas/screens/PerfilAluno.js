import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Dimensions,
    Alert,
    Platform
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Campo from '../../Perfil/Campo';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../path/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GraficoFeedback from '../../Gerais/GraficoFeedback'; // Import the graph component

export default function PerfilAluno() {
    const route = useRoute();
    const { alunoId } = route.params;
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasProfileImage, setHasProfileImage] = useState(false);
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        matricula: '',
        telefone: '',
        nascimento: '',
        turma: '',
        senha: '********',
        foto: null,
    });
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [ocorrencias, setOcorrencias] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false);
    const [modalProfessorVisible, setModalProfessorVisible] = useState(false);
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [semFeedbacks, setSemFeedbacks] = useState(false);
    const [professores, setProfessores] = useState([]);

    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';

    // Função para obter o token de autenticação
    const getAuthToken = async () => {
        const token = await AsyncStorage.getItem('@user_token');
        if (!token) {
            throw new Error('Token de autenticação não encontrado');
        }
        return token;
    };

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para esta funcionalidade');
            }
            if (libraryStatus !== 'granted') {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para esta funcionalidade');
            }
        }
    };

    useEffect(() => {
        requestPermissions();
        if (alunoId) {
            fetchAluno();
            fetchFeedbacks();
        } else {
            setError('ID do aluno não fornecido.');
            setLoading(false);
        }
    }, [alunoId]);

    useEffect(() => {
        if (alunoId) {
            fetchFeedbacks();
        }
    }, [alunoId, bimestreSelecionado, professorSelecionado]);

    const fetchFeedbacks = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.0.2.2:3000/api/student/feedback/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacks(response.data);

            const professoresUnicos = [];
            const professoresMap = new Map();

            response.data.forEach(feedback => {
                if (feedback.createdByDTO && !professoresMap.has(feedback.createdByDTO.id)) {
                    professoresMap.set(feedback.createdByDTO.id, true);
                    professoresUnicos.push(feedback.createdByDTO);
                }
            });

            setProfessores(professoresUnicos);
            atualizarDadosGrafico(response.data);
        } catch (error) {
            console.error('Erro ao carregar os feedbacks:', error);
            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            }
        }
    };

    const atualizarDadosGrafico = (feedbacksData) => {
        let feedbacksFiltrados = feedbacksData.filter(feedback => feedback.bimestre === bimestreSelecionado);

        if (professorSelecionado) {
            feedbacksFiltrados = feedbacksFiltrados.filter(
                feedback => feedback.createdByDTO.id === professorSelecionado.id
            );

            if (feedbacksFiltrados.length > 0) {
                const feedback = feedbacksFiltrados[0];
                setDadosGrafico([
                    feedback.resposta1,
                    feedback.resposta2,
                    feedback.resposta3,
                    feedback.resposta4,
                    feedback.resposta5
                ]);
                setSemFeedbacks(false);
                return;
            }
        }

        if (feedbacksFiltrados.length === 0) {
            setSemFeedbacks(true);
            setDadosGrafico([0, 0, 0, 0, 0]);
            return;
        }

        setSemFeedbacks(false);

        const somaRespostas = feedbacksFiltrados.reduce((acc, feedback) => {
            return {
                resposta1: acc.resposta1 + feedback.resposta1,
                resposta2: acc.resposta2 + feedback.resposta2,
                resposta3: acc.resposta3 + feedback.resposta3,
                resposta4: acc.resposta4 + feedback.resposta4,
                resposta5: acc.resposta5 + feedback.resposta5,
            };
        }, { resposta1: 0, resposta2: 0, resposta3: 0, resposta4: 0, resposta5: 0 });

        const novasMedias = [
            somaRespostas.resposta1 / feedbacksFiltrados.length,
            somaRespostas.resposta2 / feedbacksFiltrados.length,
            somaRespostas.resposta3 / feedbacksFiltrados.length,
            somaRespostas.resposta4 / feedbacksFiltrados.length,
            somaRespostas.resposta5 / feedbacksFiltrados.length,
        ];

        setDadosGrafico(novasMedias);
    };

    const handleBarraClick = (label, value) => {
        if (value === 0) return;
        setBarraSelecionada({ label, value });
        setModalBarraVisible(true);
    };

    const handleSelecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
        setModalProfessorVisible(false);
    };

    const handleLimparFiltroProfessor = () => {
        setProfessorSelecionado(null);
    };

    const checkProfileImage = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.0.2.2:3000/api/student/image/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.data && response.data.imageUrl) {
                setPerfil(prev => ({ ...prev, foto: response.data.imageUrl }));
                setHasProfileImage(true);
                setImageError(false);
            } else {
                setHasProfileImage(false);
                setImageError(true);
            }
        } catch (error) {
            console.error('Erro ao verificar imagem:', error);
            setHasProfileImage(false);
            setImageError(true);

            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            }
        }
    };

    const pickImage = async () => {
        try {
            setError(null);
            setImageError(false);

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                if (selectedAsset.base64) {
                    const imageData = `data:image/jpeg;base64,${selectedAsset.base64}`;
                    setPerfil(prev => ({ ...prev, foto: imageData }));
                    await uploadImage(selectedAsset.base64);
                } else if (selectedAsset.uri) {
                    await processImage(selectedAsset.uri);
                }
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            setImageError(true);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const takePhoto = async () => {
        try {
            setError(null);

            let result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                if (selectedAsset.base64) {
                    const imageData = `data:image/jpeg;base64,${selectedAsset.base64}`;
                    setPerfil(prev => ({ ...prev, foto: imageData }));
                    await uploadImage(selectedAsset.base64);
                } else if (selectedAsset.uri) {
                    await processImage(selectedAsset.uri);
                }
            }
        } catch (error) {
            console.error('Erro ao tirar foto:', error);
            setError('Erro ao tirar foto: ' + error.message);
        }
    };

    const processImage = async (uri) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('Arquivo de imagem não encontrado');
            }

            const base64Image = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const imageData = `data:image/jpeg;base64,${base64Image}`;
            setPerfil(prev => ({ ...prev, foto: imageData }));
            await uploadImage(base64Image);
        } catch (error) {
            console.error('Erro ao processar imagem:', error);
            setError('Erro ao processar imagem: ' + error.message);
        }
    };

    const uploadImage = async (base64Image) => {
        try {
            const token = await getAuthToken();

            const response = await axios.post(
                `http://10.0.2.2:3000/api/student/upload-image/${alunoId}`,
                { image: base64Image },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setHasProfileImage(true);
            setImageError(false);
            fetchAluno();
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            setImageError(true);
            Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente mais tarde.');
        }
    };

    const fetchAluno = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.0.2.2:3000/api/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.data) {
                const alunoData = response.data;
                setPerfil({
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: alunoData.dataNascimentoAluno.split(' ')[0],
                    turma: alunoData.turma.nomeTurma,
                    senha: '********',
                    foto: alunoData.imageUrl || null,
                });
                setPerfilEdit({
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: alunoData.dataNascimentoAluno.split(' ')[0],
                    turma: alunoData.turma.nomeTurma,
                    senha: '********',
                    foto: alunoData.imageUrl || null,
                });

                setHasProfileImage(!!alunoData.imageUrl);
                setImageError(!alunoData.imageUrl);
            } else {
                setError('Aluno não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do aluno:', error);
            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            } else {
                setError('Erro ao carregar dados do aluno.');
            }
        } finally {
            setLoading(false);
        }
    };

    const atualizarAluno = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();

            const response = await axios.put(
                `http://10.0.2.2:3000/api/student/${alunoId}`,
                {
                    nome: perfilEdit.nome,
                    emailAluno: perfilEdit.email,
                    matriculaAluno: perfilEdit.matricula,
                    telefoneAluno: perfilEdit.telefone,
                    dataNascimentoAluno: perfilEdit.nascimento,
                    turma: perfilEdit.turma,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso!');
                fetchAluno();
            }
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            let errorMessage = 'Erro ao atualizar os dados do aluno';

            if (error.response) {
                if (error.response.status === 401) {
                    errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSave = async () => {
        try {
            await atualizarAluno();
            setPerfil(perfilEdit);
            setIsEditing(false);
        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
        }
    };

    const handleDelete = () => {
        console.log('Perfil excluído');
        setModalDeleteVisible(false);
    };

    const toggleEdit = () => {
        if (isEditing) {
            setPerfilEdit(perfil);
        }
        setIsEditing(!isEditing);
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
                        <TouchableOpacity onPress={() => {
                            Alert.alert(
                                "Alterar Foto",
                                "Escolha uma opção",
                                [
                                    {
                                        text: "Galeria",
                                        onPress: pickImage,
                                    },
                                    {
                                        text: "Câmera",
                                        onPress: takePhoto,
                                    },
                                    {
                                        text: "Cancelar",
                                        style: "cancel",
                                    },
                                ]
                            );
                        }}>
                            <Image
                                source={perfil.foto && !imageError ?
                                    { uri: perfil.foto } :
                                    require('../../../assets/image/Perfill.png')}
                                style={styles.profileImage}
                                onError={() => setImageError(true)}
                            />
                        </TouchableOpacity>
                        <View style={styles.name}>
                            <Text style={[styles.nome, { color: textColor }]}>{perfil.nome}</Text>
                            <Text style={[styles.email, { color: textColor }]}>{perfil.email}</Text>
                        </View>
                    </View>
                    <Campo
                        label="Nome Completo"
                        text={perfil.nome}
                        textColor={textColor}
                        editable={isEditing}
                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nome: text })}
                        placeholder="Digite o nome completo"
                    />

                    <Campo
                        label="Email"
                        text={perfil.email}
                        textColor={textColor}
                        editable={isEditing}
                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, email: text })}
                        placeholder="Digite o email"
                    />

                    <Campo
                        label="Nº Matrícula"
                        text={perfil.matricula}
                        textColor={textColor}
                        editable={isEditing}
                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, matricula: text })}
                        placeholder="Digite a matrícula"
                    />

                    <View style={styles.inlineFieldsContainer}>
                        <Campo
                            label="Telefone"
                            text={perfil.telefone}
                            textColor={textColor}
                            isInline={true}
                            editable={isEditing}
                            onChangeText={(text) => setPerfilEdit({ ...perfilEdit, telefone: text })}
                            placeholder="Digite o telefone"
                        />
                        <Campo
                            label="Data de Nascimento"
                            text={perfil.nascimento}
                            textColor={textColor}
                            isInline={true}
                            editable={isEditing}
                            onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nascimento: text })}
                            placeholder="DD/MM/AAAA"
                        />
                    </View>

                    <View style={styles.inlineFieldsContainer}>
                        <Campo
                            label="Turma"
                            text={perfil.turma}
                            textColor={textColor}
                            isInline={true}
                            editable={isEditing}
                            onChangeText={(text) => setPerfilEdit({ ...perfilEdit, turma: text })}
                            placeholder="Digite a turma"
                        />
                    </View>

                    {isEditing ? (
                        <View style={styles.editButtonsContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleEditSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={toggleEdit}
                                disabled={loading}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={toggleEdit} style={styles.iconeBotao}>
                                <Icon name="edit" size={20} color={isDarkMode ? 'white' : 'black'} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalDeleteVisible(true)} style={styles.iconeBotao}>
                                <Icon name="trash" size={20} color={isDarkMode ? 'red' : 'darkred'} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Feedback Graph Section */}
                <View style={[styles.grafico, { 
                    backgroundColor: formBackgroundColor, 
                    marginTop: 20,
                    borderRadius: 10,
                    padding: 15,
                    shadowColor: isDarkMode ? '#FFF' : '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                }]}>
                    <GraficoFeedback
                        dadosGrafico={dadosGrafico}
                        bimestreSelecionado={bimestreSelecionado}
                        professorSelecionado={professorSelecionado}
                        semFeedbacks={semFeedbacks}
                        professores={professores}
                        onSelecionarBimestre={() => setModalBimestreVisible(true)}
                        onSelecionarProfessor={() => setModalProfessorVisible(true)}
                        onLimparFiltroProfessor={handleLimparFiltroProfessor}
                        onBarraClick={handleBarraClick}
                    />
                </View>

                <View style={[styles.tabelaContainer, { backgroundColor: formBackgroundColor, marginBottom: 50 }]}>
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

            {/* Modal de Seleção de Professor */}
            <Modal visible={modalProfessorVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Selecione o Professor</Text>
                        <TouchableOpacity
                            style={styles.modalItem}
                            onPress={() => {
                                handleSelecionarProfessor(null);
                            }}
                        >
                            <Text style={[styles.modalText, { color: textColor }]}>
                                Todos Professores
                            </Text>
                        </TouchableOpacity>
                        {professores.map((professor) => (
                            <TouchableOpacity
                                key={professor.id}
                                style={styles.modalItem}
                                onPress={() => {
                                    handleSelecionarProfessor(professor);
                                }}
                            >
                                <Text style={[styles.modalText, { color: textColor }]}>
                                    {professor.nomeDocente}
                                </Text>
                            </TouchableOpacity>
                        ))}
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

            {/* Modal para Detalhes da Barra */}
            <Modal visible={modalBarraVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: '#1E6BE6' }]}>
                        <Text style={[styles.modalTitle, { color: 'white' }]}>Valor</Text>
                        <Text style={[styles.modalText, { color: 'white', fontSize: 24 }]}>
                            {barraSelecionada.value.toFixed(1)}
                        </Text>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: 'white', marginTop: 20 }]}
                            onPress={() => setModalBarraVisible(false)}
                        >
                            <Text style={[styles.buttonText, { color: '#1E6BE6' }]}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal de Erro */}
            <Modal visible={!!error} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: 'red' }]}>Erro</Text>
                        <Text style={[styles.modalText, { color: textColor }]}>{error}</Text>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setError(null)}>
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    campo: {
        marginTop: 15,
    },
    inline: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        padding: 10,
        width: 150,
        justifyContent: 'space-between',
    },
    colorInput: {
        fontSize: 17,
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60
    },
    barraAzul: {
        width: '100%',
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    form: {
        padding: 25,
        borderRadius: 10,
    },
    linhaUser: {
        flexDirection: 'row',
        gap: 10,
    },
    name: {
        marginTop: 15,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 15,
    },
    inlineFieldsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#1E6BE6',
        padding: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#888',
        padding: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 20,
        gap: 15,
    },
    iconeBotao: {
        padding: 10,
    },
    tabelaContainer: {
        marginTop: 20,
        borderRadius: 10,
        padding: 15,
    },
    tabelaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    tabelaHeaderText: {
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    tabelaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tabelaText: {
        flex: 1,
        textAlign: 'center',
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        width: '80%',
        padding: 20,
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
    modalItem: {
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center'
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    grafico: {
        marginTop: 20,
    },
});