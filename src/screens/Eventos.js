import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import HeaderSimples from '../components/Gerais/HeaderSimples'
import CustomCalendar from '../components/Eventos/Calendario'
import CardHorario from '../components/Eventos/CardHorario'
import ProximosEventos from '../components/Eventos/proximosEventos'
import { useTheme } from '../path/ThemeContext'

export default function Eventos() {
    const { isDarkMode } = useTheme();

    const BackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const container = isDarkMode ? '#000' : '#FFF';


    return (
        <ScrollView>
            <HeaderSimples
                    titulo="EVENTOS"
                />
            <View style={[styles.tela, { backgroundColor: BackgroundColor }]}>
                
                <View style={{ marginTop: 0 }}>
                    <Image style={styles.barraAzul} source={require('../assets/image/barraAzul.png')} />
                    <CustomCalendar />
                </View>
                <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 20, marginLeft: 20, color: textColor }}>
                    Sobre o Evento
                </Text>
                <View style={[styles.container, { backgroundColor: container }]}>
                    <Text style={{ fontSize: 20, color: textColor }}>
                        Os eventos esportivos incentivam a prática de esportes e atividades físicas variadas. Costumam incluir a realização de provas, competições e jogos, geralmente com premiações no final aos vencedores.
                    </Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 25, color: textColor }}>
                        Horário
                    </Text>
                    <View style={{
                        justifyContent: 'space-between', flexDirection: 'row', marginTop: 10
                    }}>
                        <CardHorario hora="09:00 ás 11:00" />
                        <CardHorario hora="11:00 ás 13:00" />
                        <CardHorario hora="13:00 ás 15:00" />

                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10, gap: 15 }}>
                        <CardHorario hora="15:00 ás 17:00" />
                        <CardHorario hora="17:00 ás 19:00" />
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, color: textColor }}>
                        Cotia SP, Senai Ricardo Lerner
                        06708-280
                    </Text>
                </View>
                <View style={[styles.container, { backgroundColor: container }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>
                        Próximos Eventos
                    </Text>
                    <View>
                        <ProximosEventos
                            data="8"
                            titulo="Início das Aulas"
                            subData="8 - FEV 2025"
                            periodo="8 A.M - 9 A.M"
                            color='#0077FF'
                        />
                        <ProximosEventos
                            data="13"
                            titulo="Clube do Livro"
                            subData="13 - FEV 2025"
                            periodo="10 A.M - 11 A.M"
                            color='#FF1D86'
                        />
                        <ProximosEventos
                            data="18"
                            titulo="Entrega das Apostilas"
                            subData="18 - FEV 2025"
                            periodo="2 P.M - 3 P.M"
                            color='#16D03B'
                        />
                        <ProximosEventos
                            data="23"
                            titulo="Feira Cultural"
                            subData="23 - FEV 2025"
                            periodo="4 P.M - 5 P.M"
                            color='#FF7E3E'
                        />
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    tela: {
        padding: 25,
        width: '100%',
        height: '100%',
        marginBottom: 50
    },
    barraAzul: {
        width: 362,
        height: 70,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    container: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 15,
        marginTop: 10,
        marginBottom: 20
    }
})