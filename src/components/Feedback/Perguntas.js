import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function Perguntas({ numero }) {
  return (
    <View style={styles.container}>
      <Text style={styles.numero}>
        {numero}-
      </Text>
      <Text style={styles.pergunta}>
        Nível de Engajamento (O quanto a aula prendeu a atenção e motivou a participação?)
      </Text>
    </View>
  )
}
const styles = StyleSheet.create({
  numero: {
    color: 'blue',
    fontWeight: 'bold',
    fontSize: 16
  },
  container: {
    flexDirection: 'row',
    gap: 6,
  },
  pergunta: {
    fontSize: 14,
    fontWeight: 'bold'
  }
})
