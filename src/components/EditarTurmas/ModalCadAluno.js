import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CadastroAlunoModal({ visible, onClose, turmaId }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [nomeAluno, setNomeAluno] = useState('');
    const [emailAluno, setEmailAluno] = useState('');
    const [telefoneAluno, setTelefoneAluno] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [selectedBirthDate, setSelectedBirthDate] = useState(new Date());
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleBirthDateChange = (event, date) => {
        setShowBirthDatePicker(false);
        if (date) {
            setSelectedBirthDate(date);
            setDataNascimento(date.toLocaleDateString('pt-BR'));
        }
    };

    const handleCadastrar = async () => {
        try {
            const token = await AsyncStorage.getItem('@user_token');
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            const dataFormatada = selectedBirthDate.toISOString().split('T')[0];

            const alunoData = {
                nomeAluno,
                dataNascimentoAluno: dataFormatada,
                emailAluno,
                telefoneAluno,
                turmaId,
            };

            console.log('Dados do aluno a serem enviados:', alunoData); // Debug

            const response = await axios.post('http://10.0.2.2:3000/api/student', alunoData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log('Resposta da API:', response.data); // Debug

            if (response.status === 201) {
                Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!');
                onClose();
            }
        } catch (error) {
            console.error('Erro ao cadastrar aluno:', error.response ? error.response.data : error.message); // Debug
            Alert.alert('Erro', 'Erro ao cadastrar aluno. Tente novamente.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableOpacity style={styles.modalContainer}>
                <Image
                    style={{ width: 350, borderTopRightRadius: 10, borderTopLeftRadius: 10 }}
                    source={require('../../assets/image/barraAzul.png')}
                />
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Icon name="x" size={30} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                        {selectedImage ? (
                            <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                        ) : (
                            <Icon name="camera" size={50} color="#1A85FF" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.imageText}>Adicionar Imagem</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nome Completo"
                        placeholderTextColor="#AAA"
                        value={nomeAluno}
                        onChangeText={setNomeAluno}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#AAA"
                        keyboardType="email-address"
                        value={emailAluno}
                        onChangeText={setEmailAluno}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Telefone"
                        placeholderTextColor="#AAA"
                        keyboardType="phone-pad"
                        value={telefoneAluno}
                        onChangeText={setTelefoneAluno}
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

                    <TouchableOpacity style={styles.saveButton} onPress={handleCadastrar}>
                        <Text style={styles.saveButtonText}>Salvar Aluno</Text>
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
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});