import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import axios from 'axios';
import Header from '../../components/Home/Header';
import GraficoMedia from '../../components/Home/graficoMedia';
import CardNota from '../../components/Home/cardNota';
import { useTheme } from '../../path/ThemeContext';
import Avisos from '../../components/Home/Avisos';

export default function Home() {
  const { isDarkMode } = useTheme();
  const [aluno, setAluno] = useState(null);
  const [bimestreSelecionado, setBimestreSelecionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchAluno = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:3000/api/student/1');
        setAluno(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);
      }
    };

    fetchAluno();
  }, []);

  const filtrarNotasPorBimestre = () => {
    if (!aluno || !aluno.notas) return [];
    return bimestreSelecionado ? aluno.notas.filter(nota => nota.bimestre === bimestreSelecionado) : aluno.notas;
  };

  return (
    <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
      <ScrollView>
        <Header isDarkMode={isDarkMode} />
        <View style={styles.subtela}>
          <View style={[styles.infoContainer, {
            backgroundColor: isDarkMode ? '#1E6BE6' : '#1E6BE6',
            shadowColor: isDarkMode ? '#FFF' : '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.titulo, { color: isDarkMode ? '#FFF' : '#fff' }]}>
                Seja bem-vindo,  👋
              </Text>
              <Text style={[styles.subtitulo, { color: isDarkMode ? '#fff' : '#fff' }]}>
                O sucesso é a soma de pequenos esforços repetidos dia após dia.
              </Text>
            </View>
            <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
          </View>
          <GraficoMedia isDarkMode={isDarkMode} />
        </View>
        <View style={styles.containerNotas}>
          <View style={styles.headerNotas}>
            <Text style={[styles.tituloNotas, { color: isDarkMode ? '#FFF' : '#000' }]}>Notas</Text>
            <TouchableOpacity style={styles.bimestreButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.bimestreButtonText}>{bimestreSelecionado ? `${bimestreSelecionado}º Bimestre` : "Selecionar"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.scrollContainer}>
            <ScrollView
              style={styles.scrollContent}
              indicatorStyle={isDarkMode ? 'white' : 'default'} // Personaliza a cor da barra de rolagem
              nestedScrollEnabled={true} // Permite rolagem independente
            >
              {filtrarNotasPorBimestre().length > 0 ? (
                filtrarNotasPorBimestre().map((nota, index) => (
                  <CardNota
                    key={index}
                    title={nota.nomeDisciplina}
                    subtitle={`Bimestre ${nota.bimestre} - ${nota.status}`}
                    imageSource={require('../../assets/image/matematica.png')}
                    percentage={nota.nota}
                    isDarkMode={isDarkMode}
                  />
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: isDarkMode ? '#FFF' : '#000' }}>Nenhuma nota encontrada.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#000' }]}>Selecione o Bimestre</Text>
            <FlatList
              data={[1, 2, 3, 4]}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => { setBimestreSelecionado(item); setModalVisible(false); }}>
                  <Text style={{ color: isDarkMode ? '#FFF' : '#000' }}>{item}º Bimestre</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { width: '100%', height: '100%' },
  subtela: { paddingTop: 20, alignItems: 'center' },
  infoContainer: { flexDirection: 'row', width: '90%', padding: 20, borderRadius: 20, height: 143 },
  textContainer: { width: 200 },
  titulo: { fontSize: 18, fontWeight: 'bold' },
  subtitulo: { fontSize: 14 },
  infoImage: { position: 'absolute', right: -25, bottom: -10, width: 200, height: 150, resizeMode: 'contain' },
  containerNotas: { padding: 30, paddingTop: 10, marginBottom: 30 },
  headerNotas: { flexDirection: 'row', justifyContent: 'space-between' },
  tituloNotas: { fontSize: 30 },
  bimestreButton: { backgroundColor: '#1E6BE6', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  bimestreButtonText: { color: '#FFF', fontSize: 16 },
  scrollContainer: { 
    flex: 1, // Ocupa o espaço disponível
    maxHeight: 400, // Define uma altura máxima para o ScrollView
  },
  scrollContent: {
    flexGrow: 1, 
    padding: 10
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '80%', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});