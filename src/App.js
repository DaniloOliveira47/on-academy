import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'; 
import Navigation from './Navigation';
import { ThemeProvider } from './path/ThemeContext';
import Login from './screens/Login'

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); 

  
  const theme = isDarkMode ? DarkTheme : DefaultTheme; 

  return (
    <View style={styles.container}>

    <Login />
  </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
