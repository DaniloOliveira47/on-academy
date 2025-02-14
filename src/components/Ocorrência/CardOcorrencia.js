import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function CardOcorrencia({ocorrencia, tipo, orientador, data }) {
  return (
    <View style={styles.linha}>
        <Text style={styles.text}>
            {ocorrencia}
        </Text>
        <Text style={styles.text}>
            {tipo}
        </Text>
        <Text style={styles.text}>
            {orientador}
        </Text>
        <Text style={{fontSize: 10}}>
            {data}
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    text: {
        fontSize: 12
    },
});