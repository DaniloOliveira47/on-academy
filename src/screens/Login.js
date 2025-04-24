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
  ActivityIndicator
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
  const [activeInput, setActiveInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async () => {
    if (!matricula || !password) {
      Alert.alert('Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);

    const usuario = {
      identifierCode: matricula,
      password: password,
    };

    let url = '';
    if (matricula.charAt(0).toLowerCase() === 'a') {
      url = 'http://10.92.198.51:3000/api/student/login';
    } else if (matricula.charAt(0).toLowerCase() === 'p') {
      url = 'http://10.92.198.51:3000/api/teacher/login';
    } else {
      url = 'http://10.92.198.51:3000/api/institution/login';
    }

    try {
      const response = await axios.post(url, usuario);
      const data = response.data;
      const token = data.token;

      if (token) {
        await AsyncStorage.clear();
        await AsyncStorage.setItem('@user_token', token);

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub;

        await AsyncStorage.setItem('@user_id', userId.toString());
        console.log('Token armazenado com sucesso!', token);
        console.log('ID do usuário:', userId);

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
          Alert.alert('Matrícula ou senha inválida, verifique os campos');
        } else {
          Alert.alert('Falha no login, tente novamente mais tarde');
        }
      } else {
        Alert.alert('Erro de conexão. Verifique sua internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000', '#000'] : ['#FFF', '#FFF']}
      style={[styles.tela, { backgroundColor: isDarkMode ? '#1A1A2E' : '#F5F5F5' }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
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

          <LinearGradient
            colors={isDarkMode ? ['#1A1A2E', '#16213E'] : ['#E0DFEE', '#D1D0E0']}
            style={styles.subTela}
          >
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

            <LinearGradient
              colors={isDarkMode ? ['#16213E', '#0F3460'] : ['#D1D0E0', '#C1C0D0']}
              style={styles.formContainer}
            >
              <View style={styles.form}>
                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
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
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
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
                  style={[styles.button, { backgroundColor: '#0077FF' }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </LinearGradient>
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
    width: '100%',
    height: 260,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    marginLeft: 9
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
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Epilogue-Medium',
  },
  formContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginTop: -30,
  },
  form: {
    paddingHorizontal: 20,
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
    fontFamily: 'Epilogue-Medium',
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
    fontFamily: 'Epilogue-Bold',
  },
});