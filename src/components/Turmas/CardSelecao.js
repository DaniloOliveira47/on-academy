import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function CardSelecao({ numero, selecionado, onPress }) {
    const { isDarkMode } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                selecionado && styles.ativo,
                { backgroundColor: selecionado ? '#0077FF' : (isDarkMode ? '#141414' : '#F0F7FF') }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.texto, selecionado && styles.textoAtivo]}>
                {numero}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 45,
        borderRadius: 10,
        alignItems: 'center',
        padding: 10,
        marginHorizontal: 5
    },
    ativo: {
        backgroundColor: '#0077FF',
    },
    texto: {
        color: '#0077FF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    textoAtivo: {
        color: '#FFF',
    }
});
