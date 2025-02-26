import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HeaderSimples from '../components/Gerais/HeaderSimples';
import CheckList from '../components/Emocional/CheckList';
import List from '../components/Emocional/List';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../path/ThemeContext';

export default function Emocional() {
        const { isDarkMode } = useTheme();
        const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';
        const cont = isDarkMode ? '#000' : '#FFF';
        const text = isDarkMode ? '#FFF' : '#000'
    return (
        <ScrollView>
             <HeaderSimples
                    titulo="EMOCIONAL" />
            <View style={[styles.tela, {backgroundColor: perfilBackgroundColor}]}>
               
                <View style={[styles.subTela, {backgroundColor: cont}]}>
                    <Text style={styles.title}>
                        Seu bem-estar importa
                    </Text>
                    <Text style={[styles.subTitle, {color: text}]}>
                        A rotina escolar envolve muitos desafios, e sabemos que cada aluno vivencia experiências únicas. Pensando nisso, criamos este espaço para que você possa expressar seus sentimentos, dificuldades e sugestões de forma segura e confidencial.
                        O objetivo deste formulário é entender melhor como você está se sentindo e identificar maneiras de tornar o ambiente escolar mais acolhedor e positivo para todos. Suas respostas são valiosas e podem contribuir para melhorias no dia a dia da instituição.
                    </Text>
                    <Text style={styles.title}>
                        Por que preencher este formulário?
                    </Text>
                    <View style={styles.conText}>
                        <CheckList
                            texto="Expressar suas emoções,um espaço para compartilhar como você está se sentindo."
                        />
                        <CheckList
                            texto="Sugerir melhorias, se há algo que pode ser ajustado, queremos ouvir você."
                        />
                        <CheckList
                            texto=" Ser ouvido com respeito, suas respostas serão analisadas com empatia e seriedade."
                        />
                    </View>
                    <Text style={styles.title}>
                        Importante lembrar:
                    </Text>
                    <List
                        texto="• Todas as respostas são anônimas e opcionais. Você pode responder apenas as perguntas que desejar."
                    />
                    <List
                        texto="• Se precisar de apoio, nossa equipe está disponível para ajudar. Não hesite em procurar ajuda sempre que precisar."
                    />
                    <List
                        texto="• Juntos, podemos construir um ambiente escolar mais saudável e acolhedor para todos."
                    />
                    <View style={{ alignItems: 'center' }}>
                        <TouchableOpacity style={styles.botao}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: text }}>Acesse o Formulário aqui.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    tela: {
        padding: 25,
        paddingTop: 0
    },
    botao: {
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#0077FF',
        width: 220,
        borderRadius: 8,
        padding: 10,
        marginTop: 40
    },
    subTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginTop: 10,
        marginBottom: 20
    },
    title: {
        color: '#0077FF',
        fontWeight: 'bold',
        fontSize: 20
    },
    subTela: {
        backgroundColor: 'white',
        width: '100%',
        height: 850,
        borderRadius: 15,
        marginTop: 20,
        padding: 15,
        marginBottom: 40
    },
    conText: {
        width: 290,
        marginBottom: 15
    }
})
