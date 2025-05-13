import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../path/ThemeContext';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomCalendar from '../Eventos/Calendario';
import ProximosEventos from '../Eventos/proximosEventos';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutButton from '../Gerais/logOut';

export default function HeaderIns() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [events, setEvents] = useState([]);
  const [eventColors, setEventColors] = useState({});
  const [institution, setInstitution] = useState(null);
  const navigation = useNavigation();

  // Função para gerar cor aleatória
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    try {
      // Busca os eventos
      const eventsResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event');
      const events = eventsResponse.data;

      // Gerar cores aleatórias para cada evento
      const colors = {};
      events.forEach(event => {
        colors[event.id] = getRandomColor();
      });

      setEvents(events);
      setEventColors(colors);

      // Busca os dados da instituição
      const institutionId = await AsyncStorage.getItem('@user_id');
      const institutionResponse = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/institution/${institutionId}`);
      setInstitution(institutionResponse.data);
    } catch (error) {

    }
  }, []);

  // Atualiza os dados quando o componente monta
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Atualiza os dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

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

  const formatDateTime = (date, time) => {
    const dateTimeString = `${date}T${time}`;
    return new Date(dateTimeString);
  };

  const formatTime = (dateTime) => {
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateTime) => {
    return dateTime.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
  };

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
          </View>
        </View>
      </View>

      {menuVisible && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

      <Animated.View
        style={[styles.menuOverlay, { transform: [{ translateX: menuTranslateX }], backgroundColor: isDarkMode ? '#141414' : '#1E6BE6' }]}
      >
        <ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
            <Text style={[styles.closeText, { color: closeButtonColor }]}>x</Text>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={[styles.perfil, { backgroundColor: profileBackgroundColor }]}>
              <View style={{ flexDirection: 'row', gap: 20 }}>
                <Image
                  style={styles.imgPerfil}
                  source={institution?.fotoPerfil
                    ? { uri: institution.fotoPerfil }
                    : require('../../assets/image/ins.png')}
                />
                <Text style={{ fontSize: 20, marginTop: 15, fontWeight: 'bold', color: textColor }}>
                  {institution?.nome || 'Instituição'}
                </Text>
              </View>
              <Image
                source={isDarkMode
                  ? require('../../assets/image/OptionWhite.png')
                  : require('../../assets/image/Option.png')}
                style={styles.options}
              />
            </View>
          </View>

          <View style={[styles.menuItem, { height: 'auto', borderRadius: 20 }]}>
            <CustomCalendar events={events} />
          </View>

          <View style={styles.menuItem}>
            <View style={[styles.contEventos, { backgroundColor: container }]}>
              <Text style={{ fontWeight: 'bold', color: textColor }}>Próximos Eventos</Text>
              <View>
                {events.length > 0 ? (
                  events.map((event, index) => {
                    const eventDateTime = formatDateTime(event.dataEvento, event.horarioEvento);
                    return (
                      <ProximosEventos
                        key={index}
                        data={eventDateTime.getDate()}
                        titulo={event.tituloEvento}
                        subData={formatDate(eventDateTime)}
                        periodo={formatTime(eventDateTime)}
                        color={eventColors[event.id] || '#0077FF'}
                      />
                    );
                  })
                ) : (
                  <Text style={{ color: textColor }}>Nenhum evento disponível.</Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.menuItem}>
            <LogoutButton
              iconColor="#e74c3c"
              textColor="#e74c3c"
              onLogoutSuccess={() => console.log('Logout realizado com sucesso')}
              onLogoutError={(error) => console.error('Erro no logout:', error)}
            />
          </View>
        </ScrollView>
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
    paddingBottom: 50
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