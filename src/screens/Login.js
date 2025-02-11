import React, { useState } from 'react';
import { Text, TextInput, View, Image, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login() {
  const [password, setPassword] = useState('');

  return (
    <LinearGradient colors={['#1A1A2E', '#151316']} style={styles.tela}>
      <View style={styles.container}>
        <Image style={styles.image} source={require('../assets/image/imageContainer.png')} />
      </View>



      <View style={styles.contStyle}>
        <LinearGradient colors={['rgba(0, 132, 255, 0.5)', 'transparent']} style={[styles.glow, styles.glow1]} />
        <LinearGradient colors={['rgba(255, 0, 255, 0.4)', 'transparent']} style={[styles.glow, styles.glow2]} />
        <LinearGradient colors={['rgba(255, 128, 0, 0.3)', 'transparent']} style={[styles.glow, styles.glow3]} />


        <ImageBackground source={require('../assets/image/Objects.png')} style={styles.imageBackground}>
          <View style={styles.contText}>
            <Text style={styles.title}>Bem-vindo à (plataforma)</Text>
            <Text style={styles.text}>
              Acompanhe seu desempenho, receba notificações e explore recursos personalizados para começar
            </Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Enter Email" placeholderTextColor="#756262" />
        </View>
        <View style={[styles.inputContainer, { marginTop: 50 }]}>
          <TextInput
            style={styles.input}
            placeholder="Enter Password"
            placeholderTextColor="#756262"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    marginLeft: 13,
    position: 'absolute',
    marginTop: 2,
  },
  tela: {
    flex: 1,
    width: '100%',
  },
  container: {
    width: 400,
    height: 260,
    backgroundColor: '#000',
  },
  contStyle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    paddingBottom: 50,

  },
  imageBackground: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    borderRadius: 20,

  },
  title: {
    fontFamily: 'Epilogue-Bold',
    color: 'white',
    fontSize: 35,
    textAlign: 'center',
    marginTop: 15,
  },
  contText: {
    width: 330,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  text: {
    color: '#A4A4A4',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 0,
  },
  form: {
    marginTop: -20,
    paddingHorizontal: 40,
  },
  input: {
    borderRadius: 8,
    padding: 20,
    color: 'black',
    fontSize: 13,
    backgroundColor: 'white',
    fontFamily: 'Epilogue-Medium',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    fontFamily: 'Epilogue-Bold',
  },
  glow: {
    position: 'absolute',
    borderRadius: 200,
    width: 250,
    height: 250,
    opacity: 0.2,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  glow1: {
    top: 30,
    left: -100,
  },
  glow2: {
    top: 20,
    right: -140,
  },
  glow3: {
    top: 450,
    right: 200,
  },
});
