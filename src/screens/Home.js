import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Header from '../components/Header';
import GraficoMedia from '../components/graficoMedia';
import CardNota from '../components/cardNota';

export default function Home() {
  return (
    <View style={styles.tela}>
      <Header />
      
      <View style={styles.subtela}>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.titulo}>Seja bem-vinda, Livia 👋</Text>
            <Text style={styles.subtitulo}>
              O sucesso é a soma de pequenos esforços repetidos dia após dia.
            </Text>
          </View>
          <Image
            source={require('../assets/image/mulher.png')}
            style={styles.infoImage}
          />
        </View>

        <GraficoMedia />
      </View>
      <View style={styles.containerNotas}>
      <Text style={styles.tituloNotas}>
        Notas
      </Text>
      <CardNota/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    backgroundColor: '#DCE8F5',
    width: '100%',
    height: '100%',
  },
  subtela: {
    paddingTop: 20,
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E6BE6',
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    width: 150
  },
  subtitulo: {
    color: '#fff',
    fontSize: 14,
    width: 190
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
    paddingTop: 10
  }
});
