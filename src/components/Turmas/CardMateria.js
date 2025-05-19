import React from 'react'
import { Text } from 'react-native';
import { StyleSheet, View } from 'react-native'


export default function CardMateria({ materia }) {
  return (
    <View style={styles.container}>
      <Text style={{ color: 'white', fontSize: 14 }}>
        {materia}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0077FF',
    width: 100,
    alignItems: 'center',
    padding: 12,
    marginBottom: 20
  }
});