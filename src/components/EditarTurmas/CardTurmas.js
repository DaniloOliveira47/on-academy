import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../../path/ThemeContext';
import { Picker } from '@react-native-picker/picker';

export default function CardTurmas({ turma, alunos, periodo, numero, navegacao }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [editTurma, setEditTurma] = useState(turma);
    const [editAno, setEditAno] = useState("2025");
    const [editPeriodo, setEditPeriodo] = useState(periodo);
    const [editCapacidade, setEditCapacidade] = useState("35");
    const [editSala, setEditSala] = useState("01");

    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>            
            <View style={styles.linha}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: isDarkMode ? 'white' : 'black' }}>
                    {turma}
                </Text>
                <Text style={{ fontWeight: 'bold', color: isDarkMode ? 'white' : 'black' }}>
                    {numero}
                </Text>
            </View>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}> 
                {alunos}
            </Text>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}> 
                {periodo}
            </Text>
            
            <View style={styles.botoesContainer}>
                <TouchableOpacity onPress={() => navigation.navigate(navegacao)} style={styles.botao}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Visualizar Turma</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.iconeBotao}>
                    <Icon name="edit" size={20} color={isDarkMode ? 'white' : 'black'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconeBotao}>
                    <Icon name="trash" size={20} color={isDarkMode ? 'red' : 'darkred'} />
                </TouchableOpacity>
            </View>

            {/* Modal de Edição */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Turma</Text>
                        <ScrollView>
                            <Text>Nome da Turma</Text>
                            <TextInput style={styles.input} value={editTurma} onChangeText={setEditTurma} />
                            
                            <Text>Ano Letivo</Text>
                            <Picker
                                selectedValue={editAno}
                                style={styles.input}
                                onValueChange={(itemValue) => setEditAno(itemValue)}>
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                            </Picker>
                            
                            <Text>Período</Text>
                            <Picker
                                selectedValue={editPeriodo}
                                style={styles.input}
                                onValueChange={(itemValue) => setEditPeriodo(itemValue)}>
                                <Picker.Item label="Manhã" value="Manhã" />
                                <Picker.Item label="Tarde" value="Tarde" />
                                <Picker.Item label="Noite" value="Noite" />
                            </Picker>

                            <View style={styles.rowLabels}>
                                <Text>Capacidade Máxima</Text>
                                <Text>Nº da Sala</Text>
                            </View>
                            <View style={styles.rowInputs}>
                                <TextInput style={[styles.input, styles.smallInput]} value={editCapacidade} onChangeText={setEditCapacidade} keyboardType="numeric" />
                                <TextInput style={[styles.input, styles.smallInput]} value={editSala} onChangeText={setEditSala} keyboardType="numeric" />
                            </View>
                        </ScrollView>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.botaoSalvar}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Salvar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.botaoCancelar}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        padding: 10,
        borderRadius: 15,
        marginBottom: 40
    },
    botao: {
        backgroundColor: '#1A85FF',
        alignItems: 'center',
        padding: 6,
        borderRadius: 8,
        flex: 1
    },
    iconeBotao: {
        padding: 6,
        marginLeft: 10
    },
    subTexto: {
        fontWeight: 'bold'
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    botoesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        width: '90%',
        padding: 20,
        borderRadius: 10
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    input: {
        backgroundColor: '#F0F7FF',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10
    },
    rowLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rowInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    smallInput: {
        width: '48%'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 20
    },
    botaoSalvar: {
        backgroundColor: '#1A85FF',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'
    },
    botaoCancelar: {
        backgroundColor: '#D9534F',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'
    }
});  
