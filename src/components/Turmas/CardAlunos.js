import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { Text, TouchableOpacity } from 'react-native';
import { Image, StyleSheet, View } from 'react-native'
import { useTheme } from '../../path/ThemeContext';


export default function CardAlunos({ nome, alunoId, navegacao, fotoAluno }) {
    const { isDarkMode } = useTheme();
    const navigation = useNavigation();

    const handleNavigate = () => {
        navigation.navigate(navegacao, { alunoId });
    };

    const imagemValida = fotoAluno && (fotoAluno.startsWith('http') || fotoAluno.startsWith('file'));

    return (
        <TouchableOpacity onPress={handleNavigate} style={[styles.container, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
            <View style={[styles.imageContainer, { borderColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
                {imagemValida ? (
                    <Image
                        style={styles.image}
                        source={{ uri: fotoAluno }}
                        defaultSource={require('../../assets/image/Professor.png')}
                        onError={() => console.log("Erro ao carregar imagem do aluno")}
                    />
                ) : (
                    <Image
                        style={[styles.image, { backgroundColor: 'white' }]}
                        source={require('../../assets/image/Professor.png')}
                    />
                )}
            </View>
            <Text style={{ marginTop: 50, fontWeight: 'bold', color: isDarkMode ? 'white' : 'black', textAlign: 'center', padding: 5 }}>
                {nome}
            </Text>
            <View style={styles.botao}>
                <Text style={{ color: '#18E742', fontWeight: 'bold', fontSize: 17 }}>
                    Ativo(a)
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F7FF',
        width: 160,
        height: 'auto',
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 40,
        maxHeight: 140
    },
    imageContainer: {
        backgroundColor: 'white',
        width: 80,
        position: 'absolute',
        marginLeft: 40,
        marginTop: -30,
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 6,
        borderColor: '#F0F7FF'
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    botao: {
        padding: 5,
        width: 100,
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
    }
});