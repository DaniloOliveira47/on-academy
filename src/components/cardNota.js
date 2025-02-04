import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

export default function CardNota() {
  return (
    <>
    <View style={styles.card}>
        <View style={styles.imageBack}>
            <Image style={styles.image} source={require('../assets/image/português.png')}/>
        </View>
        <View style={styles.info}>
            <Text style={styles.title}>
                Português
            </Text>
            <Text style={styles.subtitle}>
                Arthur
            </Text>
        </View>
     
    </View>
    </>
  )
}
const styles = StyleSheet.create({
    imageBack: {
        backgroundColor: '#0077FF',
        width: 57,
        height: 60,
        alignItems: 'center',
        padding: 7,
        borderRadius: 10
    },
    image: {
        width: 47,
        height: 47
    },
    card: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 6,
        flexDirection: 'row',
        gap: 10
    },
    title: {
        fontSize: 18
    },
    subtitle: {
        color: '#8A8A8A'
    },
    info: {
        marginTop: 5
    }

})
