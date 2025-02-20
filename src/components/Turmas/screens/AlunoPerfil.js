import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, FlatList } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

export default function AlunoPerfil() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

    const tipos = ["Aproveitamento", "Comportamento", "Conselho", "Evasão", "Frequência", "Orientação", "Saúde Mental"];
    const ocorrencias = [
        { id: '1', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '2', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '3', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
        { id: '4', ocorrencia: 'Exemplo 1', tipo: 'All', orientador: 'João Silva', data: '10/02/2025' },
    ];

    return (
        <ScrollView style={{marginBottom: 40}}>
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <HeaderSimples titulo="PERFIL" />
                <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor, marginTop: 30 }]} source={require('../../../assets/image/barraAzul.png')} />
                <View style={[styles.form, {
                    backgroundColor: formBackgroundColor, shadowColor: isDarkMode ? '#FFF' : '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }]}>
                    <View style={styles.linhaUser}>
                        <Image source={require('../../../assets/image/Perfill.png')} />
                        <View style={styles.name}>
                            <Text style={[styles.nome, { color: textColor }]}>Renata Vieira</Text>
                            <Text style={[styles.email, { color: textColor }]}>revieira@gmail.com</Text>
                        </View>
                    </View>
                    <Campo label="Nome Completo" text="Renata Vieira de Souza" textColor={textColor} />
                    <Campo label="Email" text="revieira@gmail.com" textColor={textColor} />
                    <Campo label="Nº Matrícula" text="1106434448-1" textColor={textColor} />
                    <View style={styles.doubleCampo}>
                        <Campo label="Telefone" text="(11) 95312-8203" textColor={textColor} />
                        <Campo label="Data de Nascimento" text="23/01/2006" textColor={textColor} />
                    </View>
                    <Campo label="Turma" text="3 º A" textColor={textColor} />
                </View>
                <View style={{ backgroundColor: 'white', width: '100%', height: 'auto', marginTop: 30, padding: 10, borderRadius: 20 }}>
                    <View style={{ width: '100%' }}>
                        <View style={{ alignItems: 'flex-end', width: '100%', marginTop: 0 }}>
                            <View style={styles.botao}>
                                <Text style={styles.textoBotao}>Tipo de Feedback</Text>
                                <TouchableOpacity onPress={() => setModalVisible(true)}>
                                    <View style={{
                                        backgroundColor: '#0077FF',
                                        padding: 10,
                                        borderRadius: 20,
                                        height: 24,
                                        width: 24,
                                        alignItems: 'center'
                                    }}>
                                        <Image style={styles.icone} source={require('../../../assets/image/OptionWhite.png')} />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <View style={styles.tabelaContainer}>
                        <View style={styles.tabelaHeader}>
                            <Text style={styles.headerText}>Ocorrência</Text>
                            <Text style={styles.headerText}>Tipo</Text>
                            <Text style={styles.headerText}>Orientador</Text>
                            <Text style={styles.headerText}>Data</Text>
                        </View>
                        {ocorrencias.map((item) => (
                            <View key={item.id} style={styles.tabelaLinha}>
                                <Text style={styles.linhaTexto}>{item.ocorrencia}</Text>
                                <Text style={styles.linhaTexto}>{item.tipo}</Text>
                                <Text style={styles.linhaTexto}>{item.orientador}</Text>
                                <Text style={styles.linhaTexto}>{item.data}</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginTop: 15, marginBottom: 13 }}>
                        Adicionar Feedback para o aluno
                    </Text>
                    <TextInput
                        placeholder='Escreva seu Feedback...'
                        style={{ backgroundColor: '#EAF4FF', width: '80%', borderRadius: 15, padding: 20 }} />
                    <View style={{ marginTop: 20 }}>
                        <View style={styles.botao}>
                            <Text style={styles.textoBotao}>Tipo de Feedback</Text>
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <View style={{
                                    backgroundColor: '#0077FF',
                                    padding: 10,
                                    borderRadius: 20,
                                    height: 24,
                                    width: 24,
                                    alignItems: 'center'
                                }}>
                                    <Image style={styles.icone} source={require('../../../assets/image/OptionWhite.png')} />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 30 }}>
                        <TouchableOpacity style={{ backgroundColor: 'red', padding: 8, borderRadius: 8, width: 90, alignItems: 'center' }}>
                            <Text style={{ color: 'white' }}>
                                Cancelar
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ backgroundColor: '#0077FF', padding: 8, borderRadius: 8, width: 90, alignItems: 'center' }}>
                            <Text style={{ color: 'white' }}>
                                Enviar
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>


            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
                        <FlatList
                            data={tipos}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setTipoSelecionado(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        padding: 15,
        width: '100%',
        height: '100%',
    },
    conText: {
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 40,
    },

    titulo: {
        fontWeight: 'bold',
        fontSize: 24,
    },
    subTitulo: {
        fontWeight: 'bold',
    },
    barraAzul: {
        width: 382,
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        marginTop: 25,
    },
    form: {
        padding: 25,
    },
    linhaUser: {
        flexDirection: 'row',
        gap: 10,
    },
    name: {
        marginTop: 15,
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 15,
    },
    doubleCampo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    botao: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        width: 180,
        padding: 10,
        borderRadius: 13,
        justifyContent: 'space-between',
        gap: 0,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#0077FF'
    },
    textoBotao: {
        color: 'black',
        textAlign: 'center',
        fontSize: 15,
        marginRight: 10,
        fontWeight: 'bold'
    },
    icone: {
        width: 16,
        height: 9,
        marginTop: -1
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
    },
    modalItem: {
        paddingVertical: 15,
        width: '100%',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    modalText: {
        fontSize: 18,
    },
    container: {
        width: '100%',
        alignItems: 'center'
    },
    tabelaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F0F7FF',
        padding: 8,
        marginBottom: 5,
        fontWeight: 'bold',
        borderRadius: 10
    },
    tabelaLinha: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 5,
        marginBottom: 20
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    linhaTexto: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    tabelaContainer: {
        borderBottomWidth: 2,

    }
});
