import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import Header from '../components/Home/Header';
import GraficoMedia from '../components/Home/graficoMedia';
import CardNota from '../components/Home/cardNota';
import { useTheme } from '../path/ThemeContext';

export default function Home() {
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
      <ScrollView>
        <Header isDarkMode={isDarkMode} />

        <View style={styles.subtela}>
          <View style={[styles.infoContainer, {
            backgroundColor: isDarkMode ? '#1E6BE6' : '#1E6BE6',
            shadowColor: isDarkMode ? '#FFF' : '#000',
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
          }]}>
            <View style={styles.textContainer}>
              <Text style={[styles.titulo, { color: isDarkMode ? '#FFF' : '#fff' }]}>
                Seja bem-vinda, Livia 👋
              </Text>
              <Text style={[styles.subtitulo, { color: isDarkMode ? '#fff' : '#fff' }]}>
                O sucesso é a soma de pequenos esforços repetidos dia após dia.
              </Text>
            </View>
            <Image source={require('../assets/image/mulher.png')} style={styles.infoImage} />
          </View>

          <GraficoMedia isDarkMode={isDarkMode} />
        </View>

        <View style={styles.containerNotas}>
          <Text style={[styles.tituloNotas, { color: isDarkMode ? '#FFF' : '#000' }]}>Notas</Text>

          <CardNota
            title="Português"
            subtitle="Arthur"
            imageSource={require('../assets/image/português.png')}
            percentage={75}
            isDarkMode={isDarkMode}
          />
          <CardNota
            title="Matemática"
            subtitle="Giovanni"
            imageSource={require('../assets/image/matematica.png')}
            percentage={85}
            isDarkMode={isDarkMode}
          />
          <CardNota
            title="História"
            subtitle="Samuel"
            imageSource={require('../assets/image/ingles.png')}
            percentage={90}
            isDarkMode={isDarkMode}
          />
          <CardNota
            title="História"
            subtitle="Samuel"
            imageSource={require('../assets/image/ingles.png')}
            percentage={90}
            isDarkMode={isDarkMode}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    width: '100%',
    height: '100%',
  },
  subtela: {
    paddingTop: 20,
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    width: '90%',
    padding: 20,
    borderRadius: 20,
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    zIndex: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    width: 150,
  },
  subtitulo: {
    fontSize: 14,
    width: 190,
  },
  infoImage: {
    position: 'absolute',
    right: -25,
    bottom: -10,
    width: 200,
    height: 150,
    resizeMode: 'contain',
  },
  tituloNotas: {
    fontSize: 30,
  },
  containerNotas: {
    padding: 30,
    paddingTop: 10,
    marginBottom: 70
  },
});
