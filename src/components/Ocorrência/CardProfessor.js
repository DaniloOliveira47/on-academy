import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { Image, StyleSheet, View } from 'react-native'
import { useTheme } from '../../path/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function CardProfessor() {
      const navigation = useNavigation();
      const { isDarkMode } = useTheme();
        const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
        const textColor = isDarkMode ? '#FFF' : '#000';
        const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    return (
        <View style={[styles.container, {backgroundColor: perfilBackgroundColor}]}>
            <View style={[styles.imageContainer, {borderColor: perfilBackgroundColor}]}>
                <Image style={styles.image} source={require('../../assets/image/Professor.png')} />
            </View>
            <Text style={{marginTop: 50, fontWeight: 'bold', color: textColor}}>
                Prof(a) Karla Dias
            </Text>
            <TouchableOpacity  onPress={() => navigation.navigate('ProfessorPerfil')} style={styles.botao}>
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
