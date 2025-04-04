import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CardProfessor({ nome, id, onPress, selecionado, onVerPerfil }) {
    return (
        <TouchableOpacity
            onPress={onPress} // Clique em todo o card para selecionar o professor
            style={[styles.container, selecionado && styles.selecionado]}
        >
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={require('../../assets/image/Professor.png')} />
            </View>
            <Text style={{ marginTop: 50, fontWeight: 'bold', color: '#000', textAlign: 'center' }}>
                {nome}
            </Text>
            <TouchableOpacity
                onPress={onVerPerfil} // Clique no botão "Ver" para navegar ao perfil
                style={styles.botao}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Ver
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 170,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
        paddingBottom: 10,
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 5,
        width: 80,
        position: 'absolute',
        marginLeft: 40,
        marginTop: -30,
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#F0F7FF',
    },
    botao: {
        backgroundColor: '#0077FF',
        padding: 5,
        width: 50,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    selecionado: {
        borderColor: '#0077FF',
        borderWidth: 2,
    },
});