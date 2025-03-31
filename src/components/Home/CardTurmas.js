import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function CardTurmas({ titulo, subTitulo, onPress, isSelected }) {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, isSelected && styles.selectedCard]}>
      <Text style={[styles.titulo, { color: isSelected ? '#FFF' : '#000' }]}>
        {titulo}
      </Text>
      <Text style={[styles.subTitulo, { color: isSelected ? '#FFF' : '#8A8A8A' }]}>
        {subTitulo}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: '#F0F7FF',
  },
  selectedCard: {
    backgroundColor: '#0077FF',
    borderWidth: 2,
    borderColor: '#0057CC',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
