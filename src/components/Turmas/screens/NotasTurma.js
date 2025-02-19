import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import CardMateria from '../../Turmas/CardMateria';
import CardNota from '../../Turmas/CardNota'


const alunos = [
  { id: '1', nome: 'Alice Fernandes', matricula: '2025001', media: '87%' },
  { id: '2', nome: 'Bianca Ferreira', matricula: '2025002', media: '72%' },
  { id: '3', nome: 'Bruno Oliveira', matricula: '2025003', media: '75%' },
  { id: '4', nome: 'Camila Souza', matricula: '2025004', media: '68%' },
  { id: '5', nome: 'Daniel Pereira', matricula: '2025005', media: '62%' },
  { id: '6', nome: 'Diego Santana', matricula: '2025006', media: '78%' },
  { id: '7', nome: 'Eduardo Lima', matricula: '2025007', media: '82%' },
  { id: '8', nome: 'Evelyn Moraes', matricula: '2025008', media: '89%' },
  { id: '9', nome: 'Felipe Andrade', matricula: '2025009', media: '91%' },
  { id: '10', nome: 'Fernanda Costa', matricula: '2025010', media: '63%' },
  { id: '11', nome: 'Gabriel Martins', matricula: '2025011', media: '87%' },
  { id: '12', nome: 'Giovanna Martins', matricula: '2025012', media: '90%' },
  { id: '13', nome: 'Heitor Vasconcelos', matricula: '2025013', media: '84%' },
  { id: '14', nome: 'Helena Rocha', matricula: '2025014', media: '77%' },
  { id: '15', nome: 'Igor Almeida', matricula: '2025015', media: '91%' },
  { id: '16', nome: 'Júlia Mendes', matricula: '2025016', media: '91%' },
  { id: '17', nome: 'Kaua Ribeiro', matricula: '2025017', media: '86%' },
  { id: '18', nome: 'Larissa Cardoso', matricula: '2025018', media: '82%' },
  { id: '19', nome: 'Matheus Freitas', matricula: '2025019', media: '88%' },
  { id: '20', nome: 'Natália Barbosa', matricula: '2025020', media: '79%' },
  { id: '21', nome: 'Otávio Nunes', matricula: '2025021', media: '65%' },
];

export default function NotasTurma() {
  const [modalVisible, setModalVisible] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  const abrirModal = (aluno) => {
    setAlunoSelecionado(aluno);
    setModalVisible(true);
  };

  return (
    <ScrollView>


      <View style={styles.tela}>
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <HeaderSimples />
        </View>

        <View style={{ padding: 10 }}>
          <View style={styles.linha}>
            <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Turma A - 1º Ano</Text>
            <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
          </View>


          <View style={styles.containerBranco}>

            <View style={styles.inputContainer}>
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
              <Text style={[styles.headerText, { flex: 1 }]}>Média (%)</Text>
              <Text style={[styles.headerText, { flex: 1 }]}>Notas</Text>
            </View>

            <FlatList
              data={alunos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={[styles.rowText, { flex: 2 }]}>{item.nome}</Text>
                  <Text style={[styles.rowText, { flex: 1 }]}>{item.matricula}</Text>
                  <Text style={[styles.rowText, { flex: 1 }]}>{item.media}</Text>
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
              <Text style={styles.modalTitle}>{alunoSelecionado?.nome}</Text>
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
    flex: 1,
    backgroundColor: '#F0F7FF',
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
