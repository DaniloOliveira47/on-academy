import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Modal,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomAlert from '../Gerais/CustomAlert';

export default function CadastroAlunoModal({ visible, onClose, turmaId, isCreating, onCreate }) {
    const [nomeAluno, setNomeAluno] = useState('');
    const [emailAluno, setEmailAluno] = useState('');
    const [telefoneAluno, setTelefoneAluno] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [profileImage, setProfileImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const { isDarkMode } = useTheme();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');


    // Request permissions when component mounts
    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para adicionar fotos');
                }
            }
        })();
    }, []);

    // Reset form when modal opens
    useEffect(() => {
        if (visible) {
            setNomeAluno('');
            setEmailAluno('');
            setTelefoneAluno('');
            setDataNascimento('');
            setSelectedBirthDate(new Date());
            setProfileImage(null);
            setImageBase64(null);
            setTouched({});
            setErrors({});
        }
    }, [visible]);

    useEffect(() => {
        const validationErrors = {};

        // Nome
        if (touched.nomeAluno) {
            if (!nomeAluno.trim()) {
                validationErrors.nomeAluno = 'Nome é obrigatório';
            } else if (nomeAluno.length < 3) {
                validationErrors.nomeAluno = 'Nome muito curto';
            }
        }

        // Email
        if (touched.emailAluno) {
            if (!emailAluno.trim()) {
                validationErrors.emailAluno = 'Email é obrigatório';
            } else if (!/^[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com$/.test(emailAluno.trim().toLowerCase())) {
                validationErrors.emailAluno = 'Use um email do Gmail ou Hotmail';
            }
        }

        // Telefone
        if (touched.telefoneAluno) {
            const digits = telefoneAluno.replace(/\D/g, '');
            if (!digits) {
                validationErrors.telefoneAluno = 'Telefone é obrigatório';
            } else if (!/^\d{10,11}$/.test(digits)) {
                validationErrors.telefoneAluno = 'Telefone inválido (10 ou 11 dígitos)';
            }
        }

        // Data de nascimento
        if (touched.dataNascimento) {
            if (!dataNascimento) {
                validationErrors.dataNascimento = 'Data de nascimento é obrigatória';
            } else {
                const birthDate = new Date(selectedBirthDate);
                const today = new Date();
                const minDate = new Date();
                minDate.setFullYear(today.getFullYear() - 100);

                if (birthDate > today) {
                    validationErrors.dataNascimento = 'Data não pode ser no futuro';
                } else if (birthDate < minDate) {
                    validationErrors.dataNascimento = 'Data inválida (muito antiga)';
                }
            }
        }

        setErrors(validationErrors);
    }, [nomeAluno, emailAluno, telefoneAluno, dataNascimento, touched]);

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
    };

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
            setTouched({ ...touched, dataNascimento: true });
        }
    };

    // Formatação automática do telefone
    const formatPhone = (input) => {
        const numbers = input.replace(/\D/g, '');
        let formatted = '';

        if (numbers.length > 0) {
            formatted = `(${numbers.substring(0, 2)}`;
        }
        if (numbers.length > 2) {
            formatted += `) ${numbers.substring(2, 7)}`;
        }
        if (numbers.length > 7) {
            formatted += `-${numbers.substring(7, 11)}`;
        }

        return formatted;
    };

    const handlePhoneChange = (text) => {
        const formatted = formatPhone(text);
        setTelefoneAluno(formatted);
    };

    // Image picker function
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
                    setProfileImage(`data:image/jpeg;base64,${selectedAsset.base64}`);
                    setImageBase64(selectedAsset.base64);
                } else if (selectedAsset.uri) {
                    const base64Image = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    setProfileImage(`data:image/jpeg;base64,${base64Image}`);
                    setImageBase64(base64Image);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const handleCadastrar = async () => {
        setTouched({
            nomeAluno: true,
            emailAluno: true,
            telefoneAluno: true,
            dataNascimento: true
        });

        if (!isFormValid()) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, preencha todos os campos corretamente.');
            setAlertVisible(true);
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@user_token');
            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];
            const phoneDigits = telefoneAluno.replace(/\D/g, '');

            const alunoData = {
                nomeAluno: nomeAluno.trim(),
                dataNascimentoAluno: dataFormatada,
                emailAluno: emailAluno.trim().toLowerCase(),
                telefoneAluno: phoneDigits,
                turmaId,
                imageUrl: imageBase64
            };

            await onCreate(alunoData, token);

            // Reset
            setNomeAluno('');
            setEmailAluno('');
            setTelefoneAluno('');
            setDataNascimento('');
            setSelectedBirthDate(new Date());
            setProfileImage(null);
            setImageBase64(null);
            setTouched({});

            setAlertTitle('Sucesso');
            setAlertMessage('Aluno cadastrado com sucesso!');
            setAlertVisible(true);

        } catch (error) {
            let errorMessage = 'Erro ao cadastrar aluno. Tente novamente.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Dados inválidos. Verifique as informações.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Email já cadastrado para outro aluno.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Autenticação necessária. Faça login novamente.';
                }
            }

            setAlertTitle('Erro');
            setAlertMessage(errorMessage);
            setAlertVisible(true);
        }
    };

    const isFormValid = () => {
        return nomeAluno &&
            emailAluno &&
            telefoneAluno &&
            dataNascimento &&
            Object.keys(errors).length === 0;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity
                style={[styles.modalContainer, isDarkMode && styles.darkModalContainer]}
                activeOpacity={1}
            >
                <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
                    <Image
                        style={{
                            width: '100%',
                            borderTopRightRadius: 10,
                            borderTopLeftRadius: 10,
                            height: 100
                        }}
                        source={require('../../assets/image/barraAzul.png')}
                    />
                    <View style={{ width: '100%', padding: 20 }}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            disabled={isCreating}
                        >
                            <Icon name="x" size={30} color={isCreating ? '#CCC' : isDarkMode ? '#FFF' : '#000'} />
                        </TouchableOpacity>

                        {/* Profile Image Picker */}
                        <View style={styles.imagePickerContainer}>
                            <TouchableOpacity onPress={pickImage} disabled={isCreating}>
                                <Image
                                    source={profileImage ?
                                        { uri: profileImage } :
                                        require('../../assets/image/icon_add_user.png')}
                                    style={styles.profileImage}
                                />
                            </TouchableOpacity>
                            <Text style={[styles.imagePickerText, isDarkMode && styles.darkText]}>
                                {profileImage ? 'Alterar Foto' : 'Adicionar Foto'}
                            </Text>
                        </View>

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.nomeAluno && styles.inputError]}
                            placeholder="Nome Completo"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            value={nomeAluno}
                            onChangeText={setNomeAluno}
                            onBlur={() => handleBlur('nomeAluno')}
                            editable={!isCreating}
                        />
                        {errors.nomeAluno && <Text style={styles.errorText}>{errors.nomeAluno}</Text>}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.emailAluno && styles.inputError]}
                            placeholder="Email"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={emailAluno}
                            onChangeText={setEmailAluno}
                            onBlur={() => handleBlur('emailAluno')}
                            editable={!isCreating}
                        />
                        {errors.emailAluno && <Text style={styles.errorText}>{errors.emailAluno}</Text>}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.telefoneAluno && styles.inputError]}
                            placeholder="Telefone (XX) XXXXX-XXXX"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="phone-pad"
                            value={telefoneAluno}
                            onChangeText={handlePhoneChange}
                            onBlur={() => handleBlur('telefoneAluno')}
                            editable={!isCreating}
                            maxLength={15}
                        />
                        {errors.telefoneAluno && <Text style={styles.errorText}>{errors.telefoneAluno}</Text>}

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Data de Nascimento</Text>
                        <View style={styles.dateContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.dateInput,
                                    isDarkMode && styles.darkInput,
                                    errors.dataNascimento && styles.inputError
                                ]}
                                placeholder="Selecione a data de nascimento"
                                placeholderTextColor={isDarkMode ? '#888' : '#666'}
                                value={dataNascimento}
                                editable={false}
                                onFocus={() => !isCreating && setShowBirthDatePicker(true)}
                            />
                            <TouchableOpacity
                                style={styles.dateIconButton}
                                onPress={() => !isCreating && setShowBirthDatePicker(true)}
                                disabled={isCreating}
                            >
                                <Icon name="calendar" size={24} color={isCreating ? '#CCC' : '#1A85FF'} />
                            </TouchableOpacity>
                        </View>
                        {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}
                        {showBirthDatePicker && (
                            <DateTimePicker
                                value={selectedBirthDate}
                                mode="date"
                                display="default"
                                onChange={handleBirthDateChange}
                                maximumDate={new Date()}
                                minimumDate={new Date(1900, 0, 1)}
                            />
                        )}

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (!isFormValid() || isCreating) && styles.saveButtonDisabled
                            ]}
                            onPress={handleCadastrar}
                            disabled={!isFormValid() || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar Aluno</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />

        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    darkModalContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    darkModalContent: {
        backgroundColor: '#1E1E1E',
    },
    darkInput: {
        backgroundColor: '#2D2D2D',
        color: '#FFF',
    },
    darkLabel: {
        color: '#FFF',
    },
    darkText: {
        color: '#FFF',
    },
    modalContent: {
        width: '92%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#F0F7FF',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    inputError: {
        borderColor: '#FF3B30',
        borderWidth: 1,
    },
    errorText: {
        alignSelf: 'flex-start',
        color: '#FF3B30',
        fontSize: 12,
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#000',
        marginBottom: 5,
        alignSelf: 'flex-start',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
        width: '100%',
    },
    dateInput: {
        flex: 1,
        marginRight: 10,
    },
    dateIconButton: {
        padding: 10,
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#1A85FF',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonDisabled: {
        backgroundColor: '#8FBFFF',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    imagePickerText: {
        color: '#1A85FF',
        fontWeight: 'bold',
    },
});