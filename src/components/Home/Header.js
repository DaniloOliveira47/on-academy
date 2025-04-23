import React, { useState, useEffect } from 'react';
import { useTheme } from '../../path/ThemeContext';
import { Image, StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CustomCalendar from '../Eventos/Calendario';
import ProximosEventos from '../Eventos/proximosEventos';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [events, setEvents] = useState([]); // Estado para armazenar os eventos
  const [eventColors, setEventColors] = useState({}); // Estado para armazenar as cores dos eventos
  const [aluno, setAluno] = useState(null); // Estado para armazenar os dados do aluno
  const navigation = useNavigation();

  // Função para gerar uma cor aleatória
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
        // Busca os eventos
        const eventsResponse = await axios.get('http://10.92.198.51:3000/api/event');
        const events = eventsResponse.data;

        // Gerar cores aleatórias para cada evento
        const colors = {};
        events.forEach(event => {
          colors[event.id] = getRandomColor();
        });

        setEvents(events);
        setEventColors(colors); // Armazena as cores no estado

        // Busca os dados do aluno
        const alunoId = await AsyncStorage.getItem('@user_id'); // Obtém o ID do aluno logado
        const alunoResponse = await axios.get(`http://10.92.198.51:3000/api/student/${alunoId}`);
        setAluno(alunoResponse.data); // Armazena os dados do aluno
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

  // Função para formatar a data e o horário
  const formatDateTime = (date, time) => {
    const dateTimeString = `${date}T${time}`;
    return new Date(dateTimeString);
  };

  // Função para formatar o horário
  const formatTime = (dateTime) => {
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Função para formatar a data
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
                <Image
                  style={styles.imgPerfil}
                  source={aluno?.imageUrl ? { uri: aluno.imageUrl } : require('../../assets/image/Professor.png')}
                />

                <Text style={{ fontSize: 20, marginTop: 15, fontWeight: 'bold', color: textColor }}>
                  {aluno ? aluno.nome : 'Carregando...'} {/* Exibe o nome do aluno ou "Carregando..." */}
                </Text>
              </View>
              <Image source={isDarkMode ? require('../../assets/image/OptionWhite.png') : require('../../assets/image/Option.png')} style={styles.options} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuItem, { height: 'auto' }]}>
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
                      color={eventColors[event.id] || '#0077FF'} // Usa a cor do evento ou uma cor padrão
                    />
                  );
                })
              ) : (
                <Text style={{ color: textColor }}>Nenhum evento disponível.</Text>
              )}
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