import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './Navigation';
import NavigationDocente from './src/NavigationDocente';
import { ThemeProvider } from './path/ThemeContext'; 
import { StyleSheet } from 'react-native';

export default function MainNavigation() {
  return (
    <ThemeProvider> 
      <NavigationContainer>
        <NavigationDocente />
      </NavigationContainer>
    </ThemeProvider>
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
