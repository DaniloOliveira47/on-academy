import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { useTheme } from '../../path/ThemeContext';
import { TouchableOpacity } from 'react-native';

export default function HeaderSimples({titulo}) {

  const { isDarkMode, setIsDarkMode } = useTheme();
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <View style={styles.linha}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <Image style={{ width: 25, height: 30 }} source={require('../../assets/image/logo.png')} />
        <Text style={{ color: '#0077FF', fontWeight: 'bold', fontSize: 18 }}>ONA</Text>
      </View>
      <Text style={{ color: '#0077FF', fontWeight: 'bold', fontSize: 18 }}>
        {titulo}
      </Text>
      <TouchableOpacity onPress={toggleTheme}>
        <Image
          style={{ width: 110, height: 25 }}
          source={isDarkMode ? require('../../assets/image/ToggleDark.png') : require('../../assets/image/Toggle.png')}
        />
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 0,
    alignItems: 'center'
  },

})
