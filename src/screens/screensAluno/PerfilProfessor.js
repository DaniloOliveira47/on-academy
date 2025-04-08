import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import Campo from '../../components/Perfil/Campo';
import axios from 'axios'; // Importe o axios

export default function ProfessorPerfil({ route }) {
  const { id } = route.params; 
  const { isDarkMode } = useTheme();
  const [dadosProfessor, setDadosProfessor] = useState(null);

  useEffect(() => {

    axios.get(`http://10.0.2.2:3000/api/teacher/${id}`)
      .then(response => {
        setDadosProfessor(response.data); 
      })
      .catch(error => {

      });
  }, [id]);

  const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const barraAzulColor = '#1E6BE6';
  const formBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <View>
      <HeaderSimples titulo="PERFIL DO PROFESSOR" />
      <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
     
        <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor, marginTop: 90 }]} source={require('../../assets/image/barraAzul.png')} />
        <View style={[styles.form, {
          backgroundColor: formBackgroundColor, shadowColor: isDarkMode ? '#FFF' : '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }]}>
          {dadosProfessor && (
            <>
              <View style={styles.linhaUser}>
                <Image source={require('../../assets/image/Perfill.png')} />
                <View style={styles.name}>
                  <Text style={[styles.nome, { color: textColor }]}>{dadosProfessor.nomeDocente}</Text>
                  <Text style={[styles.email, { color: textColor }]}>{dadosProfessor.emailDocente}</Text>
                </View>
              </View>
              <Campo label="Nome Completo" text={dadosProfessor.nomeDocente} textColor={textColor} />
              <Campo label="Email" text={dadosProfessor.emailDocente} textColor={textColor} />
              <Campo label="Telefone" text={dadosProfessor.telefoneDocente} textColor={textColor} />
              <View style={styles.doubleCampo}>
                <View style={styles.metadeCampo}>
                  <Campo label="Data de Nascimento" text={new Date(dadosProfessor.dataNascimentoDocente).toLocaleDateString()} textColor={textColor} />
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    padding: 25,
    width: '100%',
    height: '100%',
  },
  conText: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 40,
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  barraAzul: {
    width: 363,
    height: 60,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginTop: 25,
  },
  form: {
    padding: 25,
  },
  linhaUser: {
    flexDirection: 'row',
    gap: 10,
  },
  name: {
    marginTop: 15,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 15,
  },
  doubleCampo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metadeCampo: {
    flex: 1,
    marginHorizontal: 5,
  },
});