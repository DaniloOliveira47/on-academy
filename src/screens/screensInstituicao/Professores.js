import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CardAlunos from '../../components/Turmas/CardAlunos';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';

export default function ProfessoresFeedback() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    return (
        <View>
            <HeaderSimples />
                <View style={[styles.tela, {backgroundColor: isDarkMode ?  '#141414' : '#F0F7FF' }]}>

                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>Turma A - 1º Ano</Text>
                    <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
                </View>
                <View style={[styles.container, {backgroundColor: isDarkMode ? '#000' : '#FFF'}]}>
                    <View style={[styles.inputContainer, {backgroundColor: isDarkMode ? 'black' : 'white'}]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome ou número da mátricula"
                            placeholderTextColor="#756262"
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>
                    <View style={styles.contColumn}>
                        <View style={{flexDirection: 'column', gap: 40, marginTop: 40}}>
                            <CardProfessor nome="Alice Fernandes" />
                            <CardProfessor nome="Bianca Ferreira" />
                            <CardProfessor nome="Marina Araujo" />
                        </View>
                        <View style={{flexDirection: 'column', gap: 40, marginTop: 40}}>
                            <CardProfessor nome="Paola Silva" />
                            <CardProfessor nome="Raissa Santos" />
                            <CardProfessor nome="Tauany Mendes" />
                        </View>
                    </View>

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
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 10,
        paddingBottom: 10
    },
    contColumn: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    container: {
        backgroundColor: 'white',
        width: '100%',
        padding: 10,
        borderRadius: 16
    },
    tela: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
        padding: 10
    },
    linha: {
        marginTop: -5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        marginBottom: 10,
        marginTop: 10
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    }
});
