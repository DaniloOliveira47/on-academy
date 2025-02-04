import React from 'react'
import { Text, TextInput, View, Image, ImageBackground, StyleSheet } from 'react-native'

export default function Login() {
    return (
        <>
            <View style={styles.tela}>
                <View style={styles.container}>
                    <Image style={styles.image} source={require('../assets/image/imageContainer.png')} />
                </View>
                <View style={styles.contStyle}>
                    <ImageBackground source={require('../assets/image/Objects.png')}>
                        <View style={styles.contText}>
                            <Text style={styles.title}>
                                Bem-vindo à (plataforma)
                            </Text>
                            <Text style={styles.text}>
                                Acompanhe seu desempenho, receba notificações e explore recursos personalizados para começar
                            </Text>
                        </View>
                    </ImageBackground>
                </View>
                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="email"
                    />
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
        marginLeft: 50,
    },
    tela: {
        width: '100%',
        height: '100%',
        backgroundColor: '#151316'
    },
    container: {
        width: 400,
        height: 260,
    },
    title: {
        fontFamily: 'Epilogue-Bold',
        color: 'white',
        fontSize: 35,
        textAlign: 'center'
    },
    contText: {
        width: 330,
        marginLeft: 60
    },
    text: {
        color: '#A4A4A4',
        fontSize: 18,
        textAlign: 'center'
    },
    form: {
        // Adicione seus estilos de formulário aqui
    },
    input: {
        // Estilos para o TextInput
    }
})
