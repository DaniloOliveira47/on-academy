import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (visible) {
            fetchDisciplines();
            resetForm();
        }
    }, [visible]);

    useEffect(() => {
        validateForm();
    }, [nomeDocente, emailDocente, telefoneDocente, dataNascimento, selectedDisciplines, touched]);

    const resetForm = () => {
        setNomeDocente('');
        setEmailDocente('');
        setTelefoneDocente('');
        setDataNascimento('');
        setSelectedBirthDate(new Date());
        setSelectedDisciplines([]);
        setErrors({});
        setTouched({});
    };

    const fetchDisciplines = async () => {
        try {
            setLoadingDisciplines(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get('http://10.0.2.2:3000/api/discipline', {
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

    const validateForm = () => {
        const validationErrors = {};
        
        if (touched.nomeDocente && !nomeDocente.trim()) {
            validationErrors.nomeDocente = 'Nome é obrigatório';
        } else if (nomeDocente.length > 0 && nomeDocente.length < 3) {
            validationErrors.nomeDocente = 'Nome muito curto';
        }
        
        if (touched.emailDocente && !emailDocente) {
            validationErrors.emailDocente = 'Email é obrigatório';
        } else if (touched.emailDocente && !/\S+@\S+\.\S+/.test(emailDocente)) {
            validationErrors.emailDocente = 'Email inválido';
        }
        
        if (touched.telefoneDocente && !telefoneDocente) {
            validationErrors.telefoneDocente = 'Telefone é obrigatório';
        } else if (telefoneDocente && !/^[0-9]{10,11}$/.test(telefoneDocente.replace(/\D/g, ''))) {
            validationErrors.telefoneDocente = 'Telefone inválido (10 ou 11 dígitos)';
        }
        
        if (touched.dataNascimento && !dataNascimento) {
            validationErrors.dataNascimento = 'Data de nascimento é obrigatória';
        } else if (dataNascimento) {
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
        
        if (touched.selectedDisciplines && selectedDisciplines.length === 0) {
            validationErrors.selectedDisciplines = 'Selecione pelo menos uma disciplina';
        }
        
        setErrors(validationErrors);
    };

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
        setTouched({ ...touched, telefoneDocente: true });
    };

    const toggleDiscipline = (disciplineId) => {
        if (isCreating) return;
        
        setSelectedDisciplines(prev => {
            const newSelection = prev.includes(disciplineId) 
                ? prev.filter(id => id !== disciplineId)
                : [...prev, disciplineId];
            
            setTouched({ ...touched, selectedDisciplines: true });
            return newSelection;
        });
    };

    const isFormValid = () => {
        return nomeDocente && 
               emailDocente && 
               telefoneDocente && 
               dataNascimento && 
               selectedDisciplines.length > 0 && 
               Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        // Marca todos os campos como tocados para mostrar todos os erros
        setTouched({
            nomeDocente: true,
            emailDocente: true,
            telefoneDocente: true,
            dataNascimento: true,
            selectedDisciplines: true
        });

        if (!isFormValid()) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente');
            return;
        }

        try {
            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];
            const phoneDigits = telefoneDocente.replace(/\D/g, '');

            const professorData = {
                nomeDocente: nomeDocente.trim(),
                dataNascimentoDocente: dataFormatada,
                emailDocente: emailDocente.trim().toLowerCase(),
                telefoneDocente: phoneDigits,
                disciplineId: selectedDisciplines,
            };

            await onCreate(professorData);
            resetForm();
        } catch (error) {
            let errorMessage = 'Erro ao cadastrar professor. Tente novamente mais tarde.';
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Dados inválidos. Verifique as informações.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Email já cadastrado para outro professor.';
                }
            }
            
            Alert.alert('Erro', errorMessage);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity 
                style={styles.modalContainer} 
                activeOpacity={1}
            >
                <Image
                    style={{ width: 327, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
                    source={require('../../assets/image/barraAzul.png')}
                />
                <View style={styles.modalContent}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={onClose}
                        disabled={isCreating}
                    >
                        <Icon name="x" size={30} color={isCreating ? '#CCC' : '#000'} />
                    </TouchableOpacity>

                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <TextInput
                            style={[styles.input, errors.nomeDocente && styles.inputError]}
                            placeholder="Nome Completo"
                            placeholderTextColor="#AAA"
                            value={nomeDocente}
                            onChangeText={setNomeDocente}
                            onBlur={() => handleBlur('nomeDocente')}
                            editable={!isCreating}
                        />
                        {errors.nomeDocente && <Text style={styles.errorText}>{errors.nomeDocente}</Text>}
                        
                        <TextInput
                            style={[styles.input, errors.emailDocente && styles.inputError]}
                            placeholder="Email"
                            placeholderTextColor="#AAA"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={emailDocente}
                            onChangeText={setEmailDocente}
                            onBlur={() => handleBlur('emailDocente')}
                            editable={!isCreating}
                        />
                        {errors.emailDocente && <Text style={styles.errorText}>{errors.emailDocente}</Text>}
                        
                        <TextInput
                            style={[styles.input, errors.telefoneDocente && styles.inputError]}
                            placeholder="Telefone (XX) XXXXX-XXXX"
                            placeholderTextColor="#AAA"
                            keyboardType="phone-pad"
                            value={telefoneDocente}
                            onChangeText={handlePhoneChange}
                            onBlur={() => handleBlur('telefoneDocente')}
                            editable={!isCreating}
                            maxLength={15}
                        />
                        {errors.telefoneDocente && <Text style={styles.errorText}>{errors.telefoneDocente}</Text>}

                        <Text style={styles.label}>Data de Nascimento</Text>
                        <View style={styles.dateContainer}>
                            <TextInput
                                style={[
                                    styles.input, 
                                    styles.dateInput,
                                    errors.dataNascimento && styles.inputError
                                ]}
                                placeholder="Selecione a data de nascimento"
                                placeholderTextColor="#666"
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

                        <Text style={styles.label}>Disciplinas</Text>
                        {errors.selectedDisciplines && (
                            <Text style={styles.errorText}>{errors.selectedDisciplines}</Text>
                        )}
                        {loadingDisciplines ? (
                            <ActivityIndicator size="small" color="#1A85FF" />
                        ) : (
                            <View style={styles.disciplinesContainer}>
                                {disciplines.map(discipline => (
                                    <TouchableOpacity
                                        key={discipline.id}
                                        style={[
                                            styles.disciplineItem,
                                            selectedDisciplines.includes(discipline.id) && styles.disciplineItemSelected,
                                            isCreating && styles.disabledItem
                                        ]}
                                        onPress={() => toggleDiscipline(discipline.id)}
                                        disabled={isCreating}
                                    >
                                        <Text style={styles.disciplineText}>{discipline.nomeDisciplina}</Text>
                                        {selectedDisciplines.includes(discipline.id) && (
                                            <Icon name="check" size={18} color="#1A85FF" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>

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
        width: '85%',
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        padding: 20,
        alignItems: 'center',
        maxHeight: '80%',
    },
    scrollContent: {
        width: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: -5,
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
    disciplinesContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
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
});