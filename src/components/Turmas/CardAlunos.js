import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { Image, StyleSheet, View } from 'react-native'

export default function CardAlunos({ nome }) {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('../../assets/image/Professor.png')} />
            </View>
            <Text style={{ marginTop: 50, fontWeight: 'bold' }}>
                {nome}
            </Text>
            <View style={styles.botao}>
                <Text style={{ color: '#18E742', fontWeight: 'bold', fontSize: 17 }}>
                    Ativo(a)
                </Text>
            </View>

        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 170,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 40
    },
    imageContainer: {
        backgroundColor: 'white', padding: 5, width: 80, position: 'absolute',
        marginLeft: 40,
        marginTop: -30,
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#F0F7FF'
    },
    botao: {
        padding: 5,
        width: 100,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,

    }
});
