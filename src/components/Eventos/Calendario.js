import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { View, StyleSheet } from 'react-native';

const CustomCalendar = ({ onDayPress, events }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [eventColors, setEventColors] = useState({}); // Estado para armazenar as cores dos eventos

  // Função para gerar uma cor aleatória
  const getRandomColor = () => {

    let color = '#0077FF';
    
    return color;
  };

  useEffect(() => {
    if (events && events.length > 0) {
      const formattedDates = {};
      const colors = {};

      events.forEach((event) => {
        const date = new Date(event.dataEvento).toISOString().split('T')[0]; // Usa dataEvento
        const color = getRandomColor();
        formattedDates[date] = { 
          selected: true, 
          selectedColor: color, 
          id: event.id, 
          dotColor: color, // Adiciona um ponto colorido no dia
        };
        colors[event.id] = color; // Armazena a cor gerada para o evento
      });

      setMarkedDates(formattedDates);
      setEventColors(colors); // Atualiza o estado com as cores dos eventos
    }
  }, [events]);

  const handleDayPress = (day) => {
    const event = events.find((event) => {
      const eventDate = new Date(event.dataEvento).toISOString().split('T')[0]; // Usa dataEvento
      return eventDate === day.dateString;
    });

    if (event) {
      onDayPress(event.id); // Passa o ID do evento selecionado
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