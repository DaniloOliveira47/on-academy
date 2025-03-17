import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function Avaliacao({ numero, selected, onPress }) {
    const { isDarkMode } = useTheme();
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const selectedColor = isDarkMode ? '#1E6BE6' : '#1E6BE6'; // Cor quando selecionado

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: selected ? selectedColor : formBackgroundColor }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.texto, { color: selected ? '#FFF' : '#0077FF' }]}>
                {numero}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 6,
        width: 30,
        borderRadius: 10,
        alignItems: 'center',
    },
    texto: {
        fontWeight: 'bold',
    },
});