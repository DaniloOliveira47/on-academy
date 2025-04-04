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
import { useRoute } from '@react-navigation/native';
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

// Função para formatar a data no formato dd/mm/aaaa
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

export default function PerfilProfessor() {
    const route = useRoute();
    const { professorId } = route.params;
    const { isDarkMode } = useTheme();

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
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
    const [allTurmas, setAllTurmas] = useState([]);
    const [allDisciplinas, setAllDisciplinas] = useState([]);
    const [selectedTurmas, setSelectedTurmas] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

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
            const response = await axios.get(`http://192.168.2.11:3000/api/teacher/${professorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                const professorData = response.data;
                const formattedDate = professorData.dataNascimentoDocente
                    ? formatarData(professorData.dataNascimentoDocente)
                    : '';

                const updatedPerfil = {
                    nome: professorData.nomeDocente,
                    email: professorData.emailDocente,
                    codigoIdentificador: professorData.identifierCode,
                    telefone: professorData.telefoneDocente,
                    nascimento: formattedDate,
                    disciplinas: professorData.disciplinas || [],
                    turmas: professorData.classes || [],
                    feedbacks: professorData.feedbacks || [],
                    foto: professorData.imageUrl || null,
                };

                setPerfil(updatedPerfil);
                setPerfilEdit(updatedPerfil);

                if (professorData.dataNascimentoDocente) {
                    const birthDate = new Date(professorData.dataNascimentoDocente);
                    setSelectedDate(birthDate);
                }

                setHasProfileImage(!!professorData.imageUrl);
                setImageError(!professorData.imageUrl);
            } else {
                setError('Professor não encontrado.');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Sessão expirada. Por favor, faça login novamente.');
            } else {
                setError('Erro ao carregar dados do professor.');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTurmasAndDisciplinas = async () => {
        try {
            const token = await getAuthToken();

            const turmasResponse = await axios.get('http://192.168.2.11:3000/api/class', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllTurmas(turmasResponse.data || []);

            const disciplinasResponse = await axios.get('http://192.168.2.11:3000/api/discipline', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllDisciplinas(disciplinasResponse.data || []);

        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as turmas e disciplinas disponíveis');
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
                `http://192.168.2.11:3000/api/teacher/upload-image/${professorId}`,
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
            setImageError(true);
            Alert.alert('Erro', 'Não foi possível enviar a imagem. Tente novamente mais tarde.');
        }
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
            const formattedDate = `${ano}-${mes}-${dia}T00:00:00.000Z`;

            const dadosParaEnviar = {
                nomeDocente: perfilEdit.nome,
                dataNascimentoDocente: formattedDate,
                emailDocente: perfilEdit.email,
                telefoneDocente: perfilEdit.telefone,
                identifierCode: perfilEdit.codigoIdentificador,
                disciplineId: selectedDisciplinas.length > 0 ? selectedDisciplinas : null,
                classId: selectedTurmas.length > 0 ? selectedTurmas : null,
            };

            const response = await axios.put(
                `http://192.168.2.11:3000/api/teacher/${professorId}`,
                dadosParaEnviar,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Dados do professor atualizados com sucesso!');
                await fetchProfessor();
                setIsEditing(false);
            }
        } catch (error) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Erro ao atualizar os dados do professor'
            );
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();

            const response = await axios.delete(`http://192.168.2.11:3000/api/teacher/${professorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                Alert.alert('Sucesso', 'Professor excluído com sucesso!');
            }
        } catch (error) {
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível excluir o professor'
            );
        } finally {
            setLoading(false);
            setModalDeleteVisible(false);
        }
    };

    const toggleEdit = async () => {
        if (!isEditing) {
            await fetchAllTurmasAndDisciplinas();
            setSelectedTurmas(perfil.turmas.map(t => t.id));
            setSelectedDisciplinas(perfil.disciplinas.map(d => d.id));
        } else {
            setPerfilEdit(perfil);
        }
        setIsEditing(!isEditing);
    };

    const MultiSelectTurmas = () => (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Turmas</Text>
            <View style={styles.itemsContainer}>
                {allTurmas.map(turma => (
                    <TouchableOpacity
                        key={turma.id}
                        onPress={() => {
                            const newSelected = selectedTurmas.includes(turma.id)
                                ? selectedTurmas.filter(id => id !== turma.id)
                                : [...selectedTurmas, turma.id];
                            setSelectedTurmas(newSelected);
                        }}
                    >
                        <View style={[
                            styles.itemPill,
                            {
                                backgroundColor: selectedTurmas.includes(turma.id)
                                    ? barraAzulColor
                                    : isDarkMode ? '#141414' : '#F0F7FF'
                            }
                        ]}>
                            <Text style={[
                                styles.itemText,
                                {
                                    color: selectedTurmas.includes(turma.id)
                                        ? 'white'
                                        : textColor
                                }
                            ]}>
                                {turma.nomeTurma}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const MultiSelectDisciplinas = () => (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Disciplinas</Text>
            <View style={styles.itemsContainer}>
                {allDisciplinas.map(disciplina => (
                    <TouchableOpacity
                        key={disciplina.id}
                        onPress={() => {
                            const newSelected = selectedDisciplinas.includes(disciplina.id)
                                ? selectedDisciplinas.filter(id => id !== disciplina.id)
                                : [...selectedDisciplinas, disciplina.id];
                            setSelectedDisciplinas(newSelected);
                        }}
                    >
                        <View style={[
                            styles.itemPill,
                            {
                                backgroundColor: selectedDisciplinas.includes(disciplina.id)
                                    ? barraAzulColor
                                    : isDarkMode ? '#141414' : '#F0F7FF'
                            }
                        ]}>
                            <Text style={[
                                styles.itemText,
                                {
                                    color: selectedDisciplinas.includes(disciplina.id)
                                        ? 'white'
                                        : textColor
                                }
                            ]}>
                                {disciplina.nomeDisciplina}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const FeedbackSection = ({ feedbacks }) => {
        const [modalVisible, setModalVisible] = useState(false);
        const [selectedFeedback, setSelectedFeedback] = useState(null);

        const openFeedbackModal = (item) => {
            setSelectedFeedback(item);
            setModalVisible(true);
        };

        return (
            <>
                <View style={[styles.feedbackOuterContainer, { backgroundColor: formBackgroundColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Feedbacks Recebidos ({feedbacks.length})
                    </Text>

                    {feedbacks.length > 0 ? (
                        <View style={styles.feedbackContainer}>
                            <View style={[styles.feedbackHeader, { backgroundColor: isDarkMode ? '#333' : '#E1F0FF' }]}>
                                <View style={styles.feedbackHeaderCell}>
                                    <Text style={[styles.feedbackHeaderText, { color: textColor }]}>Criado por</Text>
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
                        <View style={[styles.noFeedbackContainer,]}>
                            <MaterialIcons
                                name="feedback"
                                size={40}
                                color={isDarkMode ? '#666' : '#999'}
                            />
                            <Text style={[styles.noFeedbackText, { color: isDarkMode ? '#AAA' : '#888' }]}>
                                Nenhum feedback recebido ainda
                            </Text>
                        </View>
                    )}
                </View>

                <Modal visible={modalVisible} transparent animationType="fade">
                    <View style={styles.modalBackdrop}>
                        <View style={[styles.feedbackModalContainer, { backgroundColor: formBackgroundColor }]}>
                            <Text style={[styles.feedbackModalTitle, { color: textColor }]}>
                                Feedback de {selectedFeedback?.createdBy.nomeAluno}
                            </Text>
                            <Text style={[styles.feedbackModalText, { color: textColor }]}>
                                {selectedFeedback?.conteudo}
                            </Text>
                            <TouchableOpacity
                                style={[styles.closeFeedbackButton, { backgroundColor: barraAzulColor }]}
                                onPress={() => setModalVisible(false)}
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
                        {item.createdBy.nomeAluno}
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
            <HeaderSimples titulo={isEditing ? "EDITANDO PERFIL" : "PERFIL DO PROFESSOR"} />

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
                                        placeholder="Nome do professor"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                    />
                                    <TextInput
                                        style={[styles.editEmail, { color: textColor }]}
                                        value={perfilEdit.email}
                                        onChangeText={(text) => setPerfilEdit({ ...perfilEdit, email: text })}
                                        placeholder="Email do professor"
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
                        label="Código Identificador"
                        text={perfil.codigoIdentificador}
                        textColor={textColor}
                        editable={false}
                        placeholder="Código do professor"
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
                                        {perfil.nascimento}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>


                    {isEditing ? (
                        <>
                            <MultiSelectDisciplinas />
                            <MultiSelectTurmas />
                        </>
                    ) : (
                        <>
                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Disciplinas</Text>
                                {perfil.disciplinas.length > 0 ? (
                                    <View style={styles.itemsContainer}>
                                        {perfil.disciplinas.map((disciplina, index) => (
                                            <View key={index} style={[styles.itemPill, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF'}]}>
                                                <Text style={[styles.itemText, { color: textColor }]}>{disciplina.nomeDisciplina}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma disciplina associada</Text>
                                )}
                            </View>

                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: textColor }]}>Turmas</Text>
                                {perfil.turmas.length > 0 ? (
                                    <View style={styles.itemsContainer}>
                                        {perfil.turmas.map((turma, index) => (
                                            <View key={index} style={[styles.itemPill, {backgroundColor: isDarkMode ? '#141414' : '#F0F7FF'}]}>
                                                <Text style={[styles.itemText, { color: textColor }]}>{turma.nomeTurma || `Turma ${turma.id}`}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma turma associada</Text>
                                )}
                            </View>
                        </>
                    )}

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

                <FeedbackSection feedbacks={perfil.feedbacks} />

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