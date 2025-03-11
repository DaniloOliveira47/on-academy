import React from 'react'
import { Text } from 'react-native';
import { StyleSheet, View } from 'react-native'


export default function CardMateria({materia}) {
  return (
    <View style={styles.container}>
        <Text style={{color: 'white', fontSize: 17}}>
            {materia}
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        backgroundColor: '#0077FF',
        width: 130,
        alignItems: 'center',
        padding: 16,
        marginBottom: 20,
        paddingRight: 2,
        paddingLeft: 2
    }
});