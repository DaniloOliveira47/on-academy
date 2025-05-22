import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function Avisos({ nome, horario, texto, abreviacao, aleatorio }) {
    const { isDarkMode } = useTheme();
    const contColor = isDarkMode ? '#FFF' : '#000';
    const BackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
    const container = isDarkMode ? '#000' : '#FFF';
    const text = isDarkMode ? '#FFF' : '#000';


    return (
        <View style={[styles.card, { borderColor: contColor, backgroundColor: BackgroundColor }]}>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>

                    <View style={[styles.circulo, { backgroundColor: aleatorio }]}>
                        <Text style={styles.Textcirculo}>{abreviacao}</Text>
                    </View>

                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: contColor }}>{nome}</Text>
                </View>

                <Text style={{ color: '#8A8A8A', fontSize: 12 }}>
                    {horario}
                </Text>
            </View>

            <View style={styles.mensagemContainer}>
                <Text style={[styles.mensagemTexto, { color: isDarkMode ? '#E0E0E0' : '#4A4A4A' }]}>
                    {texto}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%', marginLeft: 5
    },
    circulo: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF7E3E',
    },
    Textcirculo: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mensagemContainer: {
        marginTop: 10,
        marginLeft: 50,
    },
    mensagemTexto: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'left',
    },
});