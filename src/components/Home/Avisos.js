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
        color: 'white'
    },
    circulo: {
        alignItems: 'center',
        width: 50,
        
        borderRadius: 18,
        padding: 10,
        backgroundColor: '#FF7E3E'
    }
});