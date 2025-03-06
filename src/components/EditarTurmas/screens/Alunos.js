import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';
import { useTheme } from '../../../path/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import CadastroAlunoModal from '../ModalCadAluno';

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

export default function Alunos() {
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const { isDarkMode } = useTheme();
  const [modalCriarVisible, setModalCriarVisible] = useState(false);
  const navigation = useNavigation();

  return (
    <ScrollView style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
      <HeaderSimples />
      <View style={{ padding: 10 }}>
        <View style={styles.linha}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>Turma A - 1º Ano</Text>
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
            <Text style={[styles.headerText, { flex: 1 }]}>Média (%)</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Perfil</Text>
          </View>

          {/* Aqui é onde substituímos o FlatList por ScrollView com map */}
          <ScrollView>
            {alunos.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.rowText, { flex: 2, color: isDarkMode ? 'white' : 'black' }]}>{item.nome}</Text>
                <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{item.matricula}</Text>
                <Text style={[styles.rowText, { flex: 1, color: isDarkMode ? 'white' : 'black' }]}>{item.media}</Text>
                <TouchableOpacity style={styles.notasButton} onPress={() => navigation.navigate('PerfilAluno')}>
                  <Text style={styles.notasText}>Visualizar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={{ flex: 1, width: '100%', alignItems: 'flex-end', marginTop: 10 }}>
            <TouchableOpacity style={styles.botaoCriar} onPress={() => setModalCriarVisible(true)}>
              <Icon name="plus" size={24} color="white" />
            </TouchableOpacity>
            <CadastroAlunoModal visible={modalCriarVisible} onClose={() => setModalCriarVisible(false)} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    paddingBottom: 50,
  },
  botaoCriar: {
    backgroundColor: '#1A85FF',
    width: 56,
    height: 56,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
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
    marginBottom: 40
  },
  linha: {
    marginTop: -5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
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
});
