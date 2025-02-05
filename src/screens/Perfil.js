import React from 'react'
import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import HeaderSimples from '../components/HeaderSimples'


export default function Perfil() {
    return (
        <View style={styles.tela}>
            <HeaderSimples />
            <View style={styles.conText}>
                <Text style={styles.titulo}>
                    Bem-Vinda, Renata
                </Text>
                <Text style={styles.subTitulo}>Tue, 07 June 2022</Text>
            </View>

            <Image style={styles.barraAzul} source={require('../assets/image/barraAzul.png')} />
            <View style={styles.form}>
                <View style={styles.linhaUser}>
                    <Image source={require('../assets/image/Perfill.png')} />
                    <View style={styles.name}>
                        <Text style={styles.nome}>
                            Renata Vieira
                        </Text>
                        <Text style={styles.email}>
                            revieira@gmail.com
                        </Text>
                    </View>
                </View>
                <View style={styles.campo}>
                <Text style={styles.label}>
                    Nome Completo
                </Text>
                <TextInput style={styles.input}/>
                </View>
               
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    tela: {
        padding: 25,
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%'
    },
    conText: {
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 70
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 24
    },
    subTitulo: {
        color: '#786D6D',
        fontWeight: 'bold'
    },
    barraAzul: {
        width: 360,
        height: 60,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        marginTop: 25
    },
    form: {
        backgroundColor: '#FFFFFF',
        padding: 25
    },
    linhaUser: {
        flexDirection: 'row',
        gap: 10
    },
    name: {
        marginTop: 15,

    },
    nome: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    email: {
        color: '#786D6D',
        fontSize: 15
    },
    input: {
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        marginTop: 10
    },
    campo: {
        marginTop: 30
    }
})
