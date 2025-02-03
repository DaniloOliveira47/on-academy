import React from 'react'
import { useFonts } from 'expo-font';
import { Image, StyleSheet, Text, View } from 'react-native'

export default function Header() {
  const [fontsLoaded = true] = useFonts({
    'MinhaFonte': require('../../assets/fonts/Epilogue-Medium.ttf')
  });

 
  return (
    <View style={styles.header}>
      <View style={styles.linha}>
        <Image style={styles.menu} source={require('../assets/image/menu.png')} />
      <Text style={styles.titulo}>
        Home
      </Text>
      <Image source={require('../assets/image/Toggle.png')} />
      <Image style={styles.notification} source={require('../assets/image/Notification 3.png')}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({

  menu: {
    width: 30,
    height: 30
  },
  linha: {
    marginTop: 20,
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'space-between'
  },
  titulo: {
    fontFamily: 'MinhaFonte',
    fontSize: 24,
    color: '#0077FF'
  },
  notification: {
   width: 25,
   height: 'auto'
  },
  header: {
    backgroundColor: '#E0DFEE',
    borderWidth: 1,
    borderColor: '#0077FF',
    borderRadius: 20,
  }
})