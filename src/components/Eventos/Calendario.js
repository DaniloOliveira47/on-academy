import React, { useEffect, useState } from 'react';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';

const CustomCalendar = ({ onDayPress, events, onDateSelect }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [eventColors, setEventColors] = useState({});
  const [minDate, setMinDate] = useState('');
  const [maxDate, setMaxDate] = useState('');
  const [loading, setLoading] = useState(true); // Estado para controlar o carregamento

  LocaleConfig.locales.fr = {
    monthNames: [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro"
    ],
    monthNamesShort: [
      "Jan.",
      "Fev.",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul.",
      "Ago",
      "Set.",
      "Out.",
      "Nov.",
      "Dez."
    ],
    dayNames: [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado"
    ],
    dayNamesShort: ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."]
  };

  LocaleConfig.defaultLocale = "fr";

  useEffect(() => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

    setMinDate(firstDayOfYear.toISOString().split('T')[0]);
    setMaxDate(lastDayOfYear.toISOString().split('T')[0]);
  }, []);

  const getRandomColor = () => {
    return '#0077FF';
  };

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

  useEffect(() => {
    if (events) { // Verifica se events existe (pode ser null ou undefined inicialmente)
      const formattedDates = {};
      const colors = {};

      if (events.length > 0) {
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
      }

      setMarkedDates(formattedDates);
      setEventColors(colors);
      setLoading(false); // Desativa o carregamento quando os dados estão prontos
    }
  }, [events]);

  const handleDayPress = (day) => {
    if (!validateDate(day.dateString)) {
      return;
    }

    if (onDateSelect) {
      onDateSelect(day.dateString);
    }

    if (onDayPress) {
      const event = events?.find((event) => {
        const eventDate = new Date(event.dataEvento).toISOString().split('T')[0];
        return eventDate === day.dateString;
      });

      if (event) {
        onDayPress(event.id);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.calendar, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0077FF" />
      </View>
    );
  }

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
        minDate={minDate}
        maxDate={maxDate}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 360, // Altura aproximada do calendário
  },
});

export default CustomCalendar;