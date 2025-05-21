import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator, Alert, Platform, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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
import CustomAlert from '../../Gerais/CustomAlert';
import DeleteAlert from '../../Gerais/DeleteAlert';
import FeedbackModal from '../../Gerais/FeedbackModal';
import HeaderSimplesBack from '../../Gerais/HeaderSimplesBack';

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


const validarDataNascimento = (date) => {
    const hoje = new Date();
    const idade = hoje.getFullYear() - date.getFullYear();
    const mes = hoje.getMonth() - date.getMonth();

    if (mes < 0 || (mes === 0 && hoje.getDate() < date.getDate())) {
        return idade - 1;
    }
    return idade;
};

const validarTelefone = (telefone) => {

    const numeros = telefone.replace(/\D/g, '');

    return numeros.length === 10 || numeros.length === 11;
};

const formatarTelefone = (input) => {
    if (!input) return '';


    const numeros = input.replace(/\D/g, '');


    const limite = numeros.substring(0, 11);


    if (limite.length > 10) {
        return limite.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (limite.length > 6) {
        return limite.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (limite.length > 2) {
        return limite.replace(/(\d{2})(\d{0,4})/, '($1) $2');
    }
    if (limite.length > 0) {
        return `(${limite}`;
    }
    return '';
};
const formatarTelefoneExibicao = (telefone) => {
    if (!telefone) return 'Não informado';


    const numeros = telefone.replace(/\D/g, '');


    if (numeros.length > 10) {
        return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (numeros.length > 6) {
        return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (numeros.length > 0) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
    }
    return 'Não informado';
};

const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export default function PerfilProfessor() {
    const route = useRoute();
    const { professorId } = route.params;
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [perfil, setPerfil] = useState({
        nome: '',
        email: '',
        codigoIdentificador: '',
        telefone: '',
        nascimento: '',
        disciplinas: [],
        turmas: [],
        feedbacks: [],
        foto: null,
    });

    const [shouldGoBack, setShouldGoBack] = useState(false);

    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [allTurmas, setAllTurmas] = useState([]);
    const [allDisciplinas, setAllDisciplinas] = useState([]);
    const [selectedTurmas, setSelectedTurmas] = useState([]);
    const [selectedDisciplinas, setSelectedDisciplinas] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [validationErrors, setValidationErrors] = useState({
        nome: '',
        email: '',
        telefone: '',
        nascimento: ''
    });
    const [newImageBase64, setNewImageBase64] = useState(null);

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
                setAlertTitle('Permissão Necessária');
                setAlertMessage('Precisamos de acesso a sua camêra para continuar');
                setAlertVisible(true);
            }
            if (libraryStatus !== 'granted') {
                setAlertTitle('Permissão Necessária');
                setAlertMessage('Precisamos de acesso à galeria para esta funcionalidade');
                setAlertVisible(true);
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
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/${professorId}`, {
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
    useEffect(() => {
        if (!alertVisible && shouldGoBack) {
            navigation.goBack();
            setShouldGoBack(false); // Resetar para não disparar de novo
        }
    }, [alertVisible, shouldGoBack]);


    const fetchAllTurmasAndDisciplinas = async () => {
        try {
            const token = await getAuthToken();

            const turmasResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/class', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllTurmas(turmasResponse.data || []);

            const disciplinasResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAllDisciplinas(disciplinasResponse.data || []);

        } catch (error) {

        }
    };

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            const idade = validarDataNascimento(date);
            if (idade < 18 || idade > 90) {
                setValidationErrors(prev => ({
                    ...prev,
                    nascimento: 'O professor deve ter entre 18 e 90 anos'
                }));
                return;
            }

            setSelectedDate(date);
            const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            setPerfilEdit({ ...perfilEdit, nascimento: formattedDate });
            setValidationErrors(prev => ({
                ...prev,
                nascimento: ''
            }));
        }
    };

    const showDatepicker = () => {
        setShowDatePicker(true);
    };

    const handleNomeChange = (text) => {
        if (text.length > 100) {
            setValidationErrors(prev => ({
                ...prev,
                nome: 'O nome deve ter no máximo 100 caracteres'
            }));
            return;
        }
        setPerfilEdit({ ...perfilEdit, nome: text });
        setValidationErrors(prev => ({
            ...prev,
            nome: ''
        }));
    };

    const handleEmailChange = (text) => {
        setPerfilEdit({ ...perfilEdit, email: text });
        if (!validarEmail(text)) {
            setValidationErrors(prev => ({
                ...prev,
                email: 'Por favor, insira um email válido'
            }));
        } else {
            setValidationErrors(prev => ({
                ...prev,
                email: ''
            }));
        }
    };

    const handleTelefoneChange = (text) => {
        const formatted = formatarTelefone(text);
        setPerfilEdit({ ...perfilEdit, telefone: formatted });

        if (!validarTelefone(formatted) && formatted.length > 0) {
            setValidationErrors(prev => ({
                ...prev,
                telefone: 'Formato inválido. Use (DD) 9XXXX-XXXX'
            }));
        } else {
            setValidationErrors(prev => ({
                ...prev,
                telefone: ''
            }));
        }
    };

    const pickImage = async () => {
        try {
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
                    setPerfilEdit(prev => ({ ...prev, foto: imageData }));
                    setNewImageBase64(selectedAsset.base64);
                } else if (selectedAsset.uri) {
                    const base64Image = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const imageData = `data:image/jpeg;base64,${base64Image}`;
                    setPerfilEdit(prev => ({ ...prev, foto: imageData }));
                    setNewImageBase64(base64Image);
                }
            }
        } catch (error) {
            setAlertTitle('Desculpe');
            setAlertMessage('Não foi possível selecionar a imagem.');
            setAlertVisible(true);
        }
    };

    const takePhoto = async () => {
        try {
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
                    setPerfilEdit(prev => ({ ...prev, foto: imageData }));
                    setNewImageBase64(selectedAsset.base64);
                } else if (selectedAsset.uri) {
                    const base64Image = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    const imageData = `data:image/jpeg;base64,${base64Image}`;
                    setPerfilEdit(prev => ({ ...prev, foto: imageData }));
                    setNewImageBase64(base64Image);
                }
            }
        } catch (error) {
            setAlertTitle('Desculpe');
            setAlertMessage('Não foi possível tirar a foto');
            setAlertVisible(true);
        }
    };

    const handleEditSave = async () => {
        try {
            const hasErrors = Object.values(validationErrors).some(error => error !== '');
            if (hasErrors) {
                setAlertTitle('Atenção');
                setAlertMessage('Corrija os campos');
                setAlertVisible(true);
                return;
            }

            // Validações de nome
            if (!perfilEdit.nome) {
                setAlertTitle('Atenção');
                setAlertMessage('Nome é obrigatório');
                setAlertVisible(true);
                return;
            }

            if (!/^[A-Za-zÀ-ÿ\s]{3,}$/.test(perfilEdit.nome.trim())) {
                setAlertTitle('Atenção');
                setAlertMessage('O nome deve conter apenas letras e no mínimo 3 caracteres.');
                setAlertVisible(true);
                return;
            }

            // Validação de e-mail
            if (!perfilEdit.email) {
                setAlertTitle('Atenção');
                setAlertMessage('Email é obrigatório');
                setAlertVisible(true);
                return;
            }

            const emailRegex = /^[a-z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
            if (!emailRegex.test(perfilEdit.email.trim())) {
                setAlertTitle('Atenção');
                setAlertMessage('Insira um e-mail válido @gmail.com ou hotmail.com');
                setAlertVisible(true);
                return;
            }

            // Validação de telefone (se fornecido)
            if (!perfilEdit.telefone) {
                setAlertTitle('Atenção');
                setAlertMessage('Telefone é obrigatório');
                setAlertVisible(true);
                return;
            }

            if (!validarTelefone(perfilEdit.telefone)) {
                setAlertTitle('Atenção');
                setAlertMessage('Por favor, insira um telefone válido no formato (DD) 9XXXX-XXXX');
                setAlertVisible(true);
                return;
            }

            // Validação de idade
            const idade = validarDataNascimento(selectedDate);
            if (idade < 18 || idade > 90) {
                setAlertTitle('Atenção');
                setAlertMessage('O professor deve ter entre 18 e 90 anos');
                setAlertVisible(true);
                return;
            }

            // Validação da data de nascimento
            let formattedDate = '';
            if (perfilEdit.nascimento) {
                const [dia, mes, ano] = perfilEdit.nascimento.split('/');
                formattedDate = `${ano}-${mes}-${dia}`;

                const testDate = new Date(formattedDate);
                if (isNaN(testDate.getTime())) {
                    setAlertTitle('Atenção');
                    setAlertMessage('Data de nascimento inválida');
                    setAlertVisible(true);
                    return;
                }
            }

            setUpdating(true);
            const token = await getAuthToken();

            const telefoneNumerico = perfilEdit.telefone ? perfilEdit.telefone.replace(/\D/g, '') : null;

            const dadosParaEnviar = {
                nomeDocente: perfilEdit.nome,
                dataNascimentoDocente: formattedDate,
                emailDocente: perfilEdit.email,
                telefoneDocente: telefoneNumerico,
                identifierCode: perfilEdit.codigoIdentificador,
                disciplineId: selectedDisciplinas,
                classId: selectedTurmas,
                imageUrl: newImageBase64
            };

            console.log('Dados sendo enviados:', dadosParaEnviar); // Para debug

            const response = await axios.put(
                `https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/${professorId}`,
                dadosParaEnviar,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                setAlertTitle('Sucesso');
                setAlertMessage('Os dados do Professor foram atualizados com sucesso');
                setAlertVisible(true);
                await fetchProfessor();
                setIsEditing(false);
                setNewImageBase64(null);
            }
        } catch (error) {
            console.error('Erro ao atualizar professor:', error);
            let errorMessage = 'Erro ao atualizar os dados do professor';

            if (error.response) {
                console.error('Resposta do servidor:', error.response.data);
                errorMessage = error.response.data.message || errorMessage;

                if (error.response.data.errors) {
                    errorMessage += '\n' + Object.values(error.response.data.errors).join('\n');
                }
            }

            Alert.alert('Erro', errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();

            const response = await axios.delete(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/${professorId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status da resposta:', response.status);
            console.log('Dados da resposta:', response.data);

            if (response.status === 200 || response.status === 204) {
                try {
                    setAlertTitle('Sucesso');
                    setAlertMessage('O Professor foi excluído');
                    setAlertVisible(true);
                    setShouldGoBack(true); // Marca que o goBack deve ocorrer após o alerta
                } catch (internalError) {
                    console.error('Erro ao mostrar alerta:', internalError);
                }
            }
        } catch (error) {
            console.log('Erro completo:', error);
            console.log('Erro response:', error.response);
            Alert.alert(
                'Erro',
                error.response?.data?.message || error.message || 'Não foi possível excluir o professor'
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
            setPerfilEdit(perfil);
        } else {
            setNewImageBase64(null);
        }
        setIsEditing(!isEditing);
    };

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

                <FeedbackModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    studentName={selectedFeedback?.createdBy.nomeAluno}
                    feedbackContent={selectedFeedback?.conteudo}
                    formBackgroundColor={formBackgroundColor}
                    textColor={textColor}
                />
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
            <HeaderSimplesBack titulo={isEditing ? "EDITANDO PERFIL" : "PERFIL DO PROFESSOR"} />

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
                            if (!isEditing) return;

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
                                source={isEditing && perfilEdit.foto ?
                                    { uri: perfilEdit.foto } :
                                    perfil.foto ?
                                        { uri: perfil.foto } :
                                        require('../../../assets/image/icon_add_user.png')}
                                style={styles.profileImage}
                            />

                        </TouchableOpacity>
                        <View style={styles.name}>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        style={[styles.editNome, { color: textColor }]}
                                        value={perfilEdit.nome}
                                        onChangeText={handleNomeChange}
                                        placeholder="Nome do professor"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                        maxLength={100}
                                    />
                                    {validationErrors.nome ? (
                                        <Text style={styles.errorText}>{validationErrors.nome}</Text>
                                    ) : null}
                                    <TextInput
                                        style={[styles.editEmail, { color: textColor }]}
                                        value={perfilEdit.email}
                                        onChangeText={handleEmailChange}
                                        placeholder="Email do professor"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                        keyboardType="email-address"
                                    />
                                    {validationErrors.email ? (
                                        <Text style={styles.errorText}>{validationErrors.email}</Text>
                                    ) : null}
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

                        <View style={[styles.inline, { width: width * 0.45 }]}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Telefone</Text>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        style={[
                                            styles.inputContainer,
                                            {
                                                color: isDarkMode ? '#FFF' : '#000',
                                                backgroundColor: isDarkMode ? '#141414' : '#F0F7FF',
                                                borderColor: validationErrors.telefone ? 'red' : 'transparent',
                                                borderWidth: validationErrors.telefone ? 1 : 0
                                            }
                                        ]}
                                        value={formatarTelefone(perfilEdit.telefone)}
                                        onChangeText={handleTelefoneChange}
                                        placeholder="(00) 00000-0000"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                        keyboardType="phone-pad"
                                    />
                                    {validationErrors.telefone ? (
                                        <Text style={styles.errorText}>{validationErrors.telefone}</Text>
                                    ) : null}
                                </>
                            ) : (
                                <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
                                    <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000', fontSize: 15 }]}>
                                        {formatarTelefoneExibicao(perfil.telefone)}
                                    </Text>
                                </View>
                            )}
                        </View>


                        <View style={[styles.inline, { width: width * 0.45 }]}>
                            <Text style={[styles.label, { color: isDarkMode ? '#FFF' : '#000' }]}>Data de Nascimento</Text>
                            {isEditing ? (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.inputContainer,
                                            {
                                                backgroundColor: isDarkMode ? '#141414' : '#F0F7FF',
                                                justifyContent: 'center',
                                                borderColor: validationErrors.nascimento ? 'red' : 'transparent',
                                                borderWidth: validationErrors.nascimento ? 1 : 0,
                                            }
                                        ]}
                                        onPress={showDatepicker}
                                    >
                                        <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000', fontSize: 15 }]}>
                                            {perfilEdit.nascimento || "Selecione a data"}
                                        </Text>
                                        <Icon name="calendar" size={16} color={isDarkMode ? '#FFF' : '#666'} style={styles.calendarIcon} />
                                    </TouchableOpacity>
                                    {validationErrors.nascimento ? (
                                        <Text style={styles.errorText}>{validationErrors.nascimento}</Text>
                                    ) : null}
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
                                    <Text style={[styles.colorInput, { color: isDarkMode ? '#FFF' : '#000', fontSize: 15 }]}>
                                        {perfil.nascimento}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <>
                        <View style={styles.sectionContainer}>
                            <Text style={[styles.sectionTitle, { color: textColor }]}>Disciplinas</Text>
                            {perfil.disciplinas.length > 0 ? (
                                <View style={styles.itemsContainer}>
                                    {perfil.disciplinas.map((disciplina, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.itemPill,
                                                {
                                                    backgroundColor: isDarkMode ? '#141414' : '#F0F7FF',
                                                }
                                            ]}>
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
                                        <View
                                            key={index}
                                            style={[
                                                styles.itemPill,
                                                {
                                                    backgroundColor: isDarkMode ? '#141414' : '#F0F7FF',
                                                }
                                            ]}>
                                            <Text style={[styles.itemText, { color: textColor }]}>{turma.nomeTurma || `Turma ${turma.id}`}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={[styles.noItemsText, { color: textColor }]}>Nenhuma turma associada</Text>
                            )}
                        </View>
                    </>

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
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />
            <DeleteAlert
                visible={modalDeleteVisible}
                onDismiss={() => setModalDeleteVisible(false)}
                onConfirm={handleDelete}
                message="Tem certeza que deseja excluir o perfil?"
                confirmText="EXCLUIR"
                cancelText="CANCELAR"


            />

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
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
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
        height: 40
    },
    email: {
        fontSize: 15,
    },
    editEmail: {
        fontSize: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#1E6BE6',
        paddingBottom: 5,
        height: 40
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
    editPhotoIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1E6BE6',
        borderRadius: 12,
        padding: 4,
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '85%',
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        maxHeight: '80%',
    },
    modalHeader: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 25,
    },
    logoSquare: {
        width: 70,
        height: 70,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logo: {
        width: 50,
        height: 50,
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginVertical: 15,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    modalText: {
        fontSize: 16,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
    },
    iconeBotao: {
        padding: 10,
    },
    modalBackdrop2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer2: {
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
    modalTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalItem2: {
        padding: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText2: {
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