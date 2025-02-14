import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function CardOcorrencia({ ocorrencia, tipo, orientador, data }) {
  return (
    <View style={styles.linha}>
        <Text style={styles.texto}>{ocorrencia}</Text>
        <Text style={styles.texto}>{tipo}</Text>
        <Text style={styles.texto}>{orientador}</Text>
        <Text style={styles.texto}>{data}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    texto: {
        flex: 1,
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
