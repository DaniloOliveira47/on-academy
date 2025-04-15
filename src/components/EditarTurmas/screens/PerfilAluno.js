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
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Campo from '../../Perfil/Campo';
import HeaderSimples from '../../Gerais/HeaderSimples';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useTheme } from '../../../path/ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const formatarData = (dataString) => {
    if (!dataString) return '';

    try {
        const data = new Date(dataString);

        if (isNaN(data.getTime())) {
            return '';
        }

        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const ano = data.getFullYear();

        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        return '';
    }
};

export default function PerfilAluno() {
    const route = useRoute();
    const navigation = useNavigation();
    const { alunoId } = route.params;
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [hasProfileImage, setHasProfileImage] = useState(false);
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        matricula: '',
        telefone: '',
        nascimento: '',
        turma: null,
    });
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);

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

    const fetchAluno = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`http://10.92.198.51:3000/api/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                const alunoData = response.data;
                const formattedDate = alunoData.dataNascimentoAluno
                    ? formatarData(alunoData.dataNascimentoAluno)
                    : '';

                const updatedPerfil = {
                    nome: alunoData.nome,
                    email: alunoData.emailAluno,
                    matricula: alunoData.matriculaAluno,
                    telefone: alunoData.telefoneAluno,
                    nascimento: formattedDate,
                    turma: alunoData.turma || null,
                    foto: alunoData.imageUrl || null,
                };

                setPerfil(updatedPerfil);
                setPerfilEdit(updatedPerfil);

                if (alunoData.dataNascimentoAluno) {
                    const birthDate = new Date(alunoData.dataNascimentoAluno);
                    setSelectedDate(birthDate);
                }

                setHasProfileImage(!!alunoData.imageUrl);
                setImageError(!alunoData.imageUrl);
            } else {
                setError('Aluno não encontrado.');
            }
        } catch (error) {
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
            const response = await axios.get(`http://10.92.198.51:3000/api/feedbackteacher/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacks(response.data || []);
        } catch (error) {
           
            setFeedbacks([]);
        }
    };

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            setPerfilEdit({ ...perfilEdit, nascimento: formattedDate });
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
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
            setError('Erro ao processar imagem: ' + error.message);
        }
    };

    const uploadImage = async (base64Image) => {
        try {
            const token = await getAuthToken();

            const response = await axios.post(
                `http://10.92.198.51:3000/api/student/upload-image/${alunoId}`,
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
            setImageError(true);
            Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente mais tarde.');
        }
    };

    const toggleEdit = () => {
        if (!isEditing) {
            setPerfilEdit(perfil);
        }
        setIsEditing(!isEditing);
    };

    const handleEditSave = async () => {
        try {
            setUpdating(true);
            const token = await getAuthToken();

            if (!perfilEdit.nome || !perfilEdit.email) {
                Alert.alert('Erro', 'Nome e email são campos obrigatórios');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(perfilEdit.email)) {
                Alert.alert('Erro', 'Por favor, insira um email válido');
                return;
            }

            const [dia, mes, ano] = perfilEdit.nascimento.split('/');
            const formattedDate = `${ano}-${mes}-${dia}`;

            const dadosParaEnviar = {
                nome: perfilEdit.nome,
                dataNascimentoAluno: formattedDate,
                emailAluno: perfilEdit.email,
                telefoneAluno: perfilEdit.telefone,
                matriculaAluno: perfilEdit.matricula,
            };

            const response = await axios.put(
                `http://10.92.198.51:3000/api/student/${alunoId}`,
                dadosParaEnviar,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Dados do aluno atualizados com sucesso!');
                await fetchAluno();
                setIsEditing(false);
            }
        } catch (error) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao atualizar os dados do aluno'
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            
            const response = await axios.delete(`http://10.92.198.51:3000/api/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Aluno excluído com sucesso!');
                navigation.goBack();
            }
        } catch (error) {
            Alert.alert(
                'Erro', 
                error.response?.data?.message || 'Não foi possível excluir o aluno'
            );
        } finally {
            setLoading(false);
            setModalDeleteVisible(false);
        }
    };

    const FeedbackSection = ({ feedbacks }) => {
        const openFeedbackModal = (item) => {
            setSelectedFeedback(item);
            setFeedbackModalVisible(true);
        };

        return (
            <>
                <View style={[styles.feedbackOuterContainer, { backgroundColor: formBackgroundColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Feedbacks Enviados ({feedbacks.length})
                    </Text>

                    {feedbacks.length > 0 ? (
                        <View style={styles.feedbackContainer}>
                            <View style={[styles.feedbackHeader, { backgroundColor: isDarkMode ? '#333' : '#E1F0FF' }]}>
                                <View style={styles.feedbackHeaderCell}>
                                    <Text style={[styles.feedbackHeaderText, { color: textColor }]}>Professor</Text>
                                </View>
                                <View style={styles.feedbackHeaderCell}>
                                    <Text style={[styles.feedbackHeaderText, { color: textColor }]}>Feedback</Text>
                                </View>
                            </View>

                            <ScrollView style={styles.feedbackBody}>
                                {feedbacks.map((item, index) => (
                                    <FeedbackItem 
                                        key={index} 
                                        item={item} 
                                        onPress={openFeedbackModal} 
                                        textColor={textColor}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={styles.noFeedbackContainer}>
                            <MaterialIcons 
                                name="feedback" 
                                size={40} 
                                color={isDarkMode ? '#666' : '#999'} 
                            />
                            <Text style={[styles.noFeedbackText, { color: isDarkMode ? '#AAA' : '#888' }]}>
                                Nenhum feedback enviado ainda
                            </Text>
                        </View>
                    )}
                    
                </View>

                <Modal visible={feedbackModalVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.feedbackModalContainer, { backgroundColor: formBackgroundColor }]}>
                            <Text style={[styles.feedbackModalTitle, { color: textColor }]}>
                                Feedback de {selectedFeedback?.teacher?.nomeDocente || 'Professor'}
                            </Text>
                            <Text style={[styles.feedbackModalText, { color: textColor }]}>
                                {selectedFeedback?.conteudo || 'Nenhum conteúdo disponível'}
                            </Text>
                            <TouchableOpacity 
                                style={[styles.closeFeedbackButton, { backgroundColor: barraAzulColor }]} 
                                onPress={() => setFeedbackModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </>
        );
    };

    const FeedbackItem = ({ item, onPress, textColor }) => {
        return (
            <View style={styles.feedbackRow}>
                <View style={styles.feedbackCell}>
                    <Text style={[styles.feedbackText, { color: textColor }]}>
                        {item.teacher?.nomeDocente || 'Professor não informado'}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.feedbackCellIcon} 
                    onPress={() => onPress(item)}
                >
                    <MaterialIcons name="feedback" size={24} color={barraAzulColor} />
                </TouchableOpacity>
            </View>
        );
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
            <HeaderSimples titulo={isEditing ? "EDITANDO PERFIL" : "PERFIL DO ALUNO"} />

            {isEditing && (
                <View style={[styles.editingIndicator, { backgroundColor: barraAzulColor }]}>
                    <Text style={styles.editingIndicatorText}>Modo Edição</Text>
                </View>
            )}

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
                                    require('../../../assets/image/add.png')}
                                style={styles.profileImage}
                                onError={() => setImageError(true)}
                            />
                        </TouchableOpacity>
                        <View style={styles.name}>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        style={[styles.editNome, { color: textColor }]}
                                        value={perfilEdit.nome}
                                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nome: text })}
                                        placeholder="Nome do aluno"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                    />
                                    <TextInput
                                        style={[styles.editEmail, { color: textColor }]}
                                        value={perfilEdit.email}
                                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, email: text })}
                                        placeholder="Email do aluno"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                        keyboardType="email-address"
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={[styles.nome, { color: textColor }]}>{perfil.nome}</Text>
                                    <Text style={[styles.email, { color: textColor }]}>{perfil.email}</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <Campo
                        label="Matrícula Aluno"
                        text={perfil.matricula}
                        textColor={textColor}
                        editable={false}
                        placeholder="Matrícula do aluno"
                        fixedWidth={width * 0.8}
                    />

<View style={styles.inlineFieldsContainer}>
    {/* Telefone */}
    <View style={[styles.inline, { width: width * 0.45 }]}>
        <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Telefone</Text>
        {isEditing ? (
            <TextInput
                style={[
                    styles.inputContainer,
                    { color: isDarkMode ? '#FFF' : '#000', backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }
                ]}
                value={perfilEdit.telefone}
                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, telefone: text })}
                placeholder="Digite o telefone"
                placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                keyboardType="phone-pad"
            />
        ) : (
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
                <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    {perfil.telefone || 'Não informado'}
                </Text>
            </View>
        )}
    </View>

    {/* Data de Nascimento */}
    <View style={[styles.inline, { width: width * 0.45 }]}>
        <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Data de Nascimento</Text>
        {isEditing ? (
            <>
                <TouchableOpacity
                    style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF', justifyContent: 'center' }]}
                    onPress={showDatepicker}
                >
                    <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000' }]}>
                        {perfilEdit.nascimento || "Selecione a data"}
                    </Text>
                    <Icon name="calendar" size={16} color={isDarkMode ? '#FFF' : '#666'} style={styles.calendarIcon} />
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </>
        ) : (
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF', justifyContent: 'center' }]}>
                <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000' }]}>
                    {perfil.nascimento || 'Não informada'}
                </Text>
            </View>
        )}
    </View>
</View>


                    <View style={styles.sectionContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>Turma</Text>
                        {perfil.turma ? (
                            <View style={styles.itemsContainer}>
                                <View style={[styles.itemPill, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF'}]}>
                                    <Text style={[styles.itemText, { color: textColor }]}>{perfil.turma.nomeTurma}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma turma associada</Text>
                        )}
                    </View>

                    {isEditing ? (
                        <View style={styles.editButtonsContainer}>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleEditSave}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.buttonText}>Salvar</Text>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={toggleEdit}
                                disabled={updating}
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

                <FeedbackSection feedbacks={feedbacks} />
            </View>

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
        width: '100%',
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
        flex: 1,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    editNome: {
        fontSize: 18,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#1E6BE6',
        paddingBottom: 5,
        marginBottom: 5,
    },
    email: {
        fontSize: 15,
    },
    editEmail: {
        fontSize: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1E6BE6',
        paddingBottom: 5,
    },
    inlineFieldsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
        marginBottom: 8,
    },
    itemText: {
        fontSize: 14,
    },
    noItemsText: {
        fontStyle: 'italic',
        color: '#666',
    },
    feedbackOuterContainer: {
        marginTop: 20,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 40
    },
    feedbackContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        overflow: 'hidden',
    },
    feedbackHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    feedbackHeaderCell: {
        flex: 1,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    feedbackHeaderText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    feedbackBody: {
        maxHeight: 300,
    },
    feedbackRow: {
        flexDirection: 'row',
        minHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        alignItems: 'center',
        marginRight: 65,
        gap: 60
    },
    feedbackCell: {
        flex: 1,
        padding: 8,
        justifyContent: 'center',
    },
    feedbackCellIcon: {
        width: 40,
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 14,
        textAlign: 'center',
    },
    feedbackModalContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        width: '90%',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    feedbackModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    feedbackModalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    closeFeedbackButton: {
        backgroundColor: '#1E6BE6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    calendarIcon: {
        marginRight: 10,
    },
    editingIndicator: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editingIndicatorText: {
        color: 'white',
        fontWeight: 'bold',
    },
    noFeedbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    noFeedbackText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
    },
});