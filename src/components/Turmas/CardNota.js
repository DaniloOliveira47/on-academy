import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import CustomAlert from '../Gerais/CustomAlert';

export default function CardNota({
    nota: initialNota,
    notaId,
    alunoId,
    disciplinaId,
    bimestre,
    editable = true,  // Nova prop para controlar se a nota pode ser editada
    onNotaUpdated
}) {
    const { isDarkMode } = useTheme();
    const [editing, setEditing] = useState(false);
    const [nota, setNota] = useState(initialNota);
    const [tempNota, setTempNota] = useState(initialNota);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const backgroundColor = isDarkMode ? '#000' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const inputBackground = isDarkMode ? '#333' : '#FFF';
    const borderColor = isDarkMode ? '#444' : '#1A85FF';

    const handleEditPress = () => {
        if (!editable) {
            Alert.alert('Aviso', 'Você não tem permissão para editar notas desta disciplina');
            return;
        }

        if (nota === '-') {
            Alert.alert('Aviso', 'Não é possível editar uma nota que não existe. Adicione uma nota primeiro.');
            return;
        }

        setTempNota(nota);
        setEditing(true);
    };

    const handleSave = async () => {
        if (!editable) return;

        if (tempNota === nota) {
            setEditing(false);
            return;
        }

        if (!tempNota || tempNota.trim().length === 0) {
            setAlertTitle('Campo vazio');
            setAlertMessage('Por favor, insira uma nota.');
            setAlertVisible(true);
            return;
        }

        if (tempNota.length > 2) {
            setAlertTitle('Nota inválida');
            setAlertMessage('A nota não pode ter mais de 2 caracteres.');
            setAlertVisible(true);
            return;
        }

        const novaNota = parseFloat(tempNota.replace(',', '.'));

        if (isNaN(novaNota)) {
            setAlertTitle('Formato inválido');
            setAlertMessage('Por favor, insira um valor numérico válido.');
            setAlertVisible(true);
            return;
        }

        if (novaNota < 0 || novaNota > 10) {
            setAlertTitle('Nota fora do intervalo');
            setAlertMessage('A nota deve estar entre 0 e 10.');
            setAlertVisible(true);
            return;
        }

        try {
            await axios.put(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/note/${notaId}`, {
                nota: novaNota,
                bimestre: bimestre,
                disciplineId: disciplinaId,
                studentId: alunoId
            });

            setNota(tempNota);
            setEditing(false);

            if (onNotaUpdated) {
                onNotaUpdated(novaNota);
            }

            setAlertTitle('Sucesso');
            setAlertMessage('Nota atualizada com sucesso!');
            setAlertVisible(true);

        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            setAlertTitle('Erro');
            setAlertMessage('Não foi possível atualizar a nota. Tente novamente.');
            setAlertVisible(true);
        }
    };

    const handleCancel = () => {
        setTempNota(nota);
        setEditing(false);
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor,
                borderColor,
                padding: editing ? 3 : 12,
                borderWidth: nota !== '-' && editable ? 1 : 0, // Mostra borda apenas se for editável e tiver nota
            }
        ]}>
            {editing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: textColor,
                                backgroundColor: inputBackground,
                                borderColor
                            }
                        ]}
                        value={tempNota}
                        onChangeText={setTempNota}
                        keyboardType="numeric"
                        autoFocus
                        editable={editable}
                    />
                    <View style={styles.editButtons}>
                        <TouchableOpacity onPress={handleSave} disabled={!editable}>
                            <Icon name="check" size={20} color={editable ? "#4CAF50" : "#888"} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancel}>
                            <Icon name="x" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.notaContainer}>
                    <Text style={{
                        color: nota === '-' ? '#888' : textColor,
                        fontSize: 14,
                        fontWeight: nota === '-' ? 'normal' : 'bold'
                    }}>
                        {nota}
                    </Text>
                    {nota !== '-' && editable && ( // Mostra ícone de edição apenas se for editável
                        <TouchableOpacity onPress={handleEditPress}>
                            <Icon
                                name="edit-2"
                                size={14}
                                color={textColor}
                                style={styles.editIcon}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onDismiss={() => setAlertVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
        borderRadius: 8,
    },
    notaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        width: 50,
        height: 38,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 8,
        marginRight: 5,
        textAlign: 'center',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 5,
    },
    editIcon: {
        marginLeft: 5,
    },
});