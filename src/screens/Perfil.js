import React from 'react'
import { Image, StyleSheet, Text, TextInput, View } from 'react-native'
import HeaderSimples from '../components/HeaderSimples'
import Campo from '../components/Campo'


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
                <Campo
                    label="Nome Completo"
                    text="Renata Vieira de Souza"
                />
                <Campo
                    label="Email"
                    text="revieira@gmail.com"
                />
                <Campo
                    label="Nº Matrícula"
                    text="1106434448-1"
                />
                <View style={styles.doubleCampo}>
                    <Campo 
                    label = "Telefone"
                    text = "(11) 95312-8203"
                    />
                    <Campo
                    label="Data de Nascimento" 
                    text="23/01/2006"
                    />
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
        marginTop: 40
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
    doubleCampo: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

})
