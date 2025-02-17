import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function CardTurmas({titulo, subTitulo}) {
    return (
        <View style={styles.card}>
            <Text style={styles.titulo}>
                {titulo}
            </Text>
            <Text style={styles.subTitulo}>
                {subTitulo}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F0F7FF',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
        shadowColor:'#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    titulo: {
        fontSize: 17,
        fontWeight: 'bold'
    },
    subTitulo: {
        color: '#8A8A8A',
        fontWeight: 'bold',
        fontSize: 16
    }
});