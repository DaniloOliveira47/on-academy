import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function Avisos({ nome, horario, texto, abreviacao, aleatorio }) {
    const { isDarkMode } = useTheme();
    const contColor = isDarkMode ? '#FFF' : '#000';

    return (
        <View style={[styles.card, { borderColor: contColor }]}>
            {/* Cabeçalho da mensagem */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {/* Ícone do remetente */}
                    <View style={[styles.circulo, { backgroundColor: aleatorio }]}>
                        <Text style={styles.Textcirculo}>{abreviacao}</Text>
                    </View>
                    {/* Nome do remetente */}
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: contColor }}>{nome}</Text>
                </View>
                {/* Horário da mensagem */}
                <Text style={{ color: '#8A8A8A', fontSize: 12 }}>
                    {horario}
                </Text>
            </View>

            {/* Corpo da mensagem */}
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
        backgroundColor: '#FFFFFF', // Fundo branco para o card
        borderRadius: 10, // Bordas arredondadas
        padding: 15, // Espaçamento interno
        marginVertical: 5, // Espaçamento entre as mensagens
        shadowColor: '#000', // Sombra para efeito de profundidade
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // Sombra no Android
    },
    circulo: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20, // Torna o ícone circular
        backgroundColor: '#FF7E3E', // Cor de fundo padrão
    },
    Textcirculo: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mensagemContainer: {
        marginTop: 10, // Espaçamento entre o cabeçalho e o texto
        marginLeft: 50, // Alinhamento com o ícone
    },
    mensagemTexto: {
        fontSize: 14,
        lineHeight: 20, // Melhora a legibilidade
        textAlign: 'left', // Alinhamento do texto
    },
});