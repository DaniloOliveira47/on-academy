import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import HeaderSimples from '../components/Gerais/HeaderSimples';
import CustomCalendar from '../components/Eventos/Calendario';
import CardHorario from '../components/Eventos/CardHorario';
import ProximosEventos from '../components/Eventos/proximosEventos';
import { useTheme } from '../path/ThemeContext';

export default function Eventos() {
    const { isDarkMode } = useTheme();
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [eventColors, setEventColors] = useState({}); 

    const BackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const container = isDarkMode ? '#000' : '#FFF';

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://10.0.2.2:3000/api/event');
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Erro ao buscar eventos:', error);
            }
        };

        fetchEvents();
    }, []);

    const handleDayPress = (eventId) => {
        setSelectedEventId(eventId);
    };

    const selectedEvent = events.find((event) => event.id === selectedEventId);

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    return (
        <ScrollView>
            <HeaderSimples titulo="EVENTOS" />
            <View style={[styles.tela, { backgroundColor: BackgroundColor }]}>
                <View style={{ marginTop: 0 }}>
                    <Image style={styles.barraAzul} source={require('../assets/image/barraAzul.png')} />
                    <CustomCalendar onDayPress={handleDayPress} />
                </View>
                <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 20, marginLeft: 20, color: textColor }}>
                    Sobre o Evento
                </Text>
                <View style={[styles.container, { backgroundColor: container }]}>
                    <Text style={{ fontSize: 20, color: textColor }}>
                        {selectedEvent ? selectedEvent.descricaoEvento : "Selecione um evento no calendário para ver mais detalhes."}
                    </Text>
                    {selectedEvent && (
                        <>
                            <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 25, color: textColor }}>
                                Horário
                            </Text>
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                                <CardHorario hora={formatTime(selectedEvent.dataHorarioEvento)} />
                            </View>
                            <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 25, color: textColor }}>
                                Local
                            </Text>
                            <Text style={{ fontSize: 20, color: textColor, marginLeft: 8, fontWeight: 'bold' }}>
                                {selectedEvent.localEvento}
                            </Text>
                        </>
                    )}
                </View>
                <View style={[styles.container, { backgroundColor: container }]}>
                    <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>
                        Próximos Eventos
                    </Text>
                    <View>
                        {events.map((event, index) => (
                            <ProximosEventos
                                key={index}
                                data={new Date(event.dataHorarioEvento).getDate()}
                                titulo={event.tituloEvento}
                                subData={`${new Date(event.dataHorarioEvento).getDate()} - ${new Date(event.dataHorarioEvento).toLocaleString('default', { month: 'short' }).toUpperCase()} ${new Date(event.dataHorarioEvento).getFullYear()}`}
                                periodo={formatTime(event.dataHorarioEvento)}
                                color={eventColors[event.id] || '#0077FF'} // Usa a cor do evento ou uma cor padrão
                            />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    tela: {
        padding: 15,
        width: '100%',
        height: '100%',
        marginBottom: 50
    },
    barraAzul: {
        width: 381,
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
});