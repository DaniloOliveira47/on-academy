import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

export default function CardTurmas({ turma, alunos, periodo, numero, navegacao, turmaId }) {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const handleNavigate = () => {
        // Navegar apenas com os parâmetros
        navigation.navigate(navegacao, { turmaId }); // Agora a tela de destino é definida onde o componente é chamado
    };

    return (
        <View style={[styles.card, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
            <View style={styles.linha}>
                <Text style={{ fontWeight: 'bold', fontSize: 17, color: isDarkMode ? 'white' : 'black' }}>
                    {turma}
                </Text>
                <Text style={{ color: '#8A8A8A', fontWeight: 'bold', color: isDarkMode ? 'white' : 'black' }}>
                    {numero}
                </Text>
            </View>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}>
                {alunos}
            </Text>
            <Text style={[styles.subTexto, { color: isDarkMode ? 'white' : 'black' }]}>
                {periodo}
            </Text>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <TouchableOpacity onPress={handleNavigate} style={styles.botao}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                        Visualizar Turma
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        padding: 10,
        borderRadius: 15,
        marginBottom: 40,
    },
    botao: {
        backgroundColor: '#1A85FF',
        alignItems: 'center',
        width: 230,
        padding: 6,
        borderRadius: 8,
    },
    subTexto: {
        fontWeight: 'bold',
    },
    linha: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
