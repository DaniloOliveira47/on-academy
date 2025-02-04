import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';

export default function Header() {
  const [fontsLoaded] = useFonts({
    'MinhaFonte': require('../../assets/fonts/Epilogue-Medium.ttf'),
  });

  

  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const menuTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, 0], 
  });

  return (
    <>
      <View style={styles.header}>
        <View style={styles.linha}>
          <TouchableOpacity style={styles.menuContainer} onPress={toggleMenu}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>

          <Text style={styles.titulo}>Home</Text>

          <Image source={require('../assets/image/Toggle.png')} />
          <Image style={styles.notification} source={require('../assets/image/Notification3.png')} />
        </View>
      </View>

      {menuVisible && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      <Animated.View style={[styles.menuOverlay, { transform: [{ translateX: menuTranslateX }] }]}>
        <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Opção 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Opção 2</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Opção 3</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    width: 30,
    height: 30,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#0077FF',
    borderRadius: 2,
  },
  linha: {
    marginTop: 20,
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontFamily: 'MinhaFonte',
    fontSize: 24,
    color: '#0077FF',
  },
  notification: {
    width: 25,
    height: 25, // Defina um tamanho fixo para garantir que apareça corretamente
    resizeMode: 'contain', // Mantém a proporção correta
  },
  header: {
    backgroundColor: '#E0DFEE',
    borderWidth: 1,
    borderColor: '#0077FF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.8, 
    height: '100%',
    backgroundColor: '#E0DFEE',
    padding: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#0077FF',
  },
  menuText: {
    fontSize: 18,
    color: '#0077FF',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 9,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 20,
  },
  closeText: {
    fontSize: 24,
    color: '#0077FF',
  },
});
