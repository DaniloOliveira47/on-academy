import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '../path/ThemeContext';
import CustomAlert from '../components/Gerais/CustomAlert';

export default function Login() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [matricula, setMatricula] = useState('');
  const [secureText, setSecureText] = useState(true);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [activeInput, setActiveInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Animação da tela inteira
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const fetchInstitutionData = async (userId) => {
    try {
      const response = await axios.get('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/institution');
      const institutions = response.data;
      const loggedInInstitution = institutions.find(inst => inst.id.toString() === userId);

      if (loggedInInstitution) {
        await AsyncStorage.setItem('@institution_data', JSON.stringify(loggedInInstitution));
      }
    } catch (error) {
      console.error('Erro ao buscar dados da instituição:', error);
    }
  };

  const handleLogin = async () => {
    const matriculaTrimmed = matricula.trim();
    const passwordTrimmed = password.trim();

    if (!matriculaTrimmed || !passwordTrimmed) {
      setAlertTitle('Campos obrigatórios');
      setAlertMessage('Preencha todos os campos para continuar.');
      setAlertVisible(true);
      return;
    }

    if (matriculaTrimmed.length < 4 || passwordTrimmed.length < 4) {
      setAlertTitle('Dados muito curtos');
      setAlertMessage('Matrícula e senha devem ter pelo menos 4 caracteres.');
      setAlertVisible(true);
      return;
    }

    const matriculaRegex = /^[a-zA-Z0-9]+$/;
    if (!matriculaRegex.test(matriculaTrimmed)) {
      setAlertTitle('Matrícula Inválida');
      setAlertMessage('A matrícula deve conter apenas letras e números, sem espaços ou símbolos.');
      setAlertVisible(true);
      return;
    }

    setIsLoading(true);

    const usuario = {
      identifierCode: matriculaTrimmed,
      password: passwordTrimmed,
    };

    const firstChar = matriculaTrimmed[0]?.toLowerCase();
    let url = '';
    if (firstChar === 'a') {
      url = 'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/login';
    } else if (firstChar === 'p') {
      url = 'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/teacher/login';
    } else {
      url = 'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/institution/login';
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

        if (firstChar === 'a') {
           navigation.replace('Main');
        } else if (firstChar === 'p') {
           navigation.replace('MainDoc');
        } else {
          await fetchInstitutionData(userId);
          navigation.replace('MainIns');

        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setAlertTitle('Erro de Login');
        setAlertMessage('Matrícula ou senha inválida, verifique os campos.');
      } else {
        setAlertTitle('Erro de Conexão');
        setAlertMessage('Erro de conexão. Verifique sua internet.');
      }
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        transform: [{ translateY: translateAnim }],
      }}
    >
      <LinearGradient
        colors={isDarkMode ? ['#000', '#000'] : ['#FFF', '#FFF']}
        style={[styles.tela, { backgroundColor: isDarkMode ? '#F0F7FF' : '#F5F5F5' }]}
      >
        {/* Brilhos decorativos (se estiver usando) */}
        <LinearGradient colors={['#9F44D3', 'transparent']} style={[styles.glow, { top: 100, left: -50 }]} />
        <LinearGradient colors={['#7F00FF', 'transparent']} style={[styles.glow, { bottom: 100, right: -60 }]} />

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled" bounces={false}>
          <View style={styles.themeSwitch}>
            <TouchableOpacity onPress={toggleTheme}>
              <Ionicons name={isDarkMode ? 'sunny' : 'moon'} size={30} color={isDarkMode ? '#FFF' : '#000'} />
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
                    Bem-vindo à On-Academy
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
                <View style={[styles.inputContainer, {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
                  borderColor: activeInput === 'matricula' ? '#0077FF' : 'transparent',
                  borderWidth: 2,
                }]}>
                  <TextInput
                    style={[styles.input, { color: 'black' }]}
                    placeholder="Nº Matrícula"
                    placeholderTextColor="#756262"
                    value={matricula}
                    onChangeText={setMatricula}
                    onFocus={() => setActiveInput('matricula')}
                    onBlur={() => setActiveInput(null)}
                  />
                </View>

                <View style={[styles.inputContainer, {
                  marginTop: 40,
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.8)',
                  borderColor: activeInput === 'password' ? '#0077FF' : 'transparent',
                  borderWidth: 2,
                }]}>
                  <TextInput
                    style={[styles.input, { color: 'black' }]}
                    placeholder="Sua Senha"
                    placeholderTextColor="#756262"
                    secureTextEntry={secureText}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setActiveInput('password')}
                    onBlur={() => setActiveInput(null)}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
                    <Ionicons name={secureText ? 'eye-off-outline' : 'eye-outline'} size={24} color="#756262" />
                  </TouchableOpacity>
                </View>

            

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

        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onDismiss={() => setAlertVisible(false)}
        />
      </LinearGradient>
    </Animated.View>
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
    height: 65
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
  glow: {
  position: 'absolute',
  width: 200,
  height: 200,
  borderRadius: 100,
  opacity: 0.3,
  zIndex: -1,
},

});