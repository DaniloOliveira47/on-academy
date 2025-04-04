import React, { useState } from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [matricula, setMatricula] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeInput, setActiveInput] = useState(null); // Estado para controlar o campo ativo

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async () => {
    if (!matricula || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const usuario = {
      identifierCode: matricula,
      password: password,
    };

    let url = '';
    if (matricula.charAt(0).toLowerCase() === 'a') {
      url = 'http://192.168.15.120:3000/api/student/login';
    } else if (matricula.charAt(0).toLowerCase() === 'p') {
      url = 'http://192.168.15.120:3000/api/teacher/login';
    } else {
      url = 'http://192.168.15.120:3000/api/institution/login';
    }

    try {
      const response = await axios.post(url, usuario);
      const data = response.data;
      const token = data.token;

      if (token) {
        // Limpar o AsyncStorage antes de armazenar os novos dados
        await AsyncStorage.clear();

        await AsyncStorage.setItem('@user_token', token);

        // Decodificar o token para obter o ID do usuário
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub; // 'sub' contém o ID do usuário

        await AsyncStorage.setItem('@user_id', userId.toString());
        console.log('Token armazenado com sucesso!', token);
        console.log('ID do usuário:', userId);

        // Redirecionamento baseado no tipo de usuário
        if (matricula.charAt(0).toLowerCase() === 'a') {
          navigation.navigate('Main');
        } else if (matricula.charAt(0).toLowerCase() === 'p') {
          navigation.navigate('MainDoc');
        } else {
          navigation.navigate('MainIns');
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Erro', 'Credenciais inválidas. Verifique sua matrícula e senha.');
        } else {
          Alert.alert('Erro', 'Erro ao realizar o login. Tente novamente mais tarde.');
        }
      } else {
        Alert.alert('Erro', 'Erro de conexão. Verifique sua internet.');
      }
   
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000', '#000'] : ['#FFF', '#FFF']}
      style={[styles.tela, { backgroundColor: isDarkMode ? '#1A1A2E' : '#F5F5F5' }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.themeSwitch}>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons
                name={isDarkMode ? 'sunny' : 'moon'}
                size={30}
                color={isDarkMode ? '#FFF' : '#000'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            <Image style={styles.image} source={require('../assets/image/imageContainer.png')} />
          </View>

          <View style={[styles.subTela, { backgroundColor: isDarkMode ? '#1A1A2E' : '#E0DFEE' }]}>
            <View style={styles.contStyle}>
              <ImageBackground
                source={require('../assets/image/Objects.png')}
                style={styles.imageBackground}
              >
                <View style={styles.contText}>
                  <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black' }]}>
                    Bem-vindo à (On-Academy)
                  </Text>
                  <Text style={[styles.text, { color: isDarkMode ? '#A4A4A4' : '#555' }]}>
                    Acompanhe seu desempenho, receba notificações e explore recursos personalizados
                    para começar
                  </Text>
                </View>
              </ImageBackground>
            </View>

            <View style={styles.form}>
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDarkMode ? 'white' : '#EAEAEA',
                    borderColor: activeInput === 'matricula' ? '#0077FF' : 'transparent',
                    borderWidth: 2,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: isDarkMode ? 'black' : 'black' }]}
                  placeholder="Nº Matrícula"
                  placeholderTextColor="#756262"
                  value={matricula}
                  onChangeText={setMatricula}
                  onFocus={() => setActiveInput('matricula')}
                  onBlur={() => setActiveInput(null)}
                />
              </View>

              <View
                style={[
                  styles.inputContainer,
                  {
                    marginTop: 40,
                    backgroundColor: isDarkMode ? 'white' : '#EAEAEA',
                    borderColor: activeInput === 'password' ? '#0077FF' : 'transparent',
                    borderWidth: 2,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: isDarkMode ? 'black' : 'black' }]}
                  placeholder="Sua Senha"
                  placeholderTextColor="#756262"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                />

                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureText(!secureText)}
                >
                  <Ionicons
                    name={secureText ? 'eye-off-outline' : 'eye-outline'}
                    size={24}
                    color="#756262"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity>
                <Text style={[styles.forgotPassword, { color: isDarkMode ? '#A4A4A4' : '#0077FF' }]}>
                  Esqueceu sua Senha?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: isDarkMode ? '#0077FF' : '#0077FF' }]}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  themeSwitch: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 10,
  },
  imageContainer: {
    width: 400,
    height: 260,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    marginLeft: 15,
  },
  subTela: {
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 20,
  },
  contStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    paddingBottom: 50,
  },
  imageBackground: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Epilogue-Bold',
    fontSize: 35,
    textAlign: 'center',
    marginTop: 40,
  },
  contText: {
    width: 330,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  form: {
    marginTop: -20,
    paddingHorizontal: 40,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    padding: 20,
    fontSize: 14,
    fontFamily: 'Epilogue-Medium',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
  },
  forgotPassword: {
    fontSize: 13,
    textAlign: 'right',
    marginTop: 10,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});