import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function ProximosEventos({ data, titulo, subData, periodo, color }) {
  return (
    <View style={styles.card}>
      <View style={{
        backgroundColor: color,
        padding: 10,
        alignItems: 'center',
        width: 45,
        borderRadius: 100,
      }}>
        <Text style={{ fontSize: 18, color: 'white', fontWeight: 'bold' }}>
          {data}
        </Text>
      </View>
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
          {titulo}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={styles.subTitulo}>
            {subData}
          </Text>
          <View style={{ padding: 5, backgroundColor: '#0077FF', borderRadius: 20, width: 5, height: 5, marginTop: 2 }}>
          </View>
          <Text style={styles.subTitulo}>
            {periodo}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 15,
    backgroundColor: '#F0F7FF',
    padding: 15,
    flexDirection: 'row',
    gap: 10,
    borderRadius: 15,

  },

  subTitulo: {
    color: '#8A8A8A',
    fontWeight: 'bold',
    fontSize: 11
  }
});