import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Campo from '../components/Perfil/Campo';
import { useTheme } from '../path/ThemeContext';
import HeaderSimples from '../components/Gerais/HeaderSimples';

export default function Perfil() {
  const { isDarkMode } = useTheme();


  const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
  const formBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (

    <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
      <HeaderSimples
        titulo="PERFIL"
      />
      <View style={styles.conText}>
        <Text style={[styles.titulo, { color: textColor }]}>
          Bem-Vinda, Renata
        </Text>
        <Text style={[styles.subTitulo, { color: textColor }]}>Tue, 07 June 2022</Text>
      </View>

      <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor }]} source={require('../assets/image/barraAzul.png')} />
      <View style={[styles.form, {
        backgroundColor: formBackgroundColor, shadowColor: isDarkMode ? '#FFF' : '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }]}>
        <View style={styles.linhaUser}>
          <Image source={require('../assets/image/Perfill.png')} />
          <View style={styles.name}>
            <Text style={[styles.nome, { color: textColor }]}>
              Renata Vieira
            </Text>
            <Text style={[styles.email, { color: textColor }]}>
              revieira@gmail.com
            </Text>
          </View>
        </View>
        <Campo
          label="Nome Completo"
          text="Renata Vieira de Souza"
          textColor={textColor}
        />
        <Campo
          label="Email"
          text="revieira@gmail.com"
          textColor={textColor}
        />
        <Campo
          label="Nº Matrícula"
          text="1106434448-1"
          textColor={textColor}
        />
        <View style={styles.doubleCampo}>
          <Campo
            label="Telefone"
            text="(11) 95312-8203"
            textColor={textColor}
          />
          <Campo
            label="Data de Nascimento"
            text="23/01/2006"
            textColor={textColor}
          />
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
  subTitulo: {
    fontWeight: 'bold',
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
});
