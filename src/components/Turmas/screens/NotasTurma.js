import React from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import HeaderSimples from '../../Gerais/HeaderSimples';

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
  return (
    <View style={styles.tela}>
      <View style={{ padding: 20, paddingBottom: 0 }}>
        <HeaderSimples />
      </View>

      <View style={{ padding: 10 }}>
        <View style={styles.linha}>
          <Text style={{ fontWeight: 'bold', fontSize: 20 }}>Turma A - 1º Ano</Text>
          <Text style={{ color: '#8A8A8A', fontWeight: 'bold', fontSize: 16, marginTop: 3 }}>Nº0231000</Text>
        </View>

        {/* Container Branco envolvendo Input e Tabela */}
        <View style={styles.containerBranco}>
          {/* Input de Pesquisa */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome ou código da turma"
              placeholderTextColor="#756262"
            />
            <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
          </View>

          {/* Cabeçalho da Tabela */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 2 }]}>Nome do aluno</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Matrícula</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Média (%)</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Notas</Text>
          </View>

          {/* Lista de Alunos */}
          <FlatList
            data={alunos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.rowText, { flex: 2 }]}>{item.nome}</Text>
                <Text style={[styles.rowText, { flex: 1 }]}>{item.matricula}</Text>
                <Text style={[styles.rowText, { flex: 1 }]}>{item.media}</Text>
                <TouchableOpacity style={styles.notasButton}>
                  <Text style={styles.notasText}>Ver Notas</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F0F7FF'
  },
  containerBranco: {
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 15, 
    marginTop: 15,
    elevation: 3, 
    
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linha: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 50,
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
