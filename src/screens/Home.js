import React from 'react'
import Header from '../components/Header'
import { StyleSheet, View } from 'react-native'
import GraficoMedia from '../components/graficoMedia'

export default function Home() {
  return (
    <>
   <View style={styles.tela}>
   <Header/>
   <GraficoMedia/>
   </View>
   </>
  )
}

const styles = StyleSheet.create({
      tela: {
        backgroundColor: '#DCE8F5',
        width: '100%',
        height: '100%'
      }
})