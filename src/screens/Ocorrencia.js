import React, { useState } from 'react'
import HeaderSimples from '../components/Gerais/HeaderSimples'
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { Modal } from 'react-native'
import { useTheme } from '../path/ThemeContext'
import CardOcorrencia from '../components/Ocorrência/CardOcorrencia'
import CardProfessor from '../components/Ocorrência/CardProfessor'

export default function Ocorrencia() {
    const { isDarkMode } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [tipoSelecionado, setTipoSelecionado] = useState(" 1º Bim.");

    const tipos = ["Aproveitamento", "Comportamento", "Conselho", "Evasão", "Frequência", "Orientação", "Saúde Mental"];
    return (
        <ScrollView>


            <View style={styles.tela}>
                <HeaderSimples
                    titulo="FEEDBACK"
                />
                <View style={{ alignItems: 'center', marginTop: 50 }}>
                    <View style={styles.botao}>
                        <Text style={styles.textoBotao}>Tipos de Feedback</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <View style={{
                                backgroundColor: '#073162',
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

                            <View style={styles.headerTabela}>
                                <Text style={styles.headerTexto}>Ocorrência</Text>
                                <Text style={styles.headerTexto}>Tipo</Text>
                                <Text style={styles.headerTexto}>Orientador</Text>
                                <Text style={styles.headerTexto}>Data</Text>
                            </View>


                            <View>
                                <CardOcorrencia ocorrencia="Exemplo 1" tipo="Todos" orientador="João Silva" data="10/02/2025" />
                                <CardOcorrencia ocorrencia="Exemplo 2" tipo="Frequência" orientador="Maria Souza" data="12/02/2025" />
                                <CardOcorrencia ocorrencia="Exemplo 3" tipo="Saúde Mental" orientador="Carlos Lima" data="15/02/2025" />
                                <CardOcorrencia ocorrencia="Exemplo 4" tipo="Comportamento" orientador="Ana Ribeiro" data="18/02/2025" />
                            </View>
                        </View>

                    </View>
                </View>
                <View style={styles.container2}>


                    <Text style={{ marginTop: 5, fontSize: 18, color: '#0077FF', fontWeight: 'bold' }}>
                        A importância do seu Feedback
                    </Text>
                    <View style={{ width: '100%', paddingVertical: 8 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                            O feedback dos alunos é essencial para aprimorar a qualidade do ensino. Aqui, você pode compartilhar sua experiência em sala de aula, destacando o que está funcionando bem e o que pode ser melhorado.
                        </Text>
                        <Text style={{ fontWeight: 'bold', marginTop: 7, fontSize: 15 }}>
                            Seus comentários ajudam os professores a ajustar métodos de ensino, tornando as aulas mais dinâmicas e eficazes. Seja claro e respeitoso em suas respostas, pois sua opinião contribui para um ambiente de aprendizado cada vez melhor para todos!
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                        <CardProfessor />
                        <CardProfessor />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 20, marginBottom: 20 }}>
                        <TextInput style={{ backgroundColor: '#F0F7FF', borderRadius: 10, width: 260, fontSize: 11 }}
                            placeholder='Escreva aqui seu feedback para o prof(a) Karla Dias'
                        />
                        <TouchableOpacity style={{ backgroundColor: '#0077FF', padding: 7, borderRadius: 10 }}>
                            <Text style={{ color: 'white' }}>
                                Enviar
                            </Text>
                        </TouchableOpacity>
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
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    tela: {
        padding: 25,
        marginBottom: 30
    },
    container2: {
        backgroundColor: 'white',
        padding: 10,
        marginTop: 20,
        borderRadius: 10
    },
    grupoText: {
        marginLeft: 5
    },
    filtro: {
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
        marginTop: 35,
        backgroundColor: '#FFF',
        borderRadius: 8,
        paddingBottom: 40,
        padding: 10,
    },
    headerTabela: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#8A8A8A',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 10,
        marginBottom: 10
    },
    headerTexto: {
        flex: 1,
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
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
        height: 'auto',
        width: '100%',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0077FF',
        width: '100%',
        padding: 10,
        borderRadius: 13,
        justifyContent: 'space-between',
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
