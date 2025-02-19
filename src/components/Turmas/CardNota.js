import React from 'react'
import { Text } from 'react-native';
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../path/ThemeContext'; 

export default function CardNota({ nota }) {
      const { isDarkMode } = useTheme();
      const BackgroundColor = isDarkMode ? '#000' : '#F0F7FF';
      const textColor = isDarkMode ? '#FFF' : '#000';


    return (
        <View style={[styles.container,{backgroundColor: BackgroundColor}]}>
            <Text style={{ color: textColor, fontSize: 14, fontWeight: 'bold' }}>
                {nota}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 100,
        alignItems: 'center',
        padding: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    }
});