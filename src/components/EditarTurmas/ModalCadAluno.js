import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CadastroAlunoModal({ visible, onClose, turmaId, isCreating, onCreate }) {
    const [nomeAluno, setNomeAluno] = useState('');
    const [emailAluno, setEmailAluno] = useState('');
    const [telefoneAluno, setTelefoneAluno] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validação em tempo real
    useEffect(() => {
        const validationErrors = {};
        
        if (touched.nomeAluno && !nomeAluno.trim()) {
            validationErrors.nomeAluno = 'Nome é obrigatório';
        } else if (nomeAluno.length > 0 && nomeAluno.length < 3) {
            validationErrors.nomeAluno = 'Nome muito curto';
        }
        
        if (touched.emailAluno && !emailAluno) {
            validationErrors.emailAluno = 'Email é obrigatório';
        } else if (touched.emailAluno && !/\S+@\S+\.\S+/.test(emailAluno)) {
            validationErrors.emailAluno = 'Email inválido';
        }
        
        if (touched.telefoneAluno && !telefoneAluno) {
            validationErrors.telefoneAluno = 'Telefone é obrigatório';
        } else if (telefoneAluno && !/^[0-9]{10,11}$/.test(telefoneAluno.replace(/\D/g, ''))) {
            validationErrors.telefoneAluno = 'Telefone inválido (10 ou 11 dígitos)';
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

    const handleCadastrar = async () => {
        // Marca todos os campos como tocados para mostrar todos os erros
        setTouched({
            nomeAluno: true,
            emailAluno: true,
            telefoneAluno: true,
            dataNascimento: true
        });

        // Verifica se há erros
        if (Object.keys(errors).length > 0 || 
            !nomeAluno || 
            !emailAluno || 
            !telefoneAluno || 
            !dataNascimento) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos corretamente');
            return;
        }

        try {
            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];
            const phoneDigits = telefoneAluno.replace(/\D/g, '');

            const alunoData = {
                nomeAluno: nomeAluno.trim(),
                dataNascimentoAluno: dataFormatada,
                emailAluno: emailAluno.trim().toLowerCase(),
                telefoneAluno: phoneDigits,
                turmaId,
            };

            await onCreate(alunoData);
            
            // Limpa o formulário após cadastro bem-sucedido
            setNomeAluno('');
            setEmailAluno('');
            setTelefoneAluno('');
            setDataNascimento('');
            setSelectedBirthDate(new Date());
            setTouched({});
        } catch (error) {
            let errorMessage = 'Erro ao cadastrar aluno. Tente novamente mais tarde.';
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Dados inválidos. Verifique as informações.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Email já cadastrado para outro aluno.';
                }
            }
            
            Alert.alert('Erro', errorMessage);
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
                        style={[styles.input, errors.nomeAluno && styles.inputError]}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeAluno}
                        onChangeText={setNomeAluno}
                        onBlur={() => handleBlur('nomeAluno')}
                        editable={!isCreating}
                    />
                    {errors.nomeAluno && <Text style={styles.errorText}>{errors.nomeAluno}</Text>}
                    
                    <TextInput
                        style={[styles.input, errors.emailAluno && styles.inputError]}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={emailAluno}
                        onChangeText={setEmailAluno}
                        onBlur={() => handleBlur('emailAluno')}
                        editable={!isCreating}
                    />
                    {errors.emailAluno && <Text style={styles.errorText}>{errors.emailAluno}</Text>}
                    
                    <TextInput
                        style={[styles.input, errors.telefoneAluno && styles.inputError]}
                        placeholder="Telefone (XX) XXXXX-XXXX"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneAluno}
                        onChangeText={handlePhoneChange}
                        onBlur={() => handleBlur('telefoneAluno')}
                        editable={!isCreating}
                        maxLength={15}
                    />
                    {errors.telefoneAluno && <Text style={styles.errorText}>{errors.telefoneAluno}</Text>}

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
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
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
});