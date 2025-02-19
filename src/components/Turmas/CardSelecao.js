import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';

export default function CardSelecao({ numero, selecionado, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.container, selecionado && styles.ativo]}
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
        backgroundColor: '#FFF',
        width: 45,
        borderRadius: 10,
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#F0F7FF',
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
