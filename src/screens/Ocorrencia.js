import React, { useState } from 'react'
import HeaderSimples from '../components/Gerais/HeaderSimples'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { useTheme } from '../path/ThemeContext'
import CardOcorrencia from '../components/Ocorrência/CardOcorrencia'

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState(" 1º Bim.");

    const tipos = ["Aproveitamento", "Comportamento", "Conselho", "Evasão", "Frequência", "Orientação", "Saúde Mental"];
    return (
        <View style={styles.tela}>
            <HeaderSimples
                titulo="FEEDBACK"
            />
            <View style={{ alignItems: 'center', marginTop: 50 }}>
                <View style={styles.botao}>
                    <Text style={styles.textoBotao}>Tipos de Feedback</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <View style={{
                            backgroundColor: '#0077FF',
                            padding: 10,
                            borderRadius: 20,
                            height: 28,
                            width: 28,
                            alignItems: 'center'
                        }}>
                            <Image style={styles.icone} source={require('../assets/image/OptionWhite.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.container}>
                <Image style={styles.barraAzul} source={require('../assets/image/barraAzul.png')} />
                <View style={styles.form}>
                    <View style={styles.perfil}>
                        <Image style={{ width: 70, height: 70, borderRadius: 50, borderWidth: 3, borderColor: 'white' }} source={require('../assets/image/perfil4x4.png')} />
                        <View style={styles.grupoText}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Renata Vieira</Text>
                            <Text style={{ color: '#8A8A8A' }}>revieira@gmail.com</Text>
                        </View>
                    </View>
                    <View style={styles.conteudo}>
                        <View style={styles.filtro}> 
                            <Text style={styles.filtroTexto}>
                                Ocorrência
                            </Text>
                            <Text style={styles.filtroTexto}>
                               Tipo
                            </Text>
                            <Text style={styles.filtroTexto}>
                                Orientador
                            </Text>
                            <Text style={styles.filtroTexto}>
                                Data
                            </Text>
                        </View>
                        <View>
                            <CardOcorrencia
                            ocorrencia= "Exemplo 1"
                            tipo="Todos"
                            orientador="João Silva"
                            data= "10/02/2025"
                            />
                            <CardOcorrencia
                             ocorrencia= "Exemplo 1"
                             tipo="Todos"
                             orientador="João Silva"
                             data= "10/02/2025"
                            />
                            <CardOcorrencia
                             ocorrencia= "Exemplo 1"
                             tipo="Todos"
                             orientador="João Silva"
                             data= "10/02/2025"
                            />
                            <CardOcorrencia
                             ocorrencia= "Exemplo 1"
                             tipo="Todos"
                             orientador="João Silva"
                             data= "10/02/2025"
                            />
                        </View>
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
        </View>
    )
}

const styles = StyleSheet.create({
    tela: {
        padding: 25
    },
    grupoText: {
        marginLeft: 5
    },
    filtro:{
        backgroundColor: '#8A8A8A',
        flexDirection: 'row',
        marginTop: 32,
        justifyContent: 'space-between',
        padding: 15,
        borderRadius: 7
    },
    filtroTexto: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    conteudo: {
        padding: 7
    },
    perfil: {
        position: 'absolute',
        flexDirection: 'row',
        marginTop: -35,
        marginLeft: 20,
        alignItems: 'center'
    },
    barraAzul: {
        width: '100%',
        borderTopRightRadius: 16,
        borderTopLeftRadius: 16,
        height: 60
    },
    form: {
        backgroundColor: 'white',
        height: 400,
        width: '100%'
    },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#073162',
        width: 350,
        padding: 10,
        borderRadius: 13,
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    textoBotao: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        marginRight: 10,
        fontWeight: 'bold'
    },
    icone: {
        width: 20,
        height: 12,
        marginTop: 0
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
})
