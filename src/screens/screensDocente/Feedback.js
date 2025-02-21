import React from 'react'
import { StyleSheet, View } from 'react-native'
import HeaderSimples from '../../components/Gerais/HeaderSimples'
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';
import { useTheme } from '../../path/ThemeContext';

export default function Turmas() {
    const { isDarkMode } = useTheme();
    return (
        <View style={{backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', height: '100%'}}>
            <HeaderSimples
            titulo= "TURMAS"
            />
        
            <View style={styles.subTela}>
                <View style={[styles.container, {backgroundColor: isDarkMode ? '#000000' : 'white'}]}>
                    <View style={[styles.inputContainer, {backgroundColor: isDarkMode ? '#000000' : 'white'}]}>
                        <TextInput
                            style={styles.input}
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
                            navegacao="AlunosFeedback"
                        />
                        <CardTurmas
                            turma="Turma B - 2º Ano"
                            numero="Nº0231000"
                            alunos="28 Alunos ativos"
                            periodo="Período: Tarde"
                            navegacao="AlunosFeedback"
                        />
                        <CardTurmas
                            turma="Turma C - 3º Ano"
                            numero="Nº0231000"
                            alunos="35 Alunos ativos"
                            periodo="Período: Noite"
                            navegacao="AlunosFeedback"
                        />
                    </View>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    tela: {
        padding: 25,
        backgroundColor: '#F0F7FF'
    },
    cards: {
        width: '100%',
        padding: 10,
        marginTop: 15
    },
    subTela: {
        padding: 10,
        paddingTop: 0,
    },
    container: {
        backgroundColor: 'white',
        width: '100%',
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
        padding: 10,
        marginTop: 20
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
        marginTop: 10
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    }

});