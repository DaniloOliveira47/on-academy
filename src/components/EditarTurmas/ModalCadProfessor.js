import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
            // Limpa os campos quando o modal é aberto
            setNomeDocente('');
            setEmailDocente('');
            setTelefoneDocente('');
            setDataNascimento('');
            setSelectedBirthDate(new Date());
            setSelectedDisciplines([]);
            setErrors({
                nomeDocente: '',
                emailDocente: '',
                telefoneDocente: '',
                dataNascimento: '',
                disciplines: ''
            });
        }
    }, [visible]);

    const fetchDisciplines = async () => {
        try {
            setLoadingDisciplines(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get('http://192.168.2.11:3000/api/discipline', {
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

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
            setErrors(prev => ({...prev, dataNascimento: ''}));
        }
    };

    const toggleDiscipline = (disciplineId) => {
        if (isCreating) return;
        setSelectedDisciplines(prev => {
            const newSelection = prev.includes(disciplineId)
                ? prev.filter(id => id !== disciplineId)
                : [...prev, disciplineId];
            
            if (newSelection.length > 0) {
                setErrors(prev => ({...prev, disciplines: ''}));
            }
            
            return newSelection;
        });
    };

    const formatPhoneNumber = (input) => {
        // Remove tudo que não é dígito
        const cleaned = input.replace(/\D/g, '');
        
        // Limita a 11 caracteres (DDD + 9 dígitos)
        const limited = cleaned.slice(0, 11);
        
        // Aplica a formatação
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
            setErrors(prev => ({...prev, telefoneDocente: ''}));
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
        };

        await onCreate(professorData);
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

                    <TextInput
                        style={[styles.input, errors.nomeDocente && styles.inputError]}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeDocente}
                        onChangeText={(text) => {
                            setNomeDocente(text);
                            if (text.trim()) {
                                setErrors(prev => ({...prev, nomeDocente: ''}));
                            }
                        }}
                        editable={!isCreating}
                    />
                    {errors.nomeDocente ? <Text style={styles.errorText}>{errors.nomeDocente}</Text> : null}

                    <TextInput
                        style={[styles.input, errors.emailDocente && styles.inputError]}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailDocente}
                        onChangeText={(text) => {
                            setEmailDocente(text);
                            if (text.trim()) {
                                setErrors(prev => ({...prev, emailDocente: ''}));
                            }
                        }}
                        editable={!isCreating}
                    />
                    {errors.emailDocente ? <Text style={styles.errorText}>{errors.emailDocente}</Text> : null}

                    <TextInput
                        style={[styles.input, errors.telefoneDocente && styles.inputError]}
                        placeholder="Telefone (DDD) + número"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneDocente}
                        onChangeText={handlePhoneChange}
                        editable={!isCreating}
                        maxLength={15} // (XX) XXXXX-XXXX
                    />
                    {errors.telefoneDocente ? <Text style={styles.errorText}>{errors.telefoneDocente}</Text> : null}

                    <Text style={styles.label}>Data de Nascimento</Text>
                    <View style={styles.dateContainer}>
                        <TextInput
                            style={[styles.input, styles.dateInput, errors.dataNascimento && styles.inputError]}
                            placeholder="Selecione a data de nascimento"
                            placeholderTextColor="#666"
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
                            display="default"
                            onChange={handleBirthDateChange}
                            maximumDate={new Date()}
                        />
                    )}

                    <Text style={styles.label}>Disciplinas</Text>
                    {errors.disciplines ? <Text style={styles.errorText}>{errors.disciplines}</Text> : null}
                    {loadingDisciplines ? (
                        <ActivityIndicator size="small" color="#1A85FF" />
                    ) : (
                        <ScrollView style={styles.disciplinesContainer} contentContainerStyle={styles.disciplinesContent}>
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
});