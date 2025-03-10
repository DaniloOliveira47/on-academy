import React, { useState } from 'react';
import { Text, TextInput, View, Image, ImageBackground, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [matricula, setMatricula] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };


  const handleLogin = async () => {

    if (!matricula || !password) {
      Alert.alert('Por Favor, preencha todos os campos');
      return;
    }

    const usuario = {
      identifierCode: matricula,
      password: password,
    };

    if (matricula.charAt(0) === "a") {
      try {
        const response = await axios.post('http://10.0.2.2:3000/api/student/login', usuario);
        Alert.alert('Seja Bem-Vindo Aluno!');

        const data = response.data;
        const token = data.token;


        if (token) {
          await AsyncStorage.setItem('@user_token', token);
          console.log("Token armazenado com sucesso!", token);
          navigation.navigate('Main');
        }


      } catch (error) {
        Alert.alert('Erro', 'Falha ao Realizar o Login');
        console.error(error);
      }
    } else if (matricula.charAt(0) === "p") {
      try {
        const response = await axios.post('http://10.0.2.2:3000/api/teacher/login', usuario);
        Alert.alert('Seja Bem-Vindo Professor!');

        const data = response.data;
        const token = data.token;
        if (token) {
          await AsyncStorage.setItem('@user_token', token);
          console.log("Token armazenado com sucesso!", token);
          navigation.navigate('MainDoc');
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha ao Realizar o Login');
        console.error(error);
      }
    } else {
      try {
        const response = await axios.post('http://10.0.2.2:3000/api/institution/login', usuario);
        Alert.alert('Seja Bem-Vindo Instituição!');

        const data = response.data;
        const token = data.token;
        if (token) {
          await AsyncStorage.setItem('@user_token', token);
          console.log("Token armazenado com sucesso!", token);
          navigation.navigate('MainIns');
        }
      } catch (error) {
        Alert.alert('Erro', 'Falha ao Realizar o Login');
        console.error(error);
      }
    }

  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000', '#000'] : ['#FFF', '#FFF']}
      style={[styles.tela, { backgroundColor: isDarkMode ? '#1A1A2E' : '#F5F5F5' }]}
    >
      <View style={styles.themeSwitch}>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons name={isDarkMode ? "sunny" : "moon"} size={30} color={isDarkMode ? "#FFF" : "#000"} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Image style={styles.image} source={require('../assets/image/imageContainer.png')} />
      </View>

      <View style={[styles.subTela, { backgroundColor: isDarkMode ? '#1A1A2E' : '#E0DFEE' }]}>
        <View style={styles.contStyle}>
          <Image style={{
            position: 'absolute',
            right: 100,
            top: 400
          }} source={require('../assets/image/Radial.png')} />
          <Image style={{
            position: 'absolute',
            left: 130,
            top: 450
          }} source={require('../assets/image/Radial.png')} />
          <Image style={{
            position: 'absolute',
            left: 200,
            top: -30
          }} source={require('../assets/image/Radial.png')} />
          <Image style={{
            position: 'absolute',
            right: 200,
            top: -30,
          }} source={require('../assets/image/Radial.png')} />
          <ImageBackground source={require('../assets/image/Objects.png')} style={styles.imageBackground}>
            <View style={styles.contText}>
              <Text style={[styles.title, { color: isDarkMode ? 'white' : 'black' }]}>Bem-vindo à (On-Academy)</Text>
              <Text style={[styles.text, { color: isDarkMode ? '#A4A4A4' : '#555' }]}>
                Acompanhe seu desempenho, receba notificações e explore recursos personalizados para começar
              </Text>
            </View>

          </ImageBackground>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'white' : '#EAEAEA' }]}>
            <TextInput
              style={[styles.input, { color: isDarkMode ? 'black' : 'black' }]}
              placeholder="Nº Matrícula"
              placeholderTextColor="#756262"
              value={matricula}
              onChangeText={setMatricula}
            />
          </View>

          <View style={[styles.inputContainer, { marginTop: 40, backgroundColor: isDarkMode ? 'white' : '#EAEAEA' }]}>
            <TextInput
              style={[styles.input, { color: isDarkMode ? 'black' : 'black' }]}
              placeholder="Sua Senha"
              placeholderTextColor="#756262"
              secureTextEntry={secureText}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.eyeIcon} onPress={() => setSecureText(!secureText)}>
              <Ionicons name={secureText ? "eye-off-outline" : "eye-outline"} size={24} color="#756262" />
            </TouchableOpacity>

          </View>
          <TouchableOpacity>
            <Text style={[styles.forgotPassword, { color: isDarkMode ? '#A4A4A4' : '#0077FF' }]}>Esqueceu sua Senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDarkMode ? '#0077FF' : '#0077FF' }]}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
} // /api/student/login

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    width: '100%',
  },
  themeSwitch: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 10,
  },
  container: {
    width: 400,
    height: 260,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    marginLeft: 15
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
  radial: {
    position: 'absolute',
    right: 100,
    top: 400,
  },
  imageBackground: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 16
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

