import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Campo({ label, text }) {
    return (
        <View style={styles.campo}>
            <Text style={styles.label}>
                {label}
            </Text>
            <View style={styles.input}>
                <Text style={styles.colorInput}>
                    {text}
                </Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    input: {
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        marginTop: 10,
        padding: 10,
    },
    campo: {
        marginTop: 15
    },
    colorInput: {
        color: "#786D6D",
        fontSize: 17
    }
})
