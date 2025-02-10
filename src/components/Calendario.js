import { Calendar } from 'react-native-calendars';
import { View, StyleSheet } from 'react-native';

const CustomCalendar = () => {
  return (
    <View style={styles.container}>
      <Calendar
        style={styles.calendar}
        theme={{
          todayTextColor: '#007bff',
          selectedDayBackgroundColor: '#007bff',
          selectedDayTextColor: '#fff',
          arrowColor: '#007bff',

        }}
        markedDates={{
          '2025-02-08': { selected: true, selectedColor: '#0077FF' },
          '2025-02-13': { selected: true, selectedColor: '#FF1D86' },
          '2025-02-18': { selected: true, selectedColor: '#16D03B' },
          '2025-02-23': { selected: true, selectedColor: '#FF7E3E' },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderEndLeftRadius: 15 ,
    borderEndRightRadius: 15 ,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 330
  },
});

export default CustomCalendar;
