import React from 'react'
import Header from '../components/Header'
import { StyleSheet, Text, View } from 'react-native'

export default function Home() {
  return (
    <>
   <View style={styles.tela}>
   <Header/>
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