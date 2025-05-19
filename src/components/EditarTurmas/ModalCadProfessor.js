import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../../path/ThemeContext';

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
    const [errors, setErrors] = useState({
        nomeDocente: '',
        emailDocente: '',
        telefoneDocente: '',
        dataNascimento: '',
        disciplines: ''
    });

    useEffect(() => {
        if (visible) {
            fetchDisciplines();

            setNomeDocente('');
            setEmailDocente('');
            setTelefoneDocente('');
            setDataNascimento('');
            setSelectedBirthDate(new Date());
            setSelectedDisciplines([]);
            setProfileImage(null);
            setImageBase64(null);
            setErrors({
                nomeDocente: '',
                emailDocente: '',
                telefoneDocente: '',
                dataNascimento: '',
                disciplines: ''
            });
        }
    }, [visible]);


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
            Alert.alert('Erro', 'Não foi possível carregar as disciplinas');
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
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
            setErrors(prev => ({ ...prev, dataNascimento: '' }));
        }
    };

    const toggleDiscipline = (disciplineId) => {
        if (isCreating) return;
        setSelectedDisciplines(prev => {
            const newSelection = prev.includes(disciplineId)
                ? prev.filter(id => id !== disciplineId)
                : [...prev, disciplineId];

            if (newSelection.length > 0) {
                setErrors(prev => ({ ...prev, disciplines: '' }));
            }

            return newSelection;
        });
    };

    const formatPhoneNumber = (input) => {
        const cleaned = input.replace(/\D/g, '');
        const limited = cleaned.slice(0, 11);

        if (limited.length <= 10) {
            return limited.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            return limited.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    };

    const handlePhoneChange = (text) => {
        const formatted = formatPhoneNumber(text);
        setTelefoneDocente(formatted);
        if (formatted.replace(/\D/g, '').length >= 10) {
            setErrors(prev => ({ ...prev, telefoneDocente: '' }));
        }
    };

    const validateFields = () => {
        let valid = true;
        const newErrors = {
            nomeDocente: '',
            emailDocente: '',
            telefoneDocente: '',
            dataNascimento: '',
            disciplines: ''
        };

        if (!nomeDocente.trim()) {
            newErrors.nomeDocente = 'Nome é obrigatório';
            valid = false;
        } else if (nomeDocente.trim().length < 3) {
            newErrors.nomeDocente = 'Nome deve ter pelo menos 3 caracteres';
            valid = false;
        }

        if (!emailDocente.trim()) {
            newErrors.emailDocente = 'Email é obrigatório';
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDocente)) {
            newErrors.emailDocente = 'Email inválido';
            valid = false;
        }

        const phoneDigits = telefoneDocente.replace(/\D/g, '');
        if (!phoneDigits) {
            newErrors.telefoneDocente = 'Telefone é obrigatório';
            valid = false;
        } else if (phoneDigits.length < 10) {
            newErrors.telefoneDocente = 'Telefone inválido';
            valid = false;
        }

        if (!dataNascimento) {
            newErrors.dataNascimento = 'Data de nascimento é obrigatória';
            valid = false;
        } else {
            const today = new Date();
            const birthDate = new Date(selectedBirthDate);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                newErrors.dataNascimento = 'O professor deve ter pelo menos 18 anos';
                valid = false;
            }
        }

        if (selectedDisciplines.length === 0) {
            newErrors.disciplines = 'Selecione pelo menos uma disciplina';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleSubmit = async () => {
        if (!validateFields()) return;

        const dataFormatada = selectedBirthDate.toISOString().split('T')[0];
        const professorData = {
            nomeDocente: nomeDocente.trim(),
            dataNascimentoDocente: dataFormatada,
            emailDocente: emailDocente.trim(),
            telefoneDocente: telefoneDocente.replace(/\D/g, ''),
            disciplineId: selectedDisciplines,
            imageUrl: imageBase64
        };

        await onCreate(professorData);
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
                            width: '100%', borderTopRightRadius: 10, borderTopLeftRadius: 10, height
                                : 100
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
                            errors.nomeDocente && styles.inputError]}
                            placeholder="Nome Completo"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            value={nomeDocente}
                            onChangeText={(text) => {
                                setNomeDocente(text);
                                if (text.trim()) {
                                    setErrors(prev => ({ ...prev, nomeDocente: '' }));
                                }
                            }}
                            editable={!isCreating}
                        />
                        {errors.nomeDocente ? <Text style={styles.errorText}>{errors.nomeDocente}</Text> : null}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.emailDocente && styles.inputError]}
                            placeholder="Email"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={emailDocente}
                            onChangeText={(text) => {
                                setEmailDocente(text);
                                if (text.trim()) {
                                    setErrors(prev => ({ ...prev, emailDocente: '' }));
                                }
                            }}
                            editable={!isCreating}
                        />
                        {errors.emailDocente ? <Text style={styles.errorText}>{errors.emailDocente}</Text> : null}

                        <TextInput
                            style={[styles.input,
                            isDarkMode && styles.darkInput,
                            errors.telefoneDocente && styles.inputError]}
                            placeholder="Telefone (DDD) + número"
                            placeholderTextColor={isDarkMode ? '#888' : '#AAA'}
                            keyboardType="phone-pad"
                            value={telefoneDocente}
                            onChangeText={handlePhoneChange}
                            editable={!isCreating}
                            maxLength={15}
                        />
                        {errors.telefoneDocente ? <Text style={styles.errorText}>{errors.telefoneDocente}</Text> : null}

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Data de Nascimento</Text>
                        <View style={styles.dateContainer}>
                            <TextInput
                                style={[styles.input,
                                styles.dateInput,
                                isDarkMode && styles.darkInput,
                                errors.dataNascimento && styles.inputError]}
                                placeholder="Selecione a data de nascimento"
                                placeholderTextColor={isDarkMode ? '#888' : '#666'}
                                value={dataNascimento}
                                editable={false}
                            />
                            <TouchableOpacity
                                style={styles.dateIconButton}
                                onPress={() => !isCreating && setShowBirthDatePicker(true)}
                                disabled={isCreating}
                            >
                                <Icon name="calendar" size={24} color={isCreating ? '#CCC' : '#1A85FF'} />
                            </TouchableOpacity>
                        </View>
                        {errors.dataNascimento ? <Text style={styles.errorText}>{errors.dataNascimento}</Text> : null}
                        {showBirthDatePicker && (
                            <DateTimePicker
                                value={selectedBirthDate}
                                mode="date"
                                onChange={handleBirthDateChange}
                                maximumDate={new Date()}
                                themeVariant={isDarkMode ? 'dark' : 'light'}
                                textColor={isDarkMode ? '#FFF' : '#000'}
                            />
                        )}

                        <Text style={[styles.label, isDarkMode && styles.darkLabel]}>Disciplinas</Text>
                        {errors.disciplines ? <Text style={[styles.errorText, isDarkMode && styles.darkErrorText]}>{errors.disciplines}</Text> : null}
                        {loadingDisciplines ? (
                            <ActivityIndicator size="small" color={isDarkMode ? '#1A85FF' : '#1A85FF'} />
                        ) : (
                            <ScrollView style={[styles.disciplinesContainer, isDarkMode && styles.darkDisciplinesContainer]} contentContainerStyle={styles.disciplinesContent}>
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
                                isCreating && styles.saveButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={isCreating}
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
    modalContent: {
        width: '92%',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        borderRadius: 20,
        alignItems: 'center',

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