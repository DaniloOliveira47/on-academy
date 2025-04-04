import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CadastroAlunoModal({ visible, onClose, turmaId, isCreating, onCreate }) {
    const [nomeAluno, setNomeAluno] = useState('');
    const [emailAluno, setEmailAluno] = useState('');
    const [telefoneAluno, setTelefoneAluno] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
        }
    };

    const handleCadastrar = async () => {
        try {
            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];

            const alunoData = {
                nomeAluno,
                dataNascimentoAluno: dataFormatada,
                emailAluno,
                telefoneAluno,
                turmaId,
            };

            await onCreate(alunoData);
        } catch (error) {
            console.error('Erro ao cadastrar aluno:', error.response ? error.response.data : error.message);
            Alert.alert('Erro', 'Erro ao cadastrar aluno. Tente novamente.');
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
                    
                    {/* Static profile image instead of image picker */}
                   
                    <TextInput
                        style={styles.input}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeAluno}
                        onChangeText={setNomeAluno}
                        editable={!isCreating}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        value={emailAluno}
                        onChangeText={setEmailAluno}
                        editable={!isCreating}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Telefone"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneAluno}
                        onChangeText={setTelefoneAluno}
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

                    <TouchableOpacity 
                        style={[
                            styles.saveButton,
                            isCreating && styles.saveButtonDisabled
                        ]} 
                        onPress={handleCadastrar}
                        disabled={isCreating}
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
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
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