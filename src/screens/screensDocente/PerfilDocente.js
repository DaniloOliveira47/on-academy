import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Campo from '../../components/Perfil/Campo';
import { useTheme } from '../../path/ThemeContext';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilDocente() {
  const { isDarkMode } = useTheme();
  const [dadosAluno, setDadosAluno] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        console.log('userId recuperado:', userId);

        if (userId) {
          const response = await fetch(`http://192.168.15.120:3000/api/teacher/${userId}`);
          const data = await response.json();
          console.log('Dados do aluno:', data);
          setDadosAluno(data);
        } else {
          console.log('ID do usuário não encontrado no AsyncStorage');
        }
      } catch (error) {
       
      }
    };

    fetchUserData();
  }, []);

  const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const barraAzulColor = '#1E6BE6';
  const formBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';

  return (
    <View>
      <HeaderSimples titulo="PERFIL" />
      <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
        <View style={styles.conText}>
          <Text style={[styles.titulo, { color: textColor, textAlign: 'center' }]}>Bem-Vindo, Prof.{dadosAluno ? dadosAluno.nomeDocente : 'Carregando...'}</Text>
        </View>
        <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor }]} source={require('../../assets/image/barraAzul.png')} />
        <View style={[styles.form, {
          backgroundColor: formBackgroundColor, shadowColor: isDarkMode ? '#FFF' : '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }]}>
          {dadosAluno && (
            <>
              <View style={styles.linhaUser}>
                <Image source={require('../../assets/image/Perfill.png')} />
                <View style={styles.name}>
                  <Text style={[styles.nome, { color: textColor }]}>{dadosAluno.nomeDocente}</Text>
                  <Text style={[styles.email, { color: textColor }]}>{dadosAluno.emailDocente}</Text>
                </View>
              </View>
              <Campo label="Nome Completo" text={dadosAluno.nomeDocente} textColor={textColor} />
              <Campo label="Email" text={dadosAluno.emailDocente} textColor={textColor} />
              <Campo label="Registro" text={dadosAluno.identifierCode} textColor={textColor} />
              <View style={styles.doubleCampo}>
                <View style={styles.metadeCampo}>
                  <Campo label="Telefone" text={dadosAluno.telefoneDocente} textColor={textColor} />
                </View>
                <View style={styles.metadeCampo}>
                  <Campo label="Data de Nascimento" text={new Date(dadosAluno.dataNascimentoDocente).toLocaleDateString()} textColor={textColor} />
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
    padding: 20,
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
    width: 347,
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