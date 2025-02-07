import React from 'react'
import { Text } from 'react-native';
import { StyleSheet, View } from 'react-native'


export default function Nota({ nota }) {
    return (
        <View style={styles.container}>
            <Text style={{ color: 'black', fontSize: 17, fontWeight: 'bold' }}>
                {nota}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        width: 130,
        alignItems: 'center',
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    }
});