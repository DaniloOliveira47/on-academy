import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Campo from '../../components/Perfil/Campo';
import { useTheme } from '../../path/ThemeContext';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilDocente() {
  const { isDarkMode } = useTheme();
  const [dadosDocente, setDadosDocente] = useState(null);
  const [fotoPerfil, setFotoPerfil] = useState(require('../../assets/image/Professor.png'));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('@user_id');
        console.log('userId recuperado:', userId);

        if (userId) {
          const response = await fetch(`http://192.168.2.11:3000/api/teacher/${userId}`);
          const data = await response.json();
          console.log('Dados do docente:', data);
          setDadosDocente(data);
          
          // Verifica se há uma URL de imagem no perfil
          if (data.imageUrl) { // Alterado para fotoDocente (ajuste conforme seu backend)
            setFotoPerfil({ uri: data.imageUrl });
          } else {
            setFotoPerfil(require('../../assets/image/Professor.png'));
          }
        } else {
          console.log('ID do usuário não encontrado no AsyncStorage');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do docente:', error);
        // Em caso de erro, manter a imagem padrão
        setFotoPerfil(require('../../assets/image/Professor.png'));
      }
    };

    fetchUserData();
  }, []);

  const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const barraAzulColor = '#1E6BE6';
  const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
  
  return (
    <View>
      <HeaderSimples titulo="PERFIL DOCENTE" />
      <View style={[styles.tela, { backgroundColor: perfilBackgroundColor }]}>
        <View style={styles.conText}>
          <Text style={[styles.titulo, { color: textColor, textAlign: 'center' }]}>
            Bem-Vindo(a), Prof. {dadosDocente ? dadosDocente.nomeDocente : 'Carregando...'}
          </Text>
        </View>
        <View>
          <Image style={[styles.barraAzul, { backgroundColor: barraAzulColor }]} source={require('../../assets/image/barraAzul.png')} />
          <View style={[styles.form, {
            backgroundColor: formBackgroundColor, 
            shadowColor: isDarkMode ? '#FFF' : '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }]}>
            {dadosDocente && (
              <>
                <View style={styles.linhaUser}>
                  <Image 
                    source={fotoPerfil} 
                    style={styles.fotoPerfil}
                    onError={() => setFotoPerfil(require('../../assets/image/Professor.png'))}
                    defaultSource={require('../../assets/image/Professor.png')}
                  />
                  <View style={styles.name}>
                    <Text style={[styles.nome, { color: textColor }]}>{dadosDocente.nomeDocente}</Text>
                    <Text style={[styles.email, { color: textColor }]}>{dadosDocente.emailDocente}</Text>
                  </View>
                </View>
                <Campo label="Nome Completo" text={dadosDocente.nomeDocente} textColor={textColor} />
                <Campo label="Email" text={dadosDocente.emailDocente} textColor={textColor} />
                <Campo label="Registro" text={dadosDocente.identifierCode} textColor={textColor} />
                <View style={styles.doubleCampo}>
                  <View style={styles.metadeCampo}>
                    <Campo label="Telefone" text={dadosDocente.telefoneDocente} textColor={textColor} />
                  </View>
                  <View style={styles.metadeCampo}>
                    <Campo label="Data de Nascimento" text={new Date(dadosDocente.dataNascimentoDocente).toLocaleDateString()} textColor={textColor} />
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
  doubleCampo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metadeCampo: {
    flex: 1,
    marginHorizontal: 5,
  },
});