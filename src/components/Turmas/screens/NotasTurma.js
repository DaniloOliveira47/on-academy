import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import CardMateria from '../../Turmas/CardMateria';
import CardNota from '../../Turmas/CardNota';
import { useTheme } from '../../../path/ThemeContext';
import axios from 'axios';

export default function NotasTurma() {
  const [modalVisible, setModalVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const { isDarkMode } = useTheme();
  const [alunos, setAlunos] = useState([]);
  const [turmaInfo, setTurmaInfo] = useState({ nomeTurma: '', periodoTurma: '' });

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:3000/api/class/students/4');
        setTurmaInfo({
          nomeTurma: response.data.nomeTurma,
          periodoTurma: response.data.periodoTurma
        });
        setAlunos(response.data.students);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      }
    };

    fetchAlunos();
  }, []);

  const abrirModal = (aluno) => {
    setAlunoSelecionado(aluno);
    setModalVisible(true);
  };

  return (
    <ScrollView>
      <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', height: 800}]}>
        <HeaderSimples />
        <View style={{ padding: 10 }}>
          <View style={styles.linha}>
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>
              {turmaInfo.nomeTurma} - {turmaInfo.periodoTurma}
            </Text>
            <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
          </View>

          <View style={[styles.containerBranco, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome ou código da turma"
                placeholderTextColor="#756262"
              />
              <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
            </View>

            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, { flex: 2 }]}>Nome do aluno</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Matrícula</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>  Média(%)</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Notas</Text>
            </View>

            <FlatList
              data={alunos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, { flex: 2, color: isDarkMode ? 'white' : 'black' }]}>{item.nomeAluno}</Text>
                  <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{item.identifierCode}</Text>
                  <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>N/A</Text>
                  <TouchableOpacity style={styles.notasButton} onPress={() => abrirModal(item)}>
                    <Text style={styles.notasText}>Ver Notas</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>

        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{alunoSelecionado?.nomeAluno}</Text>
              <View style={styles.contBoletim}>
                <View style={styles.columnMateria}>
                  <CardMateria
                    materia="Português"
                  />
                  <CardMateria
                    materia="Matemática"
                  />
                  <CardMateria
                    materia="Inglês"
                  />
                  <CardMateria
                    materia="Ciências"
                  />
                  <CardMateria
                    materia="Artes"
                  />
                </View>
                <View style={styles.columnNotas}>
                  <CardNota
                    nota="98.5"
                  />
                  <CardNota
                    nota="75.6"
                  />
                  <CardNota
                    nota="90.6"
                  />
                  <CardNota
                    nota="60.2"
                  />
                  <CardNota
                    nota="85.3"
                  />
                </View>
              </View>
              <TouchableOpacity style={styles.fecharButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.fecharText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
   
    backgroundColor: '#F0F7FF',
    paddingBottom: 50,
  },
  contBoletim: {
    flexDirection: 'row',
    gap: 40
  },
  containerBranco: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linha: {
    marginTop: -5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A85FF',
    borderRadius: 25,
    width: '100%',
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A85FF',
    padding: 10,
    borderRadius: 5,
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  rowText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  notasButton: {
    flex: 1,
    alignItems: 'center',
  },
  notasText: {
    color: '#1A85FF',
    fontWeight: 'bold',
  },

  /* Estilos do Modal */
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalNotas: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A85FF',
    marginTop: 10,
    textAlign: 'center',
  },
  fecharButton: {
    marginTop: 15,
    backgroundColor: '#1A85FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  fecharText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});