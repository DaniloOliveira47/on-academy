import React, { useState, useEffect } from 'react';
import { useTheme } from '../../path/ThemeContext';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomCalendar from '../Eventos/Calendario';
import ProximosEventos from '../Eventos/proximosEventos';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LogoutButton from '../Gerais/logOut';

export default function HeaderDoc() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [events, setEvents] = useState([]);
  const [eventColors, setEventColors] = useState({});
  const [aluno, setAluno] = useState(null);
  const [showProfileHighlight, setShowProfileHighlight] = useState(false);

  const navigation = useNavigation();

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsResponse = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event');
        const events = eventsResponse.data;

        const colors = {};
        events.forEach(event => {
          colors[event.id] = getRandomColor();
        });

        setEvents(events);
        setEventColors(colors);

        const alunoId = await AsyncStorage.getItem('@user_id');
        const alunoResponse = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/${alunoId}`);
        setAluno(alunoResponse.data);
      } catch (error) {

      }
    };

    fetchData();
  }, []);

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
  const eventosFuturos = events
    .filter((event) => {
      const eventDateTime = formatDateTime(event.dataEvento, event.horarioEvento);
      return eventDateTime > new Date();
    })
    .sort((a, b) => {
      const dateA = formatDateTime(a.dataEvento, a.horarioEvento);
      const dateB = formatDateTime(b.dataEvento, b.horarioEvento);
      return dateA - dateB;
    });


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


        <ScrollView showsVerticalScrollIndicator={false} style={styles.menuScrollView} contentContainerStyle={styles.menuContent}>
          <View style={styles.menuItem}>

            <View style={[styles.perfil, { backgroundColor: profileBackgroundColor }]}>
              <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                <View style={{ backgroundColor: 'white', borderRadius: 16 }}>
                  <Image
                    style={styles.imgPerfil}
                    source={aluno?.imageUrl ? { uri: aluno.imageUrl } : require('../../assets/image/Professor.png')}
                  />
                </View>
                <Text style={{ fontSize: 20, marginTop: 15, fontWeight: 'bold', color: textColor }}>
                  {aluno ? aluno.nomeDocente.split(' ').slice(0, 2).join(' ') : 'Carregando...'}
                </Text>
              </View>

              <TouchableOpacity onPress={() => navigation.navigate('PerfilDocente')}>
                <View style={[styles.profileIconWrapper]}>
                  <Icon name="user" size={22} color={'#fff'} />
                </View>
              </TouchableOpacity>

            </View>

          </View>

          <View style={styles.menuItem}>
            <View style={styles.calendarWrapper}>
              <CustomCalendar events={events} />
            </View>
          </View>


          <View style={styles.menuItem}>
            <View style={[styles.contEventos, { backgroundColor: container }]}>
              <Text style={{ fontWeight: 'bold', color: textColor }}>Próximos Eventos</Text>
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >

                {eventosFuturos.length > 0 ? (
                  eventosFuturos.map((event, index) => {
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
                  <Text style={{ color: textColor }}>Nenhum evento futuro disponível.</Text>
                )}
              </ScrollView>
            </View>
            <View style={styles.menuItem}>
              <LogoutButton
                iconColor="#e74c3c"
                textColor="#e74c3c"
                onLogoutSuccess={() => console.log('Logout realizado com sucesso')}
                onLogoutError={(error) => console.error('Erro no logout:', error)}
              />
            </View>
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  logoutIcon: {
    marginRight: 10,
  },
  perfil: {
    width: '100%',
    padding: 12,
    borderRadius: 12, // Mais quadrado
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff10', // leve transparência
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12, // Mais quadrado
    backgroundColor: '#0077FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    transform: [{ rotate: '0deg' }],
  },


  logoutText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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
    height: 60,
    borderRadius: 12, // Mais quadrado
    borderWidth: 2,
    borderColor: '#0077FF',
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
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notification: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  calendarWrapper: {
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
    backgroundColor: '#fff', // ou a cor de fundo que preferir
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
  menuScrollView: {
    flex: 1,
  },
  menuContent: {
    paddingBottom: 20,
  },
});