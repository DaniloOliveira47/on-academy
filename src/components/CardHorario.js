import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../path/ThemeContext';

export default function CardHorario({hora}) {
    const { isDarkMode } = useTheme();
    const container = isDarkMode ?   '#241F1F' : '#F0F7FF' ;
    return (
        <View style={[styles.container, {backgroundColor : container}]}>
            <Text style={{color: '#0077FF', fontSize: 13, fontWeight: 'bold' }}>
                {hora}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 100,
        padding: 5,
        borderRadius: 10
    }
});