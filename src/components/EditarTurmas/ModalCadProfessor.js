import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CadastroProfessorModal({ visible, onClose }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [nomeDocente, setNomeDocente] = useState('');
    const [emailDocente, setEmailDocente] = useState('');
    const [telefoneDocente, setTelefoneDocente] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
    const [disciplines, setDisciplines] = useState([]);
    const [selectedDisciplines, setSelectedDisciplines] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchDisciplines();
        }
    }, [visible]);

    const fetchDisciplines = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get('http://10.0.2.2:3000/api/discipline', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDisciplines(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Erro ao buscar disciplinas:', error);
            setLoading(false);
            Alert.alert('Erro', 'Não foi possível carregar as disciplinas');
        }
    };

   
    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
        }
    };

    const toggleDiscipline = (disciplineId) => {
        setSelectedDisciplines(prev => {
            if (prev.includes(disciplineId)) {
                return prev.filter(id => id !== disciplineId);
            } else {
                return [...prev, disciplineId];
            }
        });
    };

    const handleCadastrar = async () => {
        if (selectedDisciplines.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos uma disciplina');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];

            const professorData = {
                nomeDocente,
                dataNascimentoDocente: dataFormatada,
                emailDocente,
                telefoneDocente,
                disciplineId: selectedDisciplines,
            };

            console.log('Dados do professor a serem enviados:', professorData);

            const response = await axios.post('http://10.0.2.2:3000/api/teacher', professorData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 201) {
                Alert.alert('Sucesso', 'Professor cadastrado com sucesso!');
                // Limpar os campos após o cadastro
                setNomeDocente('');
                setEmailDocente('');
                setTelefoneDocente('');
                setDataNascimento('');
                setSelectedBirthDate(new Date());
                setSelectedImage(null);
                setSelectedDisciplines([]);
                onClose();
            }
        } catch (error) {
            console.error('Erro ao cadastrar professor:', error.response ? error.response.data : error.message);
            Alert.alert('Erro', 'Erro ao cadastrar professor. Tente novamente.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity style={styles.modalContainer} onPress={onClose} activeOpacity={1}>
                <Image
                    style={{ width: 350, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
                    source={require('../../assets/image/barraAzul.png')}
                />
                <View style={styles.modalContent}>
                    {/* Botão de Fechar */}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="x" size={30} color="#000" />
                    </TouchableOpacity>


                    <TextInput
                        style={styles.input}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeDocente}
                        onChangeText={setNomeDocente}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        value={emailDocente}
                        onChangeText={setEmailDocente}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Telefone"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneDocente}
                        onChangeText={setTelefoneDocente}
                    />

                    <Text style={styles.label}>Data de Nascimento</Text>
                    <View style={styles.dateContainer}>
                        <TextInput
                            style={[styles.input, styles.dateInput]}
                            placeholder="Selecione a data de nascimento"
                            placeholderTextColor="#666"
                            value={dataNascimento}
                            editable={false}
                        />
                        <TouchableOpacity
                            style={styles.dateIconButton}
                            onPress={() => setShowBirthDatePicker(true)}
                        >
                            <Icon name="calendar" size={24} color="#1A85FF" />
                        </TouchableOpacity>
                    </View>
                    {showBirthDatePicker && (
                        <DateTimePicker
                            value={selectedBirthDate}
                            mode="date"
                            display="default"
                            onChange={handleBirthDateChange}
                        />
                    )}

                    <Text style={styles.label}>Disciplinas</Text>
                    {loading ? (
                        <Text>Carregando disciplinas...</Text>
                    ) : (
                        <ScrollView style={styles.disciplinesContainer} contentContainerStyle={styles.disciplinesContent}>
                            {disciplines.map(discipline => (
                                <TouchableOpacity
                                    key={discipline.id}
                                    style={[
                                        styles.disciplineItem,
                                        selectedDisciplines.includes(discipline.id) && styles.disciplineItemSelected
                                    ]}
                                    onPress={() => toggleDiscipline(discipline.id)}
                                >
                                    <Text style={styles.disciplineText}>{discipline.nomeDisciplina}</Text>
                                    {selectedDisciplines.includes(discipline.id) && (
                                        <Icon name="check" size={18} color="#1A85FF" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <TouchableOpacity style={styles.saveButton} onPress={handleCadastrar}>
                        <Text style={styles.saveButtonText}>Salvar Professor</Text>
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
        top: 20,
        right: 20,
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    imageText: {
        fontSize: 14,
        color: '#1A85FF',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#F0F7FF',
        borderRadius: 8,
        paddingHorizontal: 10,
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
        marginBottom: 15,
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
        marginBottom: 15,
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
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});