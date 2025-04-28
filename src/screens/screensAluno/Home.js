import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native';
import axios from 'axios';
import Header from '../../components/Home/Header';
import GraficoMedia from '../../components/Home/graficoMedia';
import CardNota from '../../components/Home/cardNota';
import { useTheme } from '../../path/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avisos from '../../components/Home/Avisos';

export default function Home() {
  const { isDarkMode } = useTheme();
  const [aluno, setAluno] = useState(null);
  const [bimestreSelecionado, setBimestreSelecionado] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [avisos, setAvisos] = useState([]);

  const gerarCorAleatoria = () => {
    return '#0077FF';
  };

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const response = await axios.get('http://192.168.2.11:3000/api/reminder');
        const avisosOrdenados = response.data.sort((a, b) => b.id - a.id);
        setAvisos(avisosOrdenados);
      } catch (error) {
        console.error('Erro ao buscar avisos:', error);
      }
    };

    const fetchAluno = async () => {
      try {
        const alunoId = await AsyncStorage.getItem('@user_id');
        if (!alunoId) return;

        const response = await axios.get(`http://192.168.2.11:3000/api/student/${alunoId}`);
        setAluno(response.data);
      } catch (error) {
        console.error('Erro ao buscar aluno:', error);
      }
    };

    fetchAvisos();
    fetchAluno();
  }, []);

  const filtrarNotasPorBimestre = () => {
    if (!aluno || !aluno.notas) return [];
    return bimestreSelecionado ?
      aluno.notas.filter(nota => nota.bimestre === bimestreSelecionado) :
      aluno.notas;
  };

  return (
    <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
      <ScrollView>
        <Header isDarkMode={isDarkMode} />

        <View style={styles.subtela}>
          <View style={[styles.infoContainer, {
            backgroundColor: '#1E6BE6',
            shadowColor: isDarkMode ? '#FFF' : '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.titulo, { color: '#FFF' }]}>
                Seja bem-vindo, {aluno?.nome || ''} 👋
              </Text>
              <Text style={[styles.subtitulo, { color: '#FFF' }]}>
                O sucesso é a soma de pequenos esforços repetidos dia após dia.
              </Text>
            </View>
            <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
          </View>

          <GraficoMedia isDarkMode={isDarkMode} />

          <View style={styles.containerNotas}>
            <View style={styles.headerNotas}>
              <Text style={[styles.tituloNotas, { color: isDarkMode ? '#FFF' : '#000' }]}>Notas</Text>
              <TouchableOpacity
                style={[
                  styles.bimestreButton,
                  { backgroundColor: isDarkMode ? '#1E6BE6' : '#0077FF' }
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.bimestreButtonText}>
                  {bimestreSelecionado ? `${bimestreSelecionado}º Bimestre` : "Todas"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[
              styles.scrollContainer,
              {
                backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
                borderColor: isDarkMode ? '#333' : '#EEE',
              }
            ]}>
              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentContainer}
                indicatorStyle={isDarkMode ? 'white' : 'black'}
                nestedScrollEnabled={true}
              >
                {filtrarNotasPorBimestre().length > 0 ? (
                  filtrarNotasPorBimestre().map((nota, index) => (
                    <CardNota
                      key={index}
                      title={nota.nomeDisciplina}
                      subtitle={`Bimestre ${nota.bimestre} - ${nota.status}`}
                      percentage={nota.nota}
                      isDarkMode={isDarkMode}
                    />
                  ))
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={{
                      color: isDarkMode ? '#AAA' : '#888',
                      fontSize: 16,
                      textAlign: 'center'
                    }}>
                      Nenhuma nota encontrada.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        


            <View style={{
              backgroundColor: isDarkMode ? '#000' : '#FFF',
              width: '100%',
              borderRadius: 20,
              marginTop: 20,
              paddingBottom: 20,
              marginBottom: 50

            }}>
              <Text style={{
                fontSize: 24,
                fontWeight: 'bold',
                padding: 15,
                color: isDarkMode ? '#FFF' : '#000'
              }}>
                Avisos
              </Text>

              <View style={{ paddingHorizontal: 10 }}>
                {avisos.length > 0 ? (
                  avisos.map((aviso) => (
                    <Avisos
                      key={aviso.id}
                      abreviacao={aviso.initials}
                      nome={aviso.criadoPorNome.split(' ').slice(0, 2).join(' ')}
                      horario={new Date(aviso.horarioSistema).toLocaleTimeString([], {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      texto={aviso.conteudo}
                      aleatorio={gerarCorAleatoria()}
                    />
                  ))
                ) : (
                  <Text style={{
                    color: isDarkMode ? '#AAA' : '#888',
                    textAlign: 'center',
                    paddingVertical: 20
                  }}>
                    Nenhum aviso disponível.
                  </Text>
                )}
              </View>
            </View>
         
        </View>

      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, {
            backgroundColor: isDarkMode ? '#333' : '#FFF'
          }]}>
            <Text style={[styles.modalTitle, {
              color: isDarkMode ? '#FFF' : '#000'
            }]}>
              Selecione o Bimestre
            </Text>
            <FlatList
              data={['Todas as Notas', 1, 2, 3, 4]}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setBimestreSelecionado(item === 'Todas as Notas' ? null : item);
                    setModalVisible(false);
                  }}
                  style={styles.modalItem}
                >
                  <Text style={{
                    color: isDarkMode ? '#FFF' : '#000',
                    padding: 12,
                    fontSize: 16
                  }}>
                    {item === 'Todas as Notas' ? item : `${item}º Bimestre`}
                  </Text>
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
  tela: {
    width: '100%',
    height: '100%'
  },
  subtela: {
    paddingTop: 20,
    padding: 15,
    alignItems: 'center'
  },
  infoContainer: {
    flexDirection: 'row',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    height: 143,
    marginBottom: 20
  },
  textContainer: {
    width: 200
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  subtitulo: {
    fontSize: 14,
    marginTop: 5
  },
  infoImage: {
    position: 'absolute',
    right: -25,
    bottom: -7,
    width: 200,
    height: 150,
    resizeMode: 'contain'
  },
  containerNotas: {
    paddingTop: 10,
    width: '100%',
    marginBottom: 10
  },
  headerNotas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  tituloNotas: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bimestreButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  bimestreButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    maxHeight: 400,
    borderRadius: 12,
    borderWidth: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentContainer: {
    padding: 10,
    paddingBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    maxHeight: '60%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalItem: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center'
  }
});