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

export default function PerfilProfessor() {
    const route = useRoute();
    const { professorId } = route.params;
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasProfileImage, setHasProfileImage] = useState(false);
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        codigoIdentificador: '',
        telefone: '',
        nascimento: '',
        disciplinas: [],
        turmas: [],
        feedbacks: [],
    });
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';

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
        if (professorId) {
            fetchProfessor();
        } else {
            setError('ID do professor não fornecido.');
            setLoading(false);
        }
    }, [professorId]);

    const fetchProfessor = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.0.2.2:3000/api/teacher/${professorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                const professorData = response.data;
                setPerfil({
                    nome: professorData.nomeDocente,
                    email: professorData.emailDocente,
                    codigoIdentificador: professorData.identifierCode,
                    telefone: professorData.telefoneDocente,
                    nascimento: professorData.dataNascimentoDocente.split(' ')[0],
                    disciplinas: professorData.disciplinas || [],
                    turmas: professorData.classes || [],
                    feedbacks: professorData.feedbacks || [],
                    foto: professorData.imageUrl || null,
                });
                setPerfilEdit({
                    nome: professorData.nomeDocente,
                    email: professorData.emailDocente,
                    codigoIdentificador: professorData.identifierCode,
                    telefone: professorData.telefoneDocente,
                    nascimento: professorData.dataNascimentoDocente.split(' ')[0],
                    disciplinas: professorData.disciplinas || [],
                    turmas: professorData.classes || [],
                    feedbacks: professorData.feedbacks || [],
                    foto: professorData.imageUrl || null,
                });

                setHasProfileImage(!!professorData.imageUrl);
                setImageError(!professorData.imageUrl);
            } else {
                setError('Professor não encontrado.');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do professor:', error);
            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            } else {
                setError('Erro ao carregar dados do professor.');
            }
        } finally {
            setLoading(false);
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
                `http://10.0.2.2:3000/api/teacher/upload-image/${professorId}`,
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
            fetchProfessor();
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            setImageError(true);
            Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente mais tarde.');
        }
    };

    const atualizarProfessor = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();

            const response = await axios.put(
                `http://10.0.2.2:3000/api/teacher/${professorId}`,
                {
                    nomeDocente: perfilEdit.nome,
                    emailDocente: perfilEdit.email,
                    telefoneDocente: perfilEdit.telefone,
                    dataNascimentoDocente: perfilEdit.nascimento,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Dados do professor atualizados com sucesso!');
                fetchProfessor();
            }
        } catch (error) {
            console.error('Erro ao atualizar professor:', error);
            let errorMessage = 'Erro ao atualizar os dados do professor';

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
            await atualizarProfessor();
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
            <HeaderSimples titulo="PERFIL DO PROFESSOR" />
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
                        label="Código Identificador"
                        text={perfil.codigoIdentificador}
                        textColor={textColor}
                        editable={false} // Não editável
                        placeholder="Código do professor"
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

                    {/* Seção de Disciplinas */}
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Disciplinas</Text>
                        {perfil.disciplinas.length > 0 ? (
                            <View style={styles.itemsContainer}>
                                {perfil.disciplinas.map((disciplina, index) => (
                                    <View key={index} style={[styles.itemPill, { backgroundColor: isDarkMode ? '#333' : '#E1F0FF' }]}>
                                        <Text style={[styles.itemText, { color: textColor }]}>{disciplina.nomeDisciplina}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma disciplina associada</Text>
                        )}
                    </View>

                    {/* Seção de Turmas */}
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Turmas</Text>
                        {perfil.turmas.length > 0 ? (
                            <View style={styles.itemsContainer}>
                                {perfil.turmas.map((turma, index) => (
                                    <View key={index} style={[styles.itemPill, { backgroundColor: isDarkMode ? '#333' : '#E1F0FF' }]}>
                                        <Text style={[styles.itemText, { color: textColor }]}>{turma.nomeTurma || `Turma ${turma.id}`}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma turma associada</Text>
                        )}
                    </View>

                    {/* Seção de Feedbacks */}
                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Feedbacks Recebidos</Text>
                        {perfil.feedbacks.length > 0 ? (
                            <FlatList
                                data={perfil.feedbacks}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={[styles.feedbackContainer, { backgroundColor: isDarkMode ? '#222' : '#F0F7FF' }]}>
                                        <Text style={[styles.feedbackText, { color: textColor }]}>{item.conteudo}</Text>
                                        <Text style={[styles.feedbackAuthor, { color: isDarkMode ? '#AAA' : '#666' }]}>
                                            - {item.createdBy.nomeAluno}
                                        </Text>
                                    </View>
                                )}
                            />
                        ) : (
                            <Text style={[styles.noItemsText, { color: textColor }]}>Nenhum feedback recebido</Text>
                        )}
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
            </View>

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
    sectionContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    itemPill: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    itemText: {
        fontSize: 14,
    },
    noItemsText: {
        fontStyle: 'italic',
        color: '#666',
    },
    feedbackContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    feedbackText: {
        fontSize: 14,
    },
    feedbackAuthor: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
});