import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList, Animated, Easing, Image } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GraficoMedia({ isDarkMode }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState("Média Geral");
  const [notas, setNotas] = useState([]);
  const [media, setMedia] = useState(0);
  const [materias, setMaterias] = useState(["Média Geral"]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const alunoId = await AsyncStorage.getItem('@user_id');
        if (!alunoId) {
          console.error('ID do aluno não encontrado no Async Storage');
          return;
        }

        const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${alunoId}`);
        console.log('Resposta da API:', response.data);

        if (response.data && Array.isArray(response.data.notas)) {
          setNotas(response.data.notas);
          calcularMedia(response.data.notas);
          extrairMaterias(response.data.notas);
          animateIn();
        }
      } catch (error) {

      }
    };

    fetchNotas();
  }, []);

  useEffect(() => {
    animateIn();
  }, [materiaSelecionada]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const calcularMedia = (notasLista) => {
    if (notasLista.length === 0) {
      setMedia(0);
      return;
    }
    const mediaGeral = notasLista.reduce((acc, nota) => acc + nota.nota, 0) / notasLista.length;
    setMedia(mediaGeral);
  };

  const extrairMaterias = (notasLista) => {
    const materiasExtraidas = [...new Set(notasLista.map(nota => nota.nomeDisciplina))];
    setMaterias(["Média Geral", ...materiasExtraidas]);
  };

  const obterMediaPorMateria = (materia) => {
    if (materia === "Média Geral") {
      return media;
    }
    const notasMateria = notas.filter(nota => nota.nomeDisciplina === materia);
    if (notasMateria.length === 0) return 0;
    return notasMateria.reduce((acc, nota) => acc + nota.nota, 0) / notasMateria.length;
  };

  const valorAtual = obterMediaPorMateria(materiaSelecionada);
  const total = 10;
  const angulo = (valorAtual / total) * 180;

  const calcularArco = (angulo) => {
    const radians = (Math.PI * (angulo - 180)) / 180;
    const x = 80 * Math.cos(radians);
    const y = 80 * Math.sin(radians);

    return `M -80 0 A 80 80 0 ${angulo > 180 ? 1 : 0} 1 ${x} ${y}`;
  };

  return (
    <Animated.View style={[styles.card, {
      backgroundColor: isDarkMode ? '#000' : '#FFFFFF',
      shadowColor: isDarkMode ? '#FFF' : '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
      opacity: fadeAnim,
      transform: [{
        scale: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1]
        })
      }]
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#222' }]}>Por Notas</Text>
        <TouchableOpacity style={styles.mediaContainer} onPress={() => setModalVisible(true)}>
          <Text style={[styles.mediaText, { color: isDarkMode ? '#BBB' : '#888' }]}>{materiaSelecionada}</Text>
          <FontAwesome name="caret-down" size={20} color={isDarkMode ? '#BBB' : '#888'} />
        </TouchableOpacity>
      </View>

      <View style={styles.graficoContainer}>
        <Svg height="300" width="300" viewBox="0 0 200 200">
          <G transform="translate(100, 100)">
            <Path
              d="M -80 0 A 80 80 0 1 1 80 0"
              fill="none"
              stroke="#8AB4F8"
              strokeWidth="12"
            />
            <Path
              d={calcularArco(angulo)}
              fill="none"
              stroke="#3F51B5"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <Text style={[styles.valorAtual, { color: isDarkMode ? '#AAA' : '#666' }]}>Média</Text>
        <Animated.Text
          style={[styles.valor, {
            color: isDarkMode ? '#FFF' : '#333',
            opacity: fadeAnim,
            transform: [{
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0]
              })
            }]
          }]}
        >
          {valorAtual.toFixed(1)}
        </Animated.Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
          activeOpacity={1}
        >
          <View style={[styles.modalContainer, {
            backgroundColor: isDarkMode ? '#141414' : '#FFF'
          }]}>
            {/* Cabeçalho com logo */}
            <View style={[styles.modalHeader, {
              backgroundColor: isDarkMode ? '#0077FF' : '#0077FF'
            }]}>
              <View style={[styles.logoSquare, {
                backgroundColor: isDarkMode ? '#333' : '#FFF'
              }]}>
                <Image
                  source={require('../../assets/image/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

            </View>


            <Text style={[styles.modalTitle, {
              color: isDarkMode ? '#FFF' : '#000'
            }]}>
              Selecione a Matéria
            </Text>


            <FlatList
              data={materias}
              keyExtractor={(item) => item}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, {
                    borderBottomColor: isDarkMode ? '#444' : '#EEE'
                  }]}
                  onPress={() => {
                    setMateriaSelecionada(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalText, {
                    color: isDarkMode ? '#FFF' : '#333'
                  }]}>
                    {item}
                  </Text>

                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    height: 200,
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  mediaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaText: {
    fontSize: 17,
    marginRight: 4,
  },
  graficoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  valorAtual: {
    position: 'absolute',
    top: '30%',
    fontSize: 15,
  },
  valor: {
    position: 'absolute',
    top: '40%',
    fontSize: 25,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    maxHeight: '70%',
  },
  modalHeader: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 25,
  },
  logoSquare: {
    width: 70,
    height: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 15,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  modalList: {
    width: '100%',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 16,
  },
});