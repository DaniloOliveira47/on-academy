import React from 'react';
import { StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function CardTurmas({ titulo, subTitulo }) {
  const { isDarkMode } = useTheme();
  const colorScheme = useColorScheme();
  const darkMode = isDarkMode ?? colorScheme === 'dark';

  return (
    <View style={[styles.card, { backgroundColor: darkMode ? '#1E1E1E' : '#F0F7FF' }]}>
      <Text style={[styles.titulo, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
        {titulo}
      </Text>
      <Text style={[styles.subTitulo, { color: darkMode ? '#BBBBBB' : '#8A8A8A' }]}>
        {subTitulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  titulo: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  subTitulo: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

