import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function HeaderSimplesBack({ titulo }) {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const navigation = useNavigation();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
      <View style={styles.leftContainer}>
        <TouchableOpacity onPress={handleGoBack} style={[
          styles.backButton,
          { backgroundColor: isDarkMode ? '#1E1E1E' : '#E0EFFF' },
        ]}>
          <Icon name="arrow-left" size={22} color={isDarkMode ? '#A1C9FF' : '#0077FF'} />
        </TouchableOpacity>

      
      </View>

      <Text style={[styles.titulo, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>
        {titulo}
      </Text>

      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: isDarkMode ? '#0077FF' : '#0077FF' }]}
        onPress={toggleTheme}
      >
        <Icon name={isDarkMode ? 'moon' : 'sun'} size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
