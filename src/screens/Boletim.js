import React from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import HeaderSimples from '../components/HeaderSimples';
import CardMateria from '../components/CardMateria';
import Nota from '../components/Nota';
import BarraAzul from '../components/barraAzul';

export default function Boletim() {
    const notas = [
        { materia: 'Português', nota: 98.5 },
        { materia: 'Matemática', nota: 75.6 },
        { materia: 'Inglês', nota: 90.6 },
        { materia: 'Ciências', nota: 60.2 },
        { materia: 'Artes', nota: 85.3 },
    ];

    return (
        <View style={styles.tela}>
            <HeaderSimples />
            <View style={{ alignItems: 'center', marginTop: 90 }}>
                <View style={styles.botao}>
                    <Text style={styles.textoBotao}>Selecione o Bimestre</Text>
                    <TouchableOpacity>
                        <View style={{
                            backgroundColor: '#0077FF',
                            padding: 10,
                            borderRadius: 20,
                            height: 28,
                            width: 28,
                            alignItems: 'center'
                        }}>
                            <Image style={styles.icone} source={require('../assets/image/OptionWhite.png')} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.boletim}>
                <View style={styles.titulos}>
                    <View style={styles.containers}>
                        <Text style={styles.contText}>
                            Matéria
                        </Text>
                    </View>
                    <View style={styles.containers}>
                        <Text style={styles.contText}>
                            1º Bim.
                        </Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <BarraAzul />
                    <View style={styles.column}>
                        <CardMateria materia="Português" />
                        <CardMateria materia="Matemática" />
                        <CardMateria materia="Inglês" />
                        <CardMateria materia="Ciências" />
                        <CardMateria materia="Artes" />
                    </View>
                    <View style={styles.column}>
                        <Nota nota="98.5" />
                        <Nota nota="75.6" />
                        <Nota nota="90.6" />
                        <Nota nota="60.2" />
                        <Nota nota="85.3" />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    boletim: {
        padding: 6
    },
    column: {
        marginTop: 30
    },
    contText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'Epilogue-Bold'
    },
    containers: {
        backgroundColor: '#073162',
        padding: 16,
        borderRadius: 13,
        width: 130,
        alignItems: 'center'
    },
    tela: {
        padding: 25,
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
    },
    titulos: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#073162',
        width: 350,
        padding: 10,
        borderRadius: 13,
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    textoBotao: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        marginRight: 10,
        fontWeight: 'bold'
    },
    icone: {
        width: 20,
        height: 12,
        marginTop: 0
    }
})