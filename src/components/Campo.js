import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../path/ThemeContext'; 

export default function Campo({ label, text }) {
    const { isDarkMode } = useTheme();

    const textColor = isDarkMode ? '#FFF' : '#000';
    const fundoColor = isDarkMode ? '#33383E' : '#F0F7FF'
    const textInput = isDarkMode ? '#FFF' : '#33383E';
    
    return (
        <View style={styles.campo}>
            <Text style={[styles.label, {color: textColor }]}>
                {label}
            </Text>
            <View style={[styles.input, {backgroundColor: fundoColor }]}>
                <Text style={[styles.colorInput, {color: textInput}]}>
                    {text}
                </Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    input: {
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        marginTop: 10,
        padding: 10,
    },
    campo: {
        marginTop: 15
    },
    colorInput: {
        fontSize: 17
    }
})
