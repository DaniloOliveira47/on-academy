import React from 'react';
import { Image } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function List({texto}) {
    const { isDarkMode } = useTheme();
            const text = isDarkMode ? '#FFF' : '#000'
    return (
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 15, color: text }}>{texto}</Text>
    );
};
