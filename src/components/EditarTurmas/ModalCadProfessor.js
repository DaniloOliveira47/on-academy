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
        }
    }, [visible]);

    const fetchDisciplines = async () => {
        try {
            setLoadingDisciplines(true);
            const token = await AsyncStorage.getItem('@user_token');
            const response = await axios.get('http://192.168.15.120:3000/api/discipline', {
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
        }
    };

    const toggleDiscipline = (disciplineId) => {
        if (isCreating) return;
        setSelectedDisciplines(prev => {
            if (prev.includes(disciplineId)) {
                return prev.filter(id => id !== disciplineId);
            } else {
                return [...prev, disciplineId];
            }
        });
    };

    const handleSubmit = async () => {
        if (selectedDisciplines.length === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos uma disciplina');
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
                        style={styles.input}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeDocente}
                        onChangeText={setNomeDocente}
                        editable={!isCreating}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        value={emailDocente}
                        onChangeText={setEmailDocente}
                        editable={!isCreating}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Telefone"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneDocente}
                        onChangeText={setTelefoneDocente}
                        editable={!isCreating}
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
                            onPress={() => !isCreating && setShowBirthDatePicker(true)}
                            disabled={isCreating}
                        >
                            <Icon name="calendar" size={24} color={isCreating ? '#CCC' : '#1A85FF'} />
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