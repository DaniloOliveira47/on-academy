import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../path/ThemeContext';
import CustomAlert from '../Gerais/CustomAlert';

export default function CadastroProfessorModal({ visible, onClose, onCreate, isCreating }) {
    const [nomeDocente, setNomeDocente] = useState('');
    const [emailDocente, setEmailDocente] = useState('');
    const [telefoneDocente, setTelefoneDocente] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [disciplines, setDisciplines] = useState([]);
    const [selectedDisciplines, setSelectedDisciplines] = useState([]);
    const [loadingDisciplines, setLoadingDisciplines] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const { isDarkMode } = useTheme();
    const [touched, setTouched] = useState({
        nomeDocente: false,
        emailDocente: false,
        telefoneDocente: false,
        dataNascimento: false,
        disciplines: false
    });
    const [errors, setErrors] = useState({});
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (visible) {
            fetchDisciplines();
            resetForm();
        }
    }, [visible]);

    useEffect(() => {
        const validationErrors = {};

        // Regex
        const nomeRegex = /^[A-Za-zÀ-ÿ\s]{3,}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com)$/i;

        if (touched.nomeDocente) {
            if (!nomeDocente.trim()) {
                validationErrors.nomeDocente = 'Nome é obrigatório';
            } else if (!nomeRegex.test(nomeDocente.trim())) {
                validationErrors.nomeDocente = 'O nome deve conter apenas letras e no mínimo 3 caracteres';
            }
        }

        if (touched.emailDocente) {
            if (!emailDocente.trim()) {
                validationErrors.emailDocente = 'Email é obrigatório';
            } else if (!emailRegex.test(emailDocente.trim().toLowerCase())) {
                validationErrors.emailDocente = 'Use um e-mail válido: @gmail.com ou @hotmail.com';
            }
        }

        if (touched.telefoneDocente) {
            const digits = telefoneDocente.replace(/\D/g, '');
            if (!digits) {
                validationErrors.telefoneDocente = 'Telefone é obrigatório';
            } else if (!/^\d{10,11}$/.test(digits)) {
                validationErrors.telefoneDocente = 'Telefone inválido (10 ou 11 dígitos)';
            }
        }

        if (touched.dataNascimento) {
            if (!dataNascimento) {
                validationErrors.dataNascimento = 'Data de nascimento é obrigatória';
            } else {
                const birthDate = new Date(selectedBirthDate);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();

                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }

                if (age < 18) {
                    validationErrors.dataNascimento = 'O professor deve ter pelo menos 18 anos';
                }
            }
        }

        if (touched.disciplines && selectedDisciplines.length === 0) {
            validationErrors.disciplines = 'Selecione pelo menos uma disciplina';
        }

        setErrors(validationErrors);
    }, [nomeDocente, emailDocente, telefoneDocente, dataNascimento, selectedDisciplines, touched]);

    const resetForm = () => {
        setNomeDocente('');
        setEmailDocente('');
        setTelefoneDocente('');
        setDataNascimento('');
        setSelectedBirthDate(new Date());
        setSelectedDisciplines([]);
        setProfileImage(null);
        setImageBase64(null);
        setTouched({
            nomeDocente: false,
            emailDocente: false,
            telefoneDocente: false,
            dataNascimento: false,
            disciplines: false
        });
        setErrors({});
    };

    const isFormValid = () => {
        return nomeDocente.trim() &&
            emailDocente.trim() &&
            telefoneDocente.replace(/\D/g, '').length >= 10 &&
            dataNascimento &&
            selectedDisciplines.length > 0 &&
            Object.keys(errors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
    };

    const fetchDisciplines = async () => {
        try {
            setLoadingDisciplines(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/discipline', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDisciplines(response.data);
        } catch (error) {
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível carregar as disciplinas');
            setAlertVisible(true);
        } finally {
            setLoadingDisciplines(false);
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
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível selecionar a imagem.');
            setAlertVisible(true);
        }
    };

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
            handleBlur('dataNascimento');
        }
    };

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
        setTelefoneDocente(formatted);
        handleBlur('telefoneDocente');
    };

    const toggleDiscipline = (disciplineId) => {
        if (isCreating) return;

        setSelectedDisciplines(prev => {
            const newSelection = prev.includes(disciplineId)
                ? prev.filter(id => id !== disciplineId)
                : [...prev, disciplineId];
            return newSelection;
        });

        handleBlur('disciplines');
    };

    const handleSubmit = async () => {
        // Marca todos os campos como tocados para mostrar erros
        setTouched({
            nomeDocente: true,
            emailDocente: true,
            telefoneDocente: true,
            dataNascimento: true,
            disciplines: true
        });

        if (!isFormValid()) {
            setAlertTitle('Erro');
            setAlertMessage('Por favor, preencha todos os campos corretamente.');
            setAlertVisible(true);
            return;
        }

        try {
            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];
            const professorData = {
                nomeDocente: nomeDocente.trim(),
                dataNascimentoDocente: dataFormatada,
                emailDocente: emailDocente.trim().toLowerCase(),
                telefoneDocente: telefoneDocente.replace(/\D/g, ''),
                disciplineId: selectedDisciplines,
                imageUrl: imageBase64
            };

            await onCreate(professorData);

        } catch (error) {

        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity
                style={[styles.modalContainer, isDarkMode && styles.darkModalContainer]}
                activeOpacity={1}
            >
                <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>



                    <Image
                        style={styles.headerImage}
                        source={require('../../assets/image/barraAzul.png')}
                    />
                    <View style={styles.contentContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            disabled={isCreating}
                        >
                            <Icon name="x" size={30} color={isCreating ? '#CCC' : isDarkMode ? '#FFF' : '#000'} />
                        </TouchableOpacity>

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
                            errors.nomeDocente && styles.inputError]}
                            placeholder="Nome Completo"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            value={nomeDocente}
                            onChangeText={setNomeDocente}
                            onBlur={() => handleBlur('nomeDocente')}
                            editable={!isCreating}
                        />
                        {errors.nomeDocente && <Text style={styles.errorText}>{errors.nomeDocente}</Text>}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.emailDocente && styles.inputError]}
                            placeholder="Email"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={emailDocente}
                            onChangeText={setEmailDocente}
                            onBlur={() => handleBlur('emailDocente')}
                            editable={!isCreating}
                        />
                        {errors.emailDocente && <Text style={styles.errorText}>{errors.emailDocente}</Text>}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.telefoneDocente && styles.inputError]}
                            placeholder="Telefone (XX) XXXXX-XXXX"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="phone-pad"
                            value={telefoneDocente}
                            onChangeText={handlePhoneChange}
                            onBlur={() => handleBlur('telefoneDocente')}
                            editable={!isCreating}
                            maxLength={15}
                        />
                        {errors.telefoneDocente && <Text style={styles.errorText}>{errors.telefoneDocente}</Text>}

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

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Disciplinas</Text>
                        {errors.disciplines && <Text style={styles.errorText}>{errors.disciplines}</Text>}
                        {loadingDisciplines ? (
                            <ActivityIndicator size="small" color={isDarkMode ? '#1A85FF' : '#1A85FF'} />
                        ) : (
                            <ScrollView nestedScrollEnabled={true} style={[styles.disciplinesContainer, isDarkMode && styles.darkDisciplinesContainer]} contentContainerStyle={styles.disciplinesContent}>
                                {disciplines.map(discipline => (
                                    <TouchableOpacity
                                        key={discipline.id}
                                        style={[
                                            styles.disciplineItem,
                                            isDarkMode && styles.darkDisciplineItem,
                                            selectedDisciplines.includes(discipline.id) && styles.disciplineItemSelected,
                                            isDarkMode && selectedDisciplines.includes(discipline.id) && styles.darkDisciplineItemSelected,
                                            isCreating && styles.disabledItem
                                        ]}
                                        onPress={() => toggleDiscipline(discipline.id)}
                                        disabled={isCreating}
                                    >
                                        <Text style={[styles.disciplineText, isDarkMode && styles.darkDisciplineText]}>{discipline.nomeDisciplina}</Text>
                                        {selectedDisciplines.includes(discipline.id) && (
                                            <Icon name="check" size={18} color="#1A85FF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                (!isFormValid() || isCreating) && styles.saveButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!isFormValid() || isCreating}
                        >
                            {isCreating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Salvar Professor</Text>
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

// Estilos permanecem os mesmos

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContent: {
        width: '92%',
        backgroundColor: '#FFF',
        borderRadius: 20,
        alignItems: 'center',
    },
    headerImage: {
        width: '100%',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        height: 100
    },
    contentContainer: {
        width: '100%',
        padding: 20,
        position: 'relative'
    },
    closeButton: {
        position: 'absolute',
        top: -5,
        right: 0,
        backgroundColor: 'transparent',
        zIndex: 10,
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
    darkErrorText: {
        color: '#FF7D7D',
    },
    darkDisciplinesContainer: {
        backgroundColor: '#1E1E1E',
    },
    darkDisciplineItem: {
        backgroundColor: '#2D2D2D',
    },
    darkDisciplineItemSelected: {
        backgroundColor: '#333333',
        borderColor: '#1A85FF',
    },
    darkDisciplineText: {
        color: '#FFF',
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
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
        alignSelf: 'flex-start',
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
    disciplinesContainer: {
        width: '100%',
        maxHeight: 150,
        marginBottom: 5,
    },
    disciplinesContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    disciplineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7FF',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginRight: 10,
        marginBottom: 10,
    },
    disciplineItemSelected: {
        backgroundColor: '#E1F0FF',
        borderWidth: 1,
        borderColor: '#1A85FF',
    },
    disabledItem: {
        opacity: 0.6,
    },
    disciplineText: {
        marginRight: 5,
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