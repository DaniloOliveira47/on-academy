import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function CardHorario({hora}) {
    return (
        <View style={styles.container}>
            <Text style={{color: '#0077FF', fontSize: 13, fontWeight: 'bold' }}>
                {hora}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        alignItems: 'center',
        width: 100,
        padding: 5,
        borderRadius: 10
    }
});