import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, Animated, TouchableOpacity } from 'react-native';
import Header from '../../components/Home/Header';
import { useTheme } from '../../path/ThemeContext';
import CardTurmas from '../../components/Home/CardTurmas';
import Avisos from '../../components/Home/Avisos';

export default function HomeDocente() {
    const { isDarkMode } = useTheme();
    const [scrollY] = useState(new Animated.Value(0));
    const textColor = isDarkMode ? '#FFF' : '#000';
    const contColor = isDarkMode ? '#000' : '#FFF';

    const indicatorHeight = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [20, 100],
        extrapolate: 'clamp',
    });


    const translateY = scrollY.interpolate({
        inputRange: [0, 500],
        outputRange: [0, 150],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.tela, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
            <Header isDarkMode={isDarkMode} />

            <ScrollView style={styles.scrollTela} showsVerticalScrollIndicator={false}>
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
                                Seja bem-vindo, Docente 👋
                            </Text>
                            <Text style={[styles.subtitulo, { color: isDarkMode ? '#fff' : '#fff' }]}>
                                O sucesso é a soma de pequenos esforços repetidos dia após dia.
                            </Text>
                        </View>
                        <Image source={require('../../assets/image/mulher.png')} style={styles.infoImage} />
                    </View>


                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={styles.title}>Turmas</Text>
                        <View style={styles.scrollWrapper}>
                            <ScrollView
                                style={styles.scrollContainer}
                                contentContainerStyle={styles.cards}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={false}
                                onScroll={Animated.event(
                                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                    { useNativeDriver: false }
                                )}
                                scrollEventThrottle={16}
                            >
                                <CardTurmas titulo="Turma A - 1º Ano" subTitulo="Nº0231000" />
                                <CardTurmas titulo="Turma B - 1º Ano" subTitulo="Nº2346343" />
                                <CardTurmas titulo="Turma C - 1º Ano" subTitulo="Nº0966553" />
                                <CardTurmas titulo="Turma A - 2º Ano" subTitulo="Nº9257452" />
                                <CardTurmas titulo="Turma B - 2º Ano" subTitulo="Nº1594063" />
                                <CardTurmas titulo="Turma C - 2º Ano" subTitulo="Nº2435468" />
                            </ScrollView>


                            <View style={[styles.scrollBar, { backgroundColor: isDarkMode ? '#141414' : '#D3D3D3' }]}>
                                <Animated.View style={[styles.progressIndicator, { height: indicatorHeight, transform: [{ translateY }] }]} />
                            </View>
                        </View>
                    </View>


                    <View style={[styles.contTurmas, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
                        <Text style={[styles.title, { color: isDarkMode ? '#A1C9FF' : '#0077FF' }]}>Aviso</Text>
                        <View style={[styles.contAviso, { backgroundColor: isDarkMode ? '#333' : '#F0F7FF' }]}>
                            <Text style={{ color: isDarkMode ? '#FFF' : '#8A8A8A', fontWeight: 'bold', fontSize: 16 }}>
                                Prezados alunos, {"\n"}
                                Lembro a todos que a próxima aula será fundamental para a nossa sequência de estudos. Peço que revisem o conteúdo passado e tragam suas dúvidas. Além disso, o prazo para entrega do trabalho final é nesta sexta-feira. Não deixem para a última hora!{"\n"}
                                {"\n"}
                                Atenciosamente,{"\n"}Professor Paulo Andrade
                            </Text>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity style={{ backgroundColor: '#1A85FF', alignItems: 'center', width: 100, padding: 8, borderRadius: 10, marginTop: 10 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 17 }}>
                                    Enviar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ backgroundColor: contColor, width: '100%', borderRadius: 20, marginTop: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 10, color: textColor}}>
                            Avisos
                        </Text>
                        <View style={{ padding: 10 }}>
                            <Avisos
                                abreviacao="AR"
                                nome="Arthur"
                                horario="08:34 am"
                                texto="Olá, só lembrando que o prazo para a entrega do projeto final de Backend é na próxima sexta-feira! Não deixem para última hora, qualquer dúvida me chamem."
                            />
                            <Avisos
                                abreviacao="GI"
                                nome="Giovanni"
                                horario="12:33 pm"
                                texto="Galera, atualizei o Google Drive com o material extra sobre Frontend que mencionei na aula. Dêem uma olhada para ficarem mais preparados para a próxima prova."
                            />
                            <Avisos
                                abreviacao="SA"
                                nome="Samuel"
                                horario="16:33 pm"
                                texto="Olá, pessoal! Queria parabenizar todos pela entrega do trabalho! Vi que muitos se dedicaram bastante e o resultado ficou excelente."
                            />
                        </View>

                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    tela: {
        width: '100%',
        height: '100%',
        flex: 1,
        backgroundColor: '#F0F7FF'
    },
    scrollTela: {
        flex: 1,
        marginBottom: 40
    },
    contAviso: {
        backgroundColor: '#F0F7FF',
        padding: 10,
        borderRadius: 18,
        marginTop: 8,
    },
    scrollWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollContainer: {
        maxHeight: 250,
        flex: 1,
    },
    cards: {
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    scrollBar: {
        width: 6,
        height: 250,
        backgroundColor: '#D3D3D3',
        borderRadius: 3,
        marginLeft: 5,
        position: 'relative',
    },
    progressIndicator: {
        width: 6,
        backgroundColor: '#0077FF',
        borderRadius: 3,
        position: 'absolute',
    },
    contTurmas: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 30,
        padding: 15,
        marginTop: 20,
    },
    title: {
        color: '#0077FF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    subtela: {
        paddingTop: 10,
        alignItems: 'center',
        padding: 20,
    },
    infoContainer: {
        flexDirection: 'row',
        width: '100%',
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
});
