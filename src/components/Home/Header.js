import React, { useState } from 'react';
import { useTheme } from '../../path/ThemeContext';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomCalendar from '../Eventos/Calendario';
import ProximosEventos from '../Eventos/proximosEventos';
import { useNavigation } from '@react-navigation/native';

export default function Header() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = menuVisible ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setMenuVisible(!menuVisible);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const menuTranslateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, 0],
  });

  const headerBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const buttonBackgroundColor = '#0077FF';
  const profileBackgroundColor = isDarkMode ? '#000' : '#F0F7FF';
  const menuLineColor = isDarkMode ? '#0077FF' : '#0077FF';
  const closeButtonColor = '#FFF';
  const container = isDarkMode ? '#000' : '#FFF';

  return (
    <>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        <View style={styles.linha}>
          <TouchableOpacity style={styles.menuContainer} onPress={toggleMenu}>
            <View style={[styles.menuLine, { backgroundColor: menuLineColor }]} />
            <View style={[styles.menuLine, { backgroundColor: menuLineColor }]} />
            <View style={[styles.menuLine, { backgroundColor: menuLineColor }]} />
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Image style={{ width: 25, height: 30 }} source={require('../../assets/image/logo.png')} />
            <Text style={{ color: buttonBackgroundColor, fontWeight: 'bold', fontSize: 18 }}>ONA</Text>
          </View>

          <View style={styles.subLinha}>
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Icon name={isDarkMode ? 'moon' : 'sun'} size={20} color="#FFF" />
            </TouchableOpacity>
            <Image style={styles.notification} source={require('../../assets/image/Notification3.png')} />
          </View>
        </View>
      </View>

      {menuVisible && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

      <Animated.View
        style={[styles.menuOverlay, { transform: [{ translateX: menuTranslateX }], backgroundColor: isDarkMode ? '#141414' : '#1E6BE6' }]}
      >
        <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
          <Text style={[styles.closeText, { color: closeButtonColor }]}>x</Text>
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <TouchableOpacity onPress={() => navigation.navigate('Perfil')}>
            <View style={[styles.perfil, { backgroundColor: profileBackgroundColor }]}>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <Image style={styles.imgPerfil} source={require('../../assets/image/perfil4x4.png')} />
                <Text style={{ fontSize: 20, marginTop: 15, fontWeight: 'bold', color: textColor }}>Roberta</Text>
              </View>
              <Image source={isDarkMode ? require('../../assets/image/OptionWhite.png') : require('../../assets/image/Option.png')} style={styles.options} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuItem, { height: 'auto' }]}>
          <CustomCalendar />
        </View>

        <View style={styles.menuItem}>
          <View style={[styles.contEventos, { backgroundColor: container }]}>
            <Text style={{ fontWeight: 'bold', color: textColor }}>Próximos Eventos</Text>
            <View>
              <ProximosEventos data="8" titulo="Início das Aulas" subData="8 - FEV 2025" periodo="8 A.M - 9 A.M" color="#0077FF" />
              <ProximosEventos data="13" titulo="Clube do Livro" subData="13 - FEV 2025" periodo="10 A.M - 11 A.M" color="#FF1D86" />
              <ProximosEventos data="18" titulo="Entrega das Apostilas" subData="18 - FEV 2025" periodo="2 P.M - 3 P.M" color="#16D03B" />
              <ProximosEventos data="23" titulo="Feira Cultural" subData="23 - FEV 2025" periodo="4 P.M - 5 P.M" color="#FF7E3E" />
            </View>
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  themeButton: {
    backgroundColor: '#0077FF',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  contEventos: {
    width: '100%',
    height: 'auto',
    borderRadius: 15,
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
    marginTop: 10,
  },
  imgPerfil: {
    width: 60,
    height: 50,
    borderRadius: 13,
  },
  perfil: {
    width: '100%',
    height: 'auto',
    borderRadius: 16,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  menuLine: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
  linha: {
    marginTop: 5,
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notification: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  header: {
    overflow: 'hidden',
  },
  subLinha: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.8,
    height: '100%',
    padding: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  menuItem: {
    paddingVertical: 15,
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
    right: 0,
    padding: 10,
    zIndex: 15,
  },
  closeText: {
    fontSize: 25,
  },
});
