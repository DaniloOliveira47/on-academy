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
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false);
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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
            // Remova esta linha
            // checkProfileImage();
        } else {
            setError('ID do aluno não fornecido.');
            setLoading(false);
        }
    }, [alunoId]);

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
            // Atualiza os dados do aluno para pegar a nova URL da imagem
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
                    foto: alunoData.imageUrl || null, // Usando imageUrl diretamente da resposta
                });
                setPerfilEdit({
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: alunoData.dataNascimentoAluno.split(' ')[0],
                    turma: alunoData.turma.nomeTurma,
                    senha: '********',
                    foto: alunoData.imageUrl || null, // Usando imageUrl diretamente da resposta
                });

                // Atualiza o estado da imagem
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

    const fetchFeedbacks = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.0.2.2:3000/api/student/feedback/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Erro ao buscar feedbacks:', error);
            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            }
        }
    };

    const calcularMedias = () => {
        if (feedbacksFiltrados.length === 0) {
            return [0, 0, 0, 0, 0];
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
                fetchAluno(); // Atualiza os dados locais
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

    const feedbacksFiltrados = feedbacks.filter(feedback => feedback.bimestre === bimestreSelecionado);
    const medias = calcularMedias();

    const labels = ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'];
    const barWidth = 30;
    const barMargin = 10;
    const maxBarHeight = 150;
    const maxValue = Math.max(...medias);

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

    const handleBarraClick = (label, value) => {
        setBarraSelecionada({ label, value });
        setModalBarraVisible(true);
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Se estava editando e cancelou, reseta os valores
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
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, width: '100%' }}>
                            <View
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F7FF', borderTopRightRadius: 10, borderTopLeftRadius: 10, padding: 8 }}
                            >
                                <Text style={{ color: textColor, marginRight: 10 }}>Bimestre: {bimestreSelecionado}º</Text>
                                <TouchableOpacity onPress={() => setModalBimestreVisible(true)}><Icon name="chevron-down" size={20} color={textColor} /></TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.chartContainer, { backgroundColor: perfilBackgroundColor, paddingBottom: 0, borderTopLeftRadius: 10, borderBottomRightRadius: 10, borderBottomLeftRadius: 10 }]}>
                            <View style={styles.chart}>
                                {medias.map((value, index) => {
                                    const barHeight = (value / maxValue) * maxBarHeight;
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleBarraClick(labels[index], value)}>
                                            <View style={styles.barContainer}>
                                                <View style={[styles.bar, { height: barHeight }]} />
                                                <Text style={[styles.barLabel, { color: textColor }]}>{labels[index]}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </View>
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
                    <View style={[styles.modalContainer, { backgroundColor: formBackgroundColor }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>{barraSelecionada.label}</Text>
                        <Text style={[styles.modalText, { color: textColor }]}>
                            Valor: {barraSelecionada.value.toFixed(2)}
                        </Text>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalBarraVisible(false)}>
                            <Text style={styles.buttonText}>Fechar</Text>
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
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60,
    },
    editButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        width: '100%',
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
        borderRadius: 10,
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
    modalText: {
        fontSize: 20
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
        borderRadius: 12,
        width: '80%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        alignItems: 'center'
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
    linhaUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
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
        width: '100%',
        marginTop: 15,
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
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    chart: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 'auto',
        padding: 10,
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    bar: {
        width: 30,
        backgroundColor: '#1E6BE6',
        borderRadius: 5,
    },
    barLabel: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#1E6BE6',
        resizeMode: 'cover',
    },
    name: {
        flex: 1,
    },
    modalItem: {
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});