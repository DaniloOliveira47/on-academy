import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Avisos({nome, horario, texto, abreviacao}) {
    return (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <View style={styles.circulo}>
                        <Text style={styles.Textcirculo}>{abreviacao}</Text>
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{nome}</Text>
                </View>
                <View>
                    <Text style={{color: '#8A8A8A', fontWeight: 'bold'}}>
                        {horario}
                    </Text>
                </View>
            </View>
            <View style={{ alignItems: 'center', height: 'auto', marginLeft: 30  }}>
                <Text style={{ textAlign: 'justify', color: '#8A8A8A', fontWeight: 'bold' }}>
                   {texto}
                </Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    card: {
        borderTopWidth: 2,
        borderColor: '#ECECEC',
        paddingVertical: 10,
        height: 'auto'
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