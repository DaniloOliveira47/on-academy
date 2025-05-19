import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../path/ThemeContext';

export default function CardProfessorIns({ nome, id, imageUrl }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
            <View style={[styles.imageContainer, { borderColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
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
            <Text style={{ marginTop: 50, fontWeight: 'bold', color: isDarkMode ? '#FFF' : '#000', textAlign: 'center' }}>
                {nome}
            </Text>
            <TouchableOpacity
                onPress={() => navigation.navigate('PerfilProfessor', { professorId: id })}
                style={styles.botao}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Ver
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 160,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
    },
    imageContainer: {
        backgroundColor: 'white',

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
        width: 70,
        height: 70,
        borderRadius: 35,
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
});