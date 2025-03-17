import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../../path/ThemeContext';

export default function Perguntas({ numero, text }) {
  const { isDarkMode } = useTheme();
  const textColor = isDarkMode ? '#FFF' : '#000';
  return (
    <View style={styles.container}>
      <Text style={styles.numero}>
        {numero}-
      </Text>
      <Text style={[styles.pergunta, {color: textColor}]}>
       {text}
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
