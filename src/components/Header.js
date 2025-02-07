import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import CustomCalendar from './Calendario';
import ProximosEventos from './proximosEventos';

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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Image style={{ width: 25, height: 30 }} source={require('../assets/image/logo.png')} />
            <Text style={{ color: '#0077FF', fontWeight: 'bold', fontSize: 18 }}>ONA</Text>
          </View>
          <View style={styles.subLinha}>

            <Image style={{ width: 110, height: 25 }} source={require('../assets/image/Toggle.png')} />
            <Image style={styles.notification} source={require('../assets/image/Notification3.png')} />
          </View>
        </View>
      </View>

      {menuVisible && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      <Animated.View style={[styles.menuOverlay, { transform: [{ translateX: menuTranslateX }] }]}>
        <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
          <Text style={styles.closeText}>x</Text>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={styles.perfil}>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Image style={styles.imgPerfil} source={require('../assets/image/perfil4x4.png')} />
              <Text style={{ fontSize: 20, marginTop: 15, fontWeight: 'bold' }} >
                Roberta
              </Text>
            </View>
            <Image source={require('../assets/image/Option.png')} style={styles.options} />
          </View>
        </View>
        <View style={styles.menuItem}>
          <CustomCalendar />
        </View>
        <View style={styles.menuItem}>
          <View style={styles.contEventos}>
            <Text style={{ fontWeight: 'bold' }}>
              Próximos Eventos
            </Text>
            <View>
              <ProximosEventos
                data="8"
                titulo="Inicio das Aulas"
                subData="8 - FEV 2025"
                periodo="8 A.M - 9 A.M"
                color='#0077FF'
              />
              <ProximosEventos
                data="13"
                titulo="Clube do Livro"
                subData="8 - FEV 2025"
                periodo="8 A.M - 9 A.M"
                color='#FF1D86'
              />
              <ProximosEventos
                data="18"
                titulo="Entrega das Apostilas"
                subData="8 - FEV 2025"
                periodo="8 A.M - 9 A.M"
                color='#16D03B'
              />
              <ProximosEventos
                data="23"
                titulo="Feira Cultural"
                subData="8 - FEV 2025"
                periodo="8 A.M - 9 A.M"
                color='#FF7E3E'
              />
            </View>

          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  contEventos: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    padding: 20,
  },

  menuContainer: {
    width: 30,
    height: 30,
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  options: {
    width: 20,
    height: 10,
    marginTop: 10
  },
  imgPerfil: {
    width: 60,
    height: 50,
    borderRadius: 13
  },
  perfil: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 8,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  menuLine: {
    width: '100%',
    height: 3,
    backgroundColor: '#0077FF',
    borderRadius: 2,
  },
  linha: {
    marginTop: 10,
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
    height: 25,
    resizeMode: 'contain',
  },
  header: {
    backgroundColor: '#F0F7FF',
    overflow: 'hidden',
  },
  subLinha: {
    flexDirection: 'row',
    gap: 20
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
    backgroundColor: '#0077FF',
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
    top: 0,
    right: 20,
    zIndex: 20,
  },
  closeText: {
    fontSize: 18,
    color: '#FFF',
  },
});
