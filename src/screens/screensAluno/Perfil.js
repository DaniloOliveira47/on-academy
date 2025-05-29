import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Campo from '../../components/Perfil/Campo';
import { useTheme } from '../../path/ThemeContext';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderSimplesBack from '../../components/Gerais/HeaderSimplesBack';

export default function Perfil() {
  const { isDarkMode } = useTheme();
  const [dadosAluno, setDadosAluno] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(require('../../assets/image/Professor.png'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        console.log('userId recuperado:', userId);

        if (userId) {
          const response = await fetch(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${userId}`);
          const data = await response.json();
          console.log('Dados do aluno:', data);
          setDadosAluno(data);
          if (data.imageUrl) {
            setFotoPerfil({ uri: data.imageUrl });
          } else {
            setFotoPerfil(require('../../assets/image/Professor.png'));
          }
        } else {
          console.log('ID do usuário não encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do aluno:', error);

        setFotoPerfil(require('../../assets/image/Professor.png'));
      }
    };

    fetchUserData();
  }, []);

  const perfilBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const barraAzulColor = '#1E6BE6';
  const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';

  return (
    <View>
      <HeaderSimplesBack titulo="PERFIL" />
      <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
        <View style={styles.conText}>
          <Text style={[styles.titulo, { color: textColor, textAlign: 'center' }]}>Bem-Vindo(a), {dadosAluno ? dadosAluno.nome : 'Carregando...'}</Text>
        </View>
        <View>
          <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor }]} source={require('../../assets/image/barraAzul.png')} />
          <View style={[styles.form, {
            backgroundColor: formBackgroundColor,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }]}>
            {dadosAluno && (
              <>
                <View style={styles.linhaUser}>
                  <View style={{ backgroundColor: 'white', borderRadius: 40 }}>
                    <Image
                      source={fotoPerfil}
                      style={styles.fotoPerfil}
                      onError={() => setFotoPerfil(require('../../assets/image/Professor.png'))}
                      defaultSource={require('../../assets/image/Professor.png')}
                    />
                  </View>
                  <View style={styles.name}>
                    <Text style={[styles.nome, { color: textColor }]}>{dadosAluno.nome}</Text>
                    <Text style={[styles.email, { color: textColor }]}>{dadosAluno.emailAluno}</Text>
                    {dadosAluno.turma && (
                      <Text style={[styles.turma, { color: textColor }]}>Turma: {dadosAluno.turma.nomeTurma}</Text>
                    )}
                  </View>
                </View>
                <Campo label="Nome Completo" text={dadosAluno.nome} textColor={textColor} />
                <Campo label="Email" text={dadosAluno.emailAluno} textColor={textColor} />
                <Campo label="Nº Matrícula" text={dadosAluno.matriculaAluno} textColor={textColor} />
                <View style={styles.doubleCampo}>
                  <View style={styles.metadeCampo}>
                    <Campo label="Telefone" text={dadosAluno.telefoneAluno} textColor={textColor} />
                  </View>
                  <View style={styles.metadeCampo}>
                    <Campo label="Data de Nascimento" text={new Date(dadosAluno.dataNascimentoAluno).toLocaleDateString()} textColor={textColor} />
                  </View>
                </View>

              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    padding: 15,
    width: '100%',
    height: '100%',
  },
  conText: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
  },
  titulo: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  barraAzul: {
    width: '100%',
    height: 60,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    marginTop: 25,
  },
  form: {
    padding: 25,
    paddingBottom: 50,
    borderBottomRightRadius: 20,
     borderBottomLeftRadius: 20
  },
  linhaUser: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  fotoPerfil: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    marginTop: 15,
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 15,
  },
  turma: {
    fontSize: 14,
    marginTop: 5,
  },
  doubleCampo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metadeCampo: {
    flex: 1,
    marginHorizontal: 5,
  },
  disciplinasContainer: {
    marginTop: 15,
  },
  disciplinasTitulo: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  disciplina: {
    fontSize: 14,
    marginLeft: 10,
  },
});