import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { View, StyleSheet } from 'react-native';

const CustomCalendar = ({ onDayPress }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [events, setEvents] = useState([]);
  const [eventColors, setEventColors] = useState({}); // Estado para armazenar as cores dos eventos

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://10.0.2.2:3000/api/event');
        const events = await response.json();
        setEvents(events);

        const formattedDates = {};
        const colors = {};

        events.forEach((event) => {
          const date = new Date(event.dataHorarioEvento).toISOString().split('T')[0];
          const color = getRandomColor();
          formattedDates[date] = { selected: true, selectedColor: color, id: event.id };
          colors[event.id] = color; // Armazena a cor gerada para o evento
        });

        setMarkedDates(formattedDates);
        setEventColors(colors); // Atualiza o estado com as cores dos eventos
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };

    fetchEvents();
  }, []);

  const handleDayPress = (day) => {
    const event = events.find((event) => {
      const eventDate = new Date(event.dataHorarioEvento).toISOString().split('T')[0];
      return eventDate === day.dateString;
    });

    if (event) {
      onDayPress(event.id); 
    }
  };

  return (
    <View>
      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: '#007bff',
          selectedDayBackgroundColor: '#007bff',
          selectedDayTextColor: '#fff',
          arrowColor: '#007bff',
        }}
        markedDates={markedDates}
        onDayPress={handleDayPress} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderEndLeftRadius: 15,
    borderEndRightRadius: 15,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 'auto',
  },
});

export default CustomCalendar;