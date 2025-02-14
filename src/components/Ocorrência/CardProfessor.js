import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { Image, StyleSheet, View } from 'react-native'

export default function CardProfessor() {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('../../assets/image/Professor.png')} />
            </View>
            <Text style={{marginTop: 50, fontWeight: 'bold'}}>
                Prof(a) Karla Dias
            </Text>
            <TouchableOpacity style={styles.botao}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                    Ver
                </Text>
            </TouchableOpacity>


        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 150,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center'
    },
    imageContainer: {
        backgroundColor: 'white', padding: 5, width: 80, position: 'absolute',
        marginLeft: 40,
        marginTop: -30,
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#F0F7FF'
    },
     botao: {
        backgroundColor: '#0077FF',
        padding: 5,
        width: 50,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
     }
});
