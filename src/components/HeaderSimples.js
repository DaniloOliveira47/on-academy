import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'

export default function HeaderSimples() {
  return (
   <View style={styles.linha}>
    <View style={{flexDirection: 'row', alignItems: 'center',  gap: 5}}>
             <Image style={{ width: 25, height: 30 }} source={require('../assets/image/logo.png')} />
             <Text style={{color: '#0077FF', fontWeight:'bold', fontSize: 18}}>ONA</Text>
             </View>
        <Image style={{width: 110, height: 25}} source={require('../assets/image/Toggle.png')}/>
   </View>
  )
}
const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
    },
   
})
