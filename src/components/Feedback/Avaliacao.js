import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Avaliacao({ numero }) {
    return (
        <TouchableOpacity style={styles.container}>
            <Text style={styles.texto}>
                {numero}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 6,
        width: 30, 
        borderRadius: 10,
        alignItems: 'center'
    },
    texto: {
        color: '#0077FF',
        fontWeight: 'bold'
    }
});