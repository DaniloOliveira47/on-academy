import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';

export default function HeaderSimples({ titulo }) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={[styles.linha, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../../assets/image/logo.png')} />
        <Text style={[styles.logoText, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>ONA</Text>
      </View>

      <Text style={[styles.titulo, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>
        {titulo}
      </Text>

      <TouchableOpacity style={[styles.themeButton, { backgroundColor: isDarkMode ? '#0077FF' : '#0077FF' }]} onPress={toggleTheme}>
        <Icon name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fff' : '#FFF'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logo: {
    width: 25,
    height: 30,
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  themeButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
});
