import React from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Icon } from 'react-native-elements'

export default function HeaderSimples() {
  return (
   <View style={styles.linha}>
        <Icon name='arrow-back' size={30} color="#000"/>
        <Image style={styles.image} source={require('../assets/image/Toggle.png')}/>
   </View>
  )
}
const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        
    },
   
})
