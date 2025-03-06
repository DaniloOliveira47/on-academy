import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Modal, TextInput, ScrollView, FlatList } from 'react-native';
import Campo from '../../Perfil/Campo';
import { useTheme } from '../../../path/ThemeContext';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { BarChart } from 'react-native-chart-kit';

export default function PerfilAluno() {
    const { isDarkMode } = useTheme();
    const screenWidth = Dimensions.get('window').width - 40;
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const data = {
        labels: ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'],
        datasets: [{
            data: [80, 50, 90, 70, 40],
            colors: [
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6',
                () => '#1E6BE6'
            ]
        }]
    };

    const [modalEditVisible, setModalEditVisible] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [perfil, setPerfil] = useState({
        nome: 'Renata Vieira de Souza',
        email: 'revieira@gmail.com',
        matricula: '1106434448-1',
        telefone: '(11) 95312-8203',
        nascimento: '23/01/2006',
        turma: '3 º A',
        senha: '********',
    });
    const [perfilEdit, setPerfilEdit] = useState(perfil);

    const [ocorrencias, setOcorrencias] = useState([
        { id: '1', turma: '3 º A', data: '2025-03-01', ocorrencia: 'Faltou na aula de Matemática' },
        { id: '2', turma: '3 º B', data: '2025-03-02', ocorrencia: 'Chegou atrasado na aula de História' },
        { id: '3', turma: '3 º A', data: '2025-03-03', ocorrencia: 'Entrega de tarefa de Ciências' },
    ]);

    const handleEditSave = () => {
        setPerfil(perfilEdit);
        setModalEditVisible(false);
    };

    const handleDelete = () => {
        console.log('Perfil excluído');
        setModalDeleteVisible(false);
    };

    return (
        <ScrollView>
            <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
                <HeaderSimples titulo="PERFIL" />
                <View style={{ padding: 15 }}>
                    <Image
                        style={[styles.barraAzul, { backgroundColor: barraAzulColor }]}
                        source={require('../../../assets/image/barraAzul.png')}
                    />
                    <View style={[styles.form, { backgroundColor: formBackgroundColor }]}>
                        <View style={styles.linhaUser}>
                            <Image source={require('../../../assets/image/Perfill.png')} />
                            <View style={styles.name}>
                                <Text style={[styles.nome, { color: textColor }]}>{perfil.nome}</Text>
                                <Text style={[styles.email, { color: textColor }]}>{perfil.email}</Text>
                            </View>
                        </View>
                        <Campo label="Nome Completo" text={perfil.nome} textColor={textColor} />
                        <Campo label="Email" text={perfil.email} textColor={textColor} />
                        <Campo label="Nº Matrícula" text={perfil.matricula} textColor={textColor} />

                        {/* Telefones e Nascimento lado a lado */}
                        <View style={styles.inlineFieldsContainer}>
                            <Campo label="Telefone" text={perfil.telefone} textColor={textColor} isInline={true} />
                            <Campo label="Data de Nascimento" text={perfil.nascimento} textColor={textColor} isInline={true} />
                        </View>

                        {/* Senha e Turma lado a lado */}
                        <View style={styles.inlineFieldsContainer}>
                            <Campo label="Senha" text={perfil.senha} textColor={textColor} isPassword={true} isInline={true} />
                            <Campo label="Turma" text={perfil.turma} textColor={textColor} isInline={true} />
                        </View>

                        <View style={styles.buttonContainer}>
                         
                            <TouchableOpacity onPress={() => setModalEditVisible(true)} style={styles.iconeBotao}>
                                <Icon name="edit" size={20} color={isDarkMode ? 'white' : 'black'} />
                            </TouchableOpacity>

                            
                            <TouchableOpacity onPress={() => setModalDeleteVisible(true)} style={styles.iconeBotao}>
                                <Icon name="trash" size={20} color={isDarkMode ? 'red' : 'darkred'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.tabelaContainer, { backgroundColor: formBackgroundColor }]}>

                        {/* Cabeçalho da tabela */}
                        <View style={[styles.tabelaHeader, { backgroundColor: '#F0F7FF' }]}>
                            <Text style={[styles.tabelaHeaderText, { color: 'black' }]}>Ocorrência</Text>
                            <Text style={[styles.tabelaHeaderText, { color: 'black'   }]}>Turma</Text>
                            <Text style={[styles.tabelaHeaderText, { color: 'black'  }]}>Data</Text>
                        </View>
                        <FlatList
                            data={ocorrencias}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.tabelaRow}>
                                    <Text style={[styles.tabelaText, { color: textColor }]}>{item.ocorrencia}</Text>
                                    <Text style={[styles.tabelaText, { color: textColor }]}>{item.turma}</Text>
                                    <Text style={[styles.tabelaText, { color: textColor }]}>{item.data}</Text>
                                </View>
                            )}
                        />
                        <BarChart
                            data={data}
                            width={screenWidth * 0.99}
                            height={200}
                            yAxisSuffix="%"
                            fromZero
                            showBarTops={false}
                            withCustomBarColorFromData={true}
                            flatColor={true}
                            chartConfig={{
                                backgroundGradientFrom: perfilBackgroundColor,
                                backgroundGradientTo: perfilBackgroundColor,
                                decimalPlaces: 0,
                                color: () => '#1E6BE6',
                                labelColor: () => textColor,
                                barPercentage: 1.2,
                                fillShadowGradient: '#A9C1F7',
                                fillShadowGradientOpacity: 1,

                            }}
                            style={[styles.chart, {   borderTopWidth:2,
                                color: textColor}]}
                        />
                    </View>
                    
                </View>

            </View>


            <Modal visible={modalEditVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Editar Perfil</Text>
                        <View style={styles.modalInputContainer}>
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.nome}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nome: text })}
                                placeholder="Nome Completo"
                            />
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.email}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, email: text })}
                                placeholder="Email"
                            />
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.telefone}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, telefone: text })}
                                placeholder="Telefone"
                            />
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.nascimento}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, nascimento: text })}
                                placeholder="Data de Nascimento"
                            />
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.senha}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, senha: text })}
                                placeholder="Senha"
                                secureTextEntry
                            />
                            <TextInput
                                style={styles.input}
                                value={perfilEdit.turma}
                                onChangeText={(text) => setPerfilEdit({ ...perfilEdit, turma: text })}
                                placeholder="Turma"
                            />
                        </View>

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={styles.saveButton} onPress={handleEditSave}>
                                <Text style={styles.buttonText}>Salvar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalEditVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            <Modal visible={modalDeleteVisible} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Tem certeza que deseja excluir o perfil?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                <Text style={styles.buttonText}>Excluir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalDeleteVisible(false)}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        padding: 0,
        width: '100%',
        height: '100%',
        paddingBottom: 60
    },
    chart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
     
    },
    form: {
        padding: 25
    },
    barraAzul: {
        width: 382,
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10
    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    email: {
        fontSize: 15
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    iconeBotao: {
        padding: 10
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold'
    },
    modalBackdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 12,
        width: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
        textAlign: 'center'
    },
    modalInputContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        backgroundColor: '#F2F2F2',
        padding: 12,
        width: '80%',
        marginBottom: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD'
    },
    saveButton: {
        backgroundColor: '#1E6BE6',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        marginRight: '5%',
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#999',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        alignItems: 'center'
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 8,
        width: '45%',
        marginRight: '5%',
        alignItems: 'center'
    },
    inlineFieldsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    tabelaContainer: {
        marginTop: 20,
        padding: 25,
        paddingBottom: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
    },
    tabelaTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    tabelaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        marginBottom: 10,
        paddingVertical: 10
    },
    tabelaHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        width: '30%',
        textAlign: 'center'
    },
    tabelaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    tabelaText: {
        fontSize: 16,
        width: '30%',
        textAlign: 'center'
    }
});
