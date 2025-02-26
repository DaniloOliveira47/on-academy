import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../../path/ThemeContext';

export default function Avaliacao({ numero }) {
     const { isDarkMode } = useTheme();
     const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    return (
        <TouchableOpacity style={[styles.container, {backgroundColor: formBackgroundColor}]}>
            <Text style={styles.texto}>
                {numero}
            </Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 6,
        width: 30, 
        borderRadius: 10,
        alignItems: 'center'
    },
    texto: {
        color: '#0077FF',
        fontWeight: 'bold'
    }
});