import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'


export default function CardTurmas({turma, alunos, periodo, numero, navegacao}) {
    const navigation = useNavigation();
    return (
        <View style={styles.card}>
            <View style={styles.linha}>
                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>
                   {turma}
                </Text>
                <Text style={{ color: '#8A8A8A', fontWeight: 'bold' }}>
                   {numero}
                </Text>
            </View>
            <Text style={styles.subTexto}>
                {alunos}
            </Text>
            <Text style={styles.subTexto}>
                {periodo}
            </Text>
            <View style={{alignItems: 'center', marginTop: 20}}>
            <TouchableOpacity  onPress={() => navigation.navigate(navegacao)} style={styles.botao} >
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                    Visualizar Turma
                </Text>
            </TouchableOpacity>
            </View>
        </View>
    )
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
        width: 230,
        padding: 6,
        borderRadius: 8
    },
    subTexto: {
        fontWeight: 'bold'
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    }
})