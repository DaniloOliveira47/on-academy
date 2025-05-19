import React from 'react';
import { Image } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function CheckList({ texto }) {
  const { isDarkMode } = useTheme();
  const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
  const cont = isDarkMode ? '#000' : '#FFF';
  const text = isDarkMode ? '#FFF' : '#000'
  return (
    <View style={styles.linha}>
      <Image style={styles.image} source={require('../../assets/image/checklist.png')} />
      <Text style={{ fontSize: 15, fontWeight: 'bold', color: text }}>{texto}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10
  },

  image: {
    width: 25,
    height: 25
  }
})
