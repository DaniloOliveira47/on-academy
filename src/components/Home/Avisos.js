import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Avisos() {
    return (
        <View style={styles.card}>
            <View>
                <View>
                    <View style={styles.circulo}>
                        <Text style={styles.Textcirculo}>AR</Text>
                    </View>
                    <Text></Text>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    card: {
        borderTopWidth: 1
    },
    Textcirculo: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    circulo: {
        alignItems: 'center',
        width: 50,
        
        borderRadius: 30,
        padding: 13,
        backgroundColor: '#FF7E3E'
    }
});