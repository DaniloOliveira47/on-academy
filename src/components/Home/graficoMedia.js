import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { FontAwesome } from '@expo/vector-icons';

export default function GraficoMedia({ isDarkMode }) {
  const total = 100;
  const valorAtual = 50;
  const angulo = (valorAtual / total) * 180;

  const [modalVisible, setModalVisible] = useState(false);
  const [materiaSelecionada, setMateriaSelecionada] = useState("Média Geral");

  const materias = ["Português", "Matemática", "Ciências", "História", "Geografia", "Média Geral"];

  const calcularArco = (angulo) => {
    const radians = (Math.PI * (angulo - 180)) / 180;
    const x = 80 * Math.cos(radians);
    const y = 80 * Math.sin(radians);

    return `M -80 0 A 80 80 0 ${angulo > 180 ? 1 : 0} 1 ${x} ${y}`;
  };

  return (
    <View style={[styles.card, {
      backgroundColor: isDarkMode ? '#000' : '#FFFFFF', shadowColor: isDarkMode ? '#FFF' : '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#222' }]}>Frequência</Text>

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
        <Text style={[styles.valorAtual, { color: isDarkMode ? '#AAA' : '#666' }]}>Valor atual</Text>
        <Text style={[styles.valor, { color: isDarkMode ? '#FFF' : '#333' }]}>{valorAtual},0</Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#222' : '#FFF' }]}>
            <FlatList
              data={materias}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setMateriaSelecionada(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalText, { color: isDarkMode ? '#FFF' : '#333' }]}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    height: 200,
    marginTop: 30,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalText: {
    fontSize: 18,
  },
});
