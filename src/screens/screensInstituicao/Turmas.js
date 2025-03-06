import React, { useState } from 'react'
import { StyleSheet, View, Modal, TouchableOpacity, Text, ScrollView } from 'react-native'
import HeaderSimples from '../../components/Gerais/HeaderSimples'
import { TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/Feather'
import CardTurmas from '../../components/EditarTurmas/CardTurmas'
import { useTheme } from '../../path/ThemeContext'
import { Picker } from '@react-native-picker/picker'
import CardSelecao from '../../components/Turmas/CardSelecao'

export default function Turmas() {
    const { isDarkMode } = useTheme()
    const [modalCriarVisible, setModalCriarVisible] = useState(false)
    const [novaTurma, setNovaTurma] = useState('')
    const [novoAno, setNovoAno] = useState('2025')
    const [novoPeriodo, setNovoPeriodo] = useState('Manhã')
    const [novaCapacidade, setNovaCapacidade] = useState('')
    const [novaSala, setNovaSala] = useState('')
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);

    return (
        <View style={{ backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', flex: 1 }}>
            <HeaderSimples titulo="TURMAS" />

            <View style={styles.subTela}>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#000000' : 'white' }]}>
                        <TextInput
                            style={[styles.input, { color: isDarkMode ? 'white' : '#333' }]}
                            placeholder="Digite o nome ou código da turma"
                            placeholderTextColor="#756262"
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>

                    <View style={styles.cards}>
                        <CardTurmas
                            turma="Turma A - 1º Ano"
                            numero="Nº0231000"
                            alunos="30 Alunos ativos"
                            periodo="Período: Manhã"
                            navegacao="NotasTurma"
                        />
                        <CardTurmas
                            turma="Turma B - 2º Ano"
                            numero="Nº0231000"
                            alunos="28 Alunos ativos"
                            periodo="Período: Tarde"
                            navegacao="Alunos"
                        />
                        <CardTurmas
                            turma="Turma C - 3º Ano"
                            numero="Nº0231000"
                            alunos="35 Alunos ativos"
                            periodo="Período: Noite"
                            navegacao="Alunos"
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>
                        <TouchableOpacity
                            style={styles.botaoCriar}
                            onPress={() => setModalCriarVisible(true)}>
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.selecao}>
                            {[1, 2, 3, '>'].map((numero, index) => (
                                <CardSelecao
                                    key={index}
                                    numero={numero}
                                    selecionado={paginaSelecionada === numero}
                                    onPress={() => setPaginaSelecionada(numero)}
                                />
                            ))}
                        </View>

                    </View>
                </View>
            </View>


            <Modal visible={modalCriarVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#141414' : 'white' }]}>
                        <Text style={[styles.modalTitle, { color: isDarkMode ? 'white' : 'black' }]}>Criar Nova Turma</Text>

                        <ScrollView>
                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Nome da Turma</Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    {
                                        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                        color: isDarkMode ? 'white' : 'black'
                                    }
                                ]}
                                value={novaTurma}
                                onChangeText={setNovaTurma}
                                placeholder="Digite o nome da turma"
                                placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                            />

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Ano Letivo</Text>
                            <Picker
                                selectedValue={novoAno}
                                style={[
                                    styles.modalInput,
                                    {
                                        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                        color: isDarkMode ? 'white' : 'black'
                                    }
                                ]}
                                onValueChange={(itemValue) => setNovoAno(itemValue)}>
                                <Picker.Item label="2024" value="2024" />
                                <Picker.Item label="2025" value="2025" />
                                <Picker.Item label="2026" value="2026" />
                            </Picker>

                            <Text style={{ color: isDarkMode ? 'white' : 'black', marginBottom: 5 }}>Período</Text>
                            <Picker
                                selectedValue={novoPeriodo}
                                style={[
                                    styles.modalInput,
                                    {
                                        backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                        color: isDarkMode ? 'white' : 'black'
                                    }
                                ]}
                                onValueChange={(itemValue) => setNovoPeriodo(itemValue)}>
                                <Picker.Item label="Manhã" value="Manhã" />
                                <Picker.Item label="Tarde" value="Tarde" />
                                <Picker.Item label="Noite" value="Noite" />
                            </Picker>

                            <View style={styles.rowLabels}>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Capacidade Máxima</Text>
                                <Text style={{ color: isDarkMode ? 'white' : 'black' }}>Nº da Sala</Text>
                            </View>
                            <View style={styles.rowInputs}>
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        styles.smallInput,
                                        {
                                            backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                            color: isDarkMode ? 'white' : 'black'
                                        }
                                    ]}
                                    value={novaCapacidade}
                                    onChangeText={setNovaCapacidade}
                                    keyboardType="numeric"
                                    placeholder="Ex: 35"
                                    placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                />
                                <TextInput
                                    style={[
                                        styles.modalInput,
                                        styles.smallInput,
                                        {
                                            backgroundColor: isDarkMode ? '#333' : '#F0F7FF',
                                            color: isDarkMode ? 'white' : 'black'
                                        }
                                    ]}
                                    value={novaSala}
                                    onChangeText={setNovaSala}
                                    keyboardType="numeric"
                                    placeholder="Ex: 101"
                                    placeholderTextColor={isDarkMode ? '#888' : '#756262'}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.botaoAcao, { backgroundColor: '#D9534F' }]}
                                onPress={() => setModalCriarVisible(false)}>
                                <Text style={styles.textoBotao}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.botaoAcao, { backgroundColor: '#1A85FF' }]}
                                onPress={() => {

                                    setModalCriarVisible(false)
                                }}>
                                <Text style={styles.textoBotao}>Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    subTela: {
        padding: 10,
        paddingTop: 10,
        flex: 1
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 0,
    },
    container: {
        width: '100%',
        borderRadius: 16,
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginBottom: 15
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
    icon: {
        marginLeft: 10
    },
    cards: {
        width: '100%',
        padding: 5
    },
    botaoCriar: {
        backgroundColor: '#1A85FF',
        width: 56,
        height: 56,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 15,
        padding: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalInput: {
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    rowLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5
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
        marginTop: 15
    },
    botaoAcao: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5
    },
    textoBotao: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
})