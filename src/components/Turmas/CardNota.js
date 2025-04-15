import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';

export default function CardNota({ nota: initialNota, notaId, alunoId, disciplinaId, bimestre, onNotaUpdated }) {
    const { isDarkMode } = useTheme();
    const [editing, setEditing] = useState(false);
    const [nota, setNota] = useState(initialNota);
    const [tempNota, setTempNota] = useState(initialNota);
    
    const backgroundColor = isDarkMode ? '#000' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const inputBackground = isDarkMode ? '#333' : '#FFF';

    const handleEditPress = () => {
        setTempNota(nota);
        setEditing(true);
    };

    const handleSave = async () => {
        if (tempNota === nota) {
            setEditing(false);
            return;
        }


        try {
            // Atualizar no backend
            await axios.put(`http://10.0.2.2:3000/api/note/${notaId}`, {
                valorNota: parseFloat(tempNota),
                studentId: alunoId,
                disciplineId: disciplinaId,
                bimestre: bimestre
            });

            // Atualizar no estado local
            setNota(tempNota);
            setEditing(false);
            
            // Notificar o componente pai sobre a atualização
            if (onNotaUpdated) {
                onNotaUpdated(parseFloat(tempNota));
            }

            Alert.alert('Sucesso', 'Nota atualizada com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar nota:', error);
            Alert.alert('Erro', 'Não foi possível atualizar a nota. Tente novamente.');
        }
    };

    const handleCancel = () => {
        setTempNota(nota);
        setEditing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {editing ? (
                <View style={styles.editContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            { 
                                color: textColor,
                                backgroundColor: inputBackground
                            }
                        ]}
                        value={tempNota}
                        onChangeText={setTempNota}
                        keyboardType="numeric"
                        autoFocus
                    />
                    <View style={styles.editButtons}>
                        <TouchableOpacity onPress={handleSave}>
                            <Icon name="check" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancel}>
                            <Icon name="x" size={20} color="#F44336" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <TouchableOpacity 
                    style={styles.notaContainer}
                    onLongPress={handleEditPress}
                    activeOpacity={0.7}
                >
                    <Text style={{ color: textColor, fontSize: 14, fontWeight: 'bold' }}>
                        {nota}
                    </Text>
                    {nota !== '-' && (
                        <Icon 
                            name="edit-2" 
                            size={14} 
                            color={textColor} 
                            style={styles.editIcon}
                        />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        alignItems: 'center',
        padding: 12,
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
        height: 30,
        borderWidth: 1,
        borderColor: '#1A85FF',
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