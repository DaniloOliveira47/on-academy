import React, { useEffect, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { View, StyleSheet, Alert } from 'react-native';

const CustomCalendar = ({ onDayPress, events, onDateSelect }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [eventColors, setEventColors] = useState({});
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');

  // Configura as datas mínima (1º dia do ano) e máxima (último dia do ano)
  useEffect(() => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // Janeiro = 0
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31); // Dezembro = 11
    
    setMinDate(firstDayOfYear.toISOString().split('T')[0]);
    setMaxDate(lastDayOfYear.toISOString().split('T')[0]);
  }, []);

  // Função para gerar cor (mantida azul conforme seu código)
  const getRandomColor = () => {
    return '#0077FF';
  };

  // Validação de data para permitir apenas o ano atual
  const validateDate = (date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    if (selectedDate < firstDayOfYear) {
      Alert.alert('Erro', 'Não é possível selecionar datas antes do ano atual.');
      return false;
    }
    
    if (selectedDate > lastDayOfYear) {
      Alert.alert('Erro', 'Não é possível selecionar datas após o ano atual.');
      return false;
    }
    
    return true;
  };

  // Formata as datas dos eventos para marcação no calendário
  useEffect(() => {
    if (events && events.length > 0) {
      const formattedDates = {};
      const colors = {};

      events.forEach((event) => {
        const date = new Date(event.dataEvento).toISOString().split('T')[0];
        const color = getRandomColor();
        
        if (validateDate(date)) {
          formattedDates[date] = { 
            selected: true, 
            selectedColor: color, 
            id: event.id, 
            dotColor: color,
          };
          colors[event.id] = color;
        }
      });

      setMarkedDates(formattedDates);
      setEventColors(colors);
    }
  }, [events]);

  const handleDayPress = (day) => {
    if (!validateDate(day.dateString)) {
      return;
    }

    if (onDateSelect) {
      onDateSelect(day.dateString);
    }

    const event = events.find((event) => {
      const eventDate = new Date(event.dataEvento).toISOString().split('T')[0];
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
        minDate={minDate} // 1º dia do ano atual
        maxDate={maxDate} // Último dia do ano atual
        disabledByDefault={false}
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