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
import GraficoFeedback from '../../Gerais/GraficoFeedback';
import CustomAlert from '../../Gerais/CustomAlert';
import DeleteAlert from '../../Gerais/DeleteAlert';
import FeedbackModal from '../../Gerais/FeedbackModal';
import HeaderSimplesBack from '../../Gerais/HeaderSimplesBack';
import PhotoPickerModal from '../../Gerais/PhotoPickerModal';

const { width } = Dimensions.get('window');

// Funções de validação e formatação
const formatarData = (dataString) => {
    if (!dataString) return '';

    try {
        const data = new Date(dataString);
        if (isNaN(data.getTime())) return '';

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
    // Remove formatação para validação
    const numeros = telefone.replace(/\D/g, '');
    // Verifica se tem 10 ou 11 dígitos (com ou sem 9 adicional)
    return numeros.length === 10 || numeros.length === 11;
};
const formatarTelefone = (input) => {
    if (!input) return '';

    // Remove toda formatação existente (parênteses, espaços, hífens)
    const numeros = input.replace(/\D/g, '');

    // Limita a 11 caracteres (DD + 9 dígitos)
    const limite = numeros.substring(0, 11);

    // Aplica a máscara (00) 00000-0000 ou (00) 0000-0000
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
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [perfilEdit, setPerfilEdit] = useState(perfil);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [shouldGoBack, setShouldGoBack] = useState(false);
    const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState({
        nome: '',
        email: '',
        telefone: '',
        nascimento: ''
    });
    const [newImageBase64, setNewImageBase64] = useState(null);
    const [bimestreSelecionado, setBimestreSelecionado] = useState(1);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalBimestreVisible, setModalBimestreVisible] = useState(false);
    const [modalProfessorVisible, setModalProfessorVisible] = useState(false);
    const [modalBarraVisible, setModalBarraVisible] = useState(false);
    const [barraSelecionada, setBarraSelecionada] = useState({ label: '', value: 0 });
    const [dadosGrafico, setDadosGrafico] = useState([0, 0, 0, 0, 0]);
    const [semFeedbacks, setSemFeedbacks] = useState(false);
    const [feedbacksAvaliacao, setFeedbacksAvaliacao] = useState([]);
    const [isPhotoPickerVisible, setIsPhotoPickerVisible] = useState(false);
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

    // Funções de manipulação de dados
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
    useEffect(() => {
        if (!alertVisible && shouldGoBack) {
            navigation.goBack();
            setShouldGoBack(false); // Resetar para não disparar de novo
        }
    }, [alertVisible, shouldGoBack]);
    const handleEmailChange = (text) => {
        setPerfilEdit({ ...perfilEdit, email: text });
        if (!validarEmail(text)) {
            setValidationErrors(prev => ({
                ...prev,
                email: 'Por favor, insira um email válido (Gmail ou Hotmail)'
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

    const handleDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            const idade = validarDataNascimento(date);
            if (idade < 5 || idade > 90) {
                setValidationErrors(prev => ({
                    ...prev,
                    nascimento: 'O aluno deve ter entre 5 e 90 anos'
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

    // Funções de API
    const fetchAluno = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`, {
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
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/feedbackteacher/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacks(response.data || []);
        } catch (error) {
            setFeedbacks([]);
        }
    };

    const fetchFeedbacksAvaliacao = async () => {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/feedback/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setFeedbacksAvaliacao(response.data || []);
            atualizarDadosGrafico(response.data);
        } catch (error) {

            setFeedbacksAvaliacao([]);
            setDadosGrafico([0, 0, 0, 0, 0]);
            setSemFeedbacks(true);
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


    // Funções de edição
    // Ao entrar no modo de edição
    const toggleEdit = () => {
        if (!isEditing) {
            // Garante que o telefone está formatado antes de entrar no modo edição
            const perfilComTelefoneFormatado = {
                ...perfil,
                telefone: formatarTelefone(perfil.telefone)
            };
            setPerfilEdit(perfilComTelefoneFormatado);
            setValidationErrors({
                nome: '',
                email: '',
                telefone: '',
                nascimento: ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleEditSave = async () => {
        try {
            // Verificar se há erros de validação
            const hasErrors = Object.values(validationErrors).some(error => error !== '');
            if (hasErrors) {
                setAlertTitle('Atenção');
                setAlertMessage('Corrija os campos');
                setAlertVisible(true);
                return;
            }

            // Validações adicionais
            if (!perfilEdit.nome) {
                setAlertTitle('Atenção');
                setAlertMessage('Nome é obrigatório');
                setAlertVisible(true);
                return;
            }

            if (!perfilEdit.email) {
                setAlertTitle('Atenção');
                setAlertMessage('Email é obrigatório');
                setAlertVisible(true);
                return;
            }

            if (!perfilEdit.nome || !/^[A-Za-zÀ-ÿ\s]{3,}$/.test(perfilEdit.nome.trim())) {
                setAlertTitle('Atenção');
                setAlertMessage('O nome deve conter apenas letras e no mínimo 3 caracteres.');
                setAlertVisible(true);
                return;
            }

            const emailRegex = /^[a-z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;
            if (!perfilEdit.email || !emailRegex.test(perfilEdit.email.trim())) {
                setAlertTitle('Atenção');
                setAlertMessage('Insira um e-mail válido @gmail.com ou hotmail.com');
                setAlertVisible(true);
                return;
            }


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


            const idade = validarDataNascimento(selectedDate);
            if (idade < 5 || idade > 90) {
                setAlertTitle('Atenção');
                setAlertMessage('O aluno deve ter entre 5 e 90 anos');
                setAlertVisible(true);
                return;
            }

            setUpdating(true);
            const token = await getAuthToken();

            // Converter data do formato DD/MM/YYYY para YYYY-MM-DD
            let formattedDate = '';
            if (perfilEdit.nascimento) {
                const [dia, mes, ano] = perfilEdit.nascimento.split('/');
                formattedDate = `${ano}-${mes}-${dia}`;

                // Verificar se a data é válida
                const testDate = new Date(formattedDate);
                if (isNaN(testDate.getTime())) {
                    setAlertTitle('Atenção');
                    setAlertMessage('Data de nascimento inválida');
                    setAlertVisible(true);
                    return;
                }
            }

            // Remover formatação do telefone (deixar apenas números)
            const telefoneNumerico = perfilEdit.telefone ? perfilEdit.telefone.replace(/\D/g, '') : null;

            // Preparar os dados no formato esperado pelo backend
            const dadosParaEnviar = {
                nomeAluno: perfilEdit.nome,
                dataNascimentoAluno: formattedDate || null,
                emailAluno: perfilEdit.email,
                telefoneAluno: telefoneNumerico, // Enviar apenas números
                turmaId: perfilEdit.turma?.id || null,
                imageUrl: newImageBase64
            };

            console.log('Dados sendo enviados:', dadosParaEnviar); // Para debug

            const response = await axios.put(
                `https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`,
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
                setAlertMessage('Os dados dos alunos foram atualizados com sucesso');
                setAlertVisible(true);
                await fetchAluno();
                setIsEditing(false);
                setNewImageBase64(null);
            }
        } catch (error) {
            console.error('Erro ao atualizar aluno:', error);
            let errorMessage = 'Erro ao atualizar os dados do aluno';

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

            const response = await axios.delete(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {

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
            Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível excluir o aluno'
            );
        } finally {
            setLoading(false);
            setModalDeleteVisible(false);
        }
    };

    // Componentes
    const FeedbackSection = ({ feedbacks }) => {
        const openFeedbackModal = (item) => {
            setSelectedFeedback(item);
            setFeedbackModalVisible(true);
        };

        return (
            <>
                <View
                    style={[
                        styles.feedbackOuterContainer,
                        {
                            backgroundColor: formBackgroundColor,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: textColor,
                            },
                        ]}
                    >
                        Feedbacks Recebidos ({feedbacks.length})
                    </Text>

                    {feedbacks.length > 0 ? (
                        <View
                            style={[
                                styles.feedbackContainer,
                                {
                                    borderColor: isDarkMode ? '#444' : '#DDD',
                                    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF',
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.feedbackHeader,
                                    {
                                        backgroundColor: isDarkMode ? '#333' : '#E1F0FF',
                                        borderBottomColor: isDarkMode ? '#555' : '#DDD',
                                    },
                                ]}
                            >
                                <View style={styles.feedbackHeaderCell}>
                                    <Text
                                        style={[
                                            styles.feedbackHeaderText,
                                            { color: isDarkMode ? '#FFF' : textColor },
                                        ]}
                                    >
                                        Criado por
                                    </Text>
                                </View>
                                <View style={styles.feedbackHeaderCell}>
                                    <Text
                                        style={[
                                            styles.feedbackHeaderText,
                                            { color: isDarkMode ? '#FFF' : textColor },
                                        ]}
                                    >
                                        Feedback
                                    </Text>
                                </View>
                            </View>

                            <ScrollView
                                style={{ height: 250 }}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                            >
                                {feedbacks.map((item, index) => (
                                    <FeedbackItem
                                        key={index}
                                        item={item}
                                        onPress={openFeedbackModal}
                                        textColor={isDarkMode ? '#FFF' : textColor}
                                    />
                                ))}
                            </ScrollView>
                        </View>
                    ) : (
                        <View style={[styles.noFeedbackContainer, {backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',}]}>
                            <MaterialIcons
                                name="feedback"
                                size={40}
                                color={isDarkMode ? '#666' : '#999'}
                            />
                            <Text
                                style={[
                                    styles.noFeedbackText,
                                    { color: isDarkMode ? '#AAA' : '#888' },
                                ]}
                            >
                                Nenhum feedback recebido ainda
                            </Text>
                        </View>
                    )}
                </View>


                <FeedbackModal
                    visible={feedbackModalVisible}
                    onDismiss={() => setFeedbackModalVisible(false)}
                    studentName={selectedFeedback?.teacher?.nomeDocente}
                    feedbackContent={selectedFeedback?.conteudo}
                    formBackgroundColor={formBackgroundColor}
                    textColor={textColor}
                />
            </>

        );
    };

    const FeedbackItem = ({ item, onPress, textColor }) => {
        return (
            <View style={[styles.feedbackRow, { backgroundColor: perfilBackgroundColor }]}>
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

    // Efeitos
    useEffect(() => {
        requestPermissions();
        if (alunoId) {
            fetchAluno();
            fetchFeedbacks();
            fetchFeedbacksAvaliacao();
        } else {
            setError('ID do aluno não fornecido.');
            setLoading(false);
        }
    }, [alunoId]);

    useEffect(() => {
        if (feedbacksAvaliacao.length > 0) {
            atualizarDadosGrafico(feedbacksAvaliacao);
        }
    }, [bimestreSelecionado, professorSelecionado]);

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
            <HeaderSimplesBack titulo={isEditing ? "EDITANDO PERFIL" : "PERFIL DO ALUNO"} />

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
                            setIsPhotoPickerVisible(true);
                        }}>
                            <Image
                                source={isEditing && perfilEdit.foto ?
                                    { uri: perfilEdit.foto } :
                                    perfil.foto ?
                                        { uri: perfil.foto } :
                                        require('../../../assets/image/icon_add_user.png')}
                                style={styles.profileImage}
                            />
                            {isEditing && (
                                <View style={styles.editPhotoIndicator}>
                                    <Icon name="camera" size={16} color="white" />
                                </View>
                            )}
                            <PhotoPickerModal
                                visible={isPhotoPickerVisible}
                                onDismiss={() => setIsPhotoPickerVisible(false)}
                                onPickImage={pickImage}
                                onTakePhoto={takePhoto}
                            />
                        </TouchableOpacity>
                        <View style={styles.name}>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        style={[
                                            styles.editNome,
                                            {
                                                color: textColor,
                                                borderBottomColor: validationErrors.nome ? 'red' : '#1E6BE6'
                                            }
                                        ]}
                                        value={perfilEdit.nome}
                                        onChangeText={handleNomeChange}
                                        placeholder="Nome do aluno"
                                        placeholderTextColor={isDarkMode ? '#AAA' : '#888'}
                                        maxLength={100}
                                    />
                                    {validationErrors.nome ? (
                                        <Text style={styles.errorText}>{validationErrors.nome}</Text>
                                    ) : null}
                                    <TextInput
                                        style={[
                                            styles.editEmail,
                                            {
                                                color: textColor,
                                                borderBottomColor: validationErrors.email ? 'red' : '#1E6BE6'
                                            }
                                        ]}
                                        value={perfilEdit.email}
                                        onChangeText={handleEmailChange}
                                        placeholder="Email do aluno"
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
                                <>
                                    <TextInput
                                        style={[
                                            styles.inputContainer,
                                            {
                                                color: isDarkMode ? '#FFF' : '#000',
                                                backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
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

                        {/* Data de Nascimento */}
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
                                                borderWidth: validationErrors.nascimento ? 1 : 0
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
                                <View style={[styles.itemPill, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
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
                <View style={[styles.graficoContainer, { backgroundColor: formBackgroundColor }]}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Avaliação do Aluno</Text>

                    <GraficoFeedback
                        dadosGrafico={dadosGrafico}
                        bimestreSelecionado={bimestreSelecionado}
                        professorSelecionado={professorSelecionado}
                        semFeedbacks={semFeedbacks}

                        onSelecionarBimestre={() => setModalBimestreVisible(true)}
                        onSelecionarProfessor={() => setModalProfessorVisible(true)}
                        onLimparFiltroProfessor={handleLimparFiltroProfessor}
                        onBarraClick={handleBarraClick}
                        isDarkMode={isDarkMode}
                    />
                </View>
            </View>



            {/* Bimestre Selection Modal */}
            <Modal visible={modalBimestreVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalBimestreVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#141414' : '#FFF' }]}>
                        {/* Header with logo */}
                        <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                            <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                <Image
                                    source={require('../../../assets/image/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                        </View>

                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                            Selecione o Bimestre
                        </Text>

                        {[1, 2, 3, 4].map((bimestre) => (
                            <TouchableOpacity
                                key={bimestre}
                                style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                onPress={() => {
                                    setBimestreSelecionado(bimestre);
                                    setModalBimestreVisible(false);
                                }}
                            >
                                <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                                    {bimestre}º Bimestre
                                </Text>

                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Professor Selection Modal */}
            <Modal visible={modalProfessorVisible} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setModalProfessorVisible(false)}
                    activeOpacity={1}
                >
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#141414' : '#FFF' }]}>
                        {/* Header with logo */}
                        <View style={[styles.modalHeader, { backgroundColor: '#0077FF' }]}>
                            <View style={[styles.logoSquare, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
                                <Image
                                    source={require('../../../assets/image/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>

                        </View>

                        <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>
                            Selecione o Professor
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                            onPress={() => handleSelecionarProfessor(null)}
                        >
                            <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                                Todos Professores
                            </Text>

                        </TouchableOpacity>

                        {feedbacksAvaliacao
                            .filter((feedback, index, self) =>
                                feedback.createdByDTO &&
                                self.findIndex(f => f.createdByDTO.id === feedback.createdByDTO.id) === index
                            )
                            .map((feedback) => (
                                <TouchableOpacity
                                    key={feedback.createdByDTO.id}
                                    style={[styles.modalItem, { borderBottomColor: isDarkMode ? '#444' : '#EEE' }]}
                                    onPress={() => handleSelecionarProfessor(feedback.createdByDTO)}
                                >
                                    <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>
                                        {feedback.createdByDTO.nomeDocente}
                                    </Text>

                                </TouchableOpacity>
                            ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Bar Value Modal */}
            <Modal visible={modalBarraVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop2}>
                    <View style={[styles.modalContainer2, { backgroundColor: '#1E6BE6' }]}>
                        <Text style={[styles.modalTitle2, { color: 'white' }]}>Valor</Text>
                        <Text style={[styles.modalText2, { color: 'white', fontSize: 24 }]}>
                            {barraSelecionada.value.toFixed(1)}
                        </Text>
                        <TouchableOpacity
                            style={[styles.cancelButton, { backgroundColor: 'white', marginTop: 20 }]}
                            onPress={() => setModalBarraVisible(false)}
                        >
                            <Text style={{ fontWeight: 18, color: '#1E6BE6' }}>Fechar</Text>
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
            {/* Delete Confirmation Modal */}
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
    deleteButton: {
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    cancelButton: {
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    graficoContainer: {
        marginTop: 0,
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 70
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
    inputError: {
        borderColor: 'red',
        borderWidth: 1,
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
        marginTop: 4,
        marginLeft: 10,
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
        paddingBottom: 5,
        height: 40
    },
    inlineFieldsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
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
        alignItems: 'center',
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
    feedbackContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FAFAFA',
        borderWidth: 1,
        borderColor: '#000',

    },

    feedbackHeader: {
        flexDirection: 'row',
        paddingVertical: 14,
        backgroundColor: '#EAF3FF',
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },

    feedbackHeaderCell: {
        flex: 1,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    feedbackHeaderText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#007BFF',
        textTransform: 'uppercase',
    },

    feedbackBody: {
        maxHeight: 300,
    },
    feedbackOuterContainer: {
        marginTop: 30,
        borderRadius: 16,
        padding: 20,
        backgroundColor: '#F0F7FF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 20
    },

    feedbackRow: {
        flexDirection: 'row',
        minHeight: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingRight: 65,
        gap: 70
    },

    feedbackCell: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },

    feedbackText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },

    noFeedbackContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EEE',
    },

    noFeedbackText: {
        marginTop: 10,
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
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

});