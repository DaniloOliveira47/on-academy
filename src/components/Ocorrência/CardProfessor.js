import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../path/ThemeContext';

export default function CardProfessor({ nome, id, onPress, selecionado, onVerPerfil, imageUrl }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.container, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }, selecionado && styles.selecionado]}
        >
            <View style={[styles.imageContainer, {borderColor: isDarkMode ? '#141414' : '#F0F7FF'}]}>
                {imageUrl ? (
                    <Image 
                        style={styles.image} 
                        source={{ uri: imageUrl }} 
                        onError={(e) => {
                            e.nativeEvent.target.source = require('../../assets/image/Professor.png');
                        }}
                    />
                ) : (
                    <Image 
                        style={styles.image} 
                        source={require('../../assets/image/Professor.png')}
                    />
                )}
            </View>
            <Text style={{ marginTop: 50, color: isDarkMode ? '#FFF' : '#000', fontWeight: 'bold', textAlign: 'center' }}>
                {nome}
            </Text>
            <View style={styles.botao}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Selecione
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 160,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
        paddingBottom: 10,
        padding: 5
    },
    imageContainer: {
        backgroundColor: 'white',
        padding: 5,
        width: 80,
        height: 80,
        position: 'absolute',
        marginLeft: 40,
        marginTop: -30,
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#F0F7FF',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 35,
    },
    botao: {
        backgroundColor: '#0077FF',
        padding: 5,
        width: 80,
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