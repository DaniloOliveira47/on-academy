import React from 'react'
import { StyleSheet, View } from 'react-native'
import HeaderSimples from '../../components/Gerais/HeaderSimples'
import { TextInput } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Feather';
import CardTurmas from '../../components/Turmas/CardTurmas';

export default function Turmas() {
    return (
        <View>
            <View style={styles.tela}>

                <HeaderSimples />
            </View>
            <View style={styles.subTela}>
                <View style={styles.container}>
                    <View style={styles.inputContainer}>

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
                        />
                        <CardTurmas
                            turma="Turma B - 2º Ano"
                            numero="Nº0231000"
                            alunos="28 Alunos ativos"
                            periodo="Período: Tarde"
                        />
                        <CardTurmas
                            turma="Turma C - 3º Ano"
                            numero="Nº0231000"
                            alunos="35 Alunos ativos"
                            periodo="Período: Noite"
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
        padding: 10
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