import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import CustomCalendar from '../../components/Eventos/Calendario';
import CardHorario from '../../components/Eventos/CardHorario';
import ProximosEventos from '../../components/Eventos/proximosEventos';
import { useTheme } from '../../path/ThemeContext';
import { FAB } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function EventosInstitution() {
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventColors, setEventColors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Estados para os campos do evento
  const [tituloEvento, setTituloEvento] = useState('');
  const [localEvento, setLocalEvento] = useState('');
  const [descricaoEvento, setDescricaoEvento] = useState('');

  const BackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const container = isDarkMode ? '#000' : '#FFF';

  // Função para buscar eventos
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://192.168.2.11:3000/api/event');
      const data = await response.json();
      setEvents(data);

      const colors = {};
      data.forEach((event) => {
        colors[event.id] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });
      setEventColors(colors);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDayPress = (eventId) => {
    setSelectedEventId(eventId);
  };

  const selectedEvent = events.find((event) => event.id === selectedEventId);

  const formatDateTime = (date, time) => {
    const dateTimeString = `${date}T${time}`;
    return new Date(dateTimeString);
  };

  const formatTime = (dateTime) => {
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateTime) => {
    return dateTime
      .toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
      .toUpperCase();
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
    }
  };

  const resetForm = () => {
    setTituloEvento('');
    setLocalEvento('');
    setDescricaoEvento('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setIsEditMode(false);
    setSelectedEventId(null);
  };

  const prepareEditForm = (event) => {
    setTituloEvento(event.tituloEvento);
    setLocalEvento(event.localEvento);
    setDescricaoEvento(event.descricaoEvento);
    
    // Formata a data e hora do evento para os estados
    const [year, month, day] = event.dataEvento.split('-');
    const [hours, minutes, seconds] = event.horarioEvento.split(':');
    
    setSelectedDate(new Date(year, month - 1, day));
    setSelectedTime(new Date(0, 0, 0, hours, minutes));
    
    setIsEditMode(true);
    setSelectedEventId(event.id);
    setModalVisible(true);
  };

  const validateEventDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verifica se a data é anterior à data atual
    if (date < today) {
      Alert.alert('Erro', 'Não é possível agendar eventos para datas passadas.');
      return false;
    }
    
    // Verifica se a data é mais de 2 anos no futuro
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (date > maxDate) {
      Alert.alert('Erro', 'Não é possível agendar eventos com mais de 2 anos de antecedência.');
      return false;
    }
    
    return true;
  };

  const handleAddEvent = async () => {
    try {
      // Validação de campos obrigatórios
      if (!tituloEvento.trim()) {
        Alert.alert('Erro', 'Por favor, insira um título para o evento.');
        return;
      }
      
      if (!localEvento.trim()) {
        Alert.alert('Erro', 'Por favor, insira um local para o evento.');
        return;
      }
      
      if (!descricaoEvento.trim()) {
        Alert.alert('Erro', 'Por favor, insira uma descrição para o evento.');
        return;
      }

      // Validação da data do evento
      if (!validateEventDate(selectedDate)) {
        return;
      }

      const token = await AsyncStorage.getItem('@user_token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }

      const formattedDate = selectedDate.toISOString().split('T')[0];
      const formattedTime = selectedTime.toTimeString().split(' ')[0];

      const eventData = {
        tituloEvento,
        dataEvento: formattedDate,
        horarioEvento: formattedTime,
        localEvento,
        descricaoEvento,
      };

      const url = isEditMode 
        ? `http://192.168.2.11:3000/api/event/${selectedEventId}`
        : 'http://192.168.2.11:3000/api/event';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        Alert.alert('Sucesso', isEditMode ? 'Evento atualizado com sucesso!' : 'Evento adicionado com sucesso!');
        setModalVisible(false);
        resetForm();
        fetchEvents();
      } else {
        const errorData = await response.json();
        Alert.alert('Erro', errorData.message || 'Erro ao processar o evento.');
      }
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o evento.');
    }
  };

  const handleDeleteEvent = async () => {
    try {
      if (!selectedEventId) return;
      
      const token = await AsyncStorage.getItem('@user_token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }

      Alert.alert(
        'Confirmar',
        'Tem certeza que deseja excluir este evento?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Excluir',
            onPress: async () => {
              const response = await fetch(`http://192.168.2.11:3000/api/event/${selectedEventId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Sucesso', 'Evento excluído com sucesso!');
                resetForm();
                fetchEvents();
              } else {
                const errorData = await response.json();
                Alert.alert('Erro', errorData.message || 'Erro ao excluir evento.');
              }
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao excluir o evento.');
    }
  };

  return (
    <ScrollView>
      <HeaderSimples titulo="EVENTOS" />
      <View style={[styles.tela, { backgroundColor: BackgroundColor, paddingBottom: 70 }]}>
        <View style={{ marginTop: 0 }}>
          <Image style={styles.barraAzul} source={require('../../assets/image/barraAzul.png')} />
          <CustomCalendar events={events} onDayPress={handleDayPress} />
        </View>
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 20, marginLeft: 20, color: textColor }}>
          Sobre o Evento
        </Text>
        <View style={[styles.container, { backgroundColor: container }]}>
          <Text style={{ fontSize: 20, color: textColor }}>
            {selectedEvent ? selectedEvent.descricaoEvento : 'Selecione um evento no calendário para ver mais detalhes.'}
          </Text>
          {selectedEvent && (
            <>
              <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 25, color: textColor }}>
                Horário
              </Text>
              <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                <CardHorario hora={formatTime(formatDateTime(selectedEvent.dataEvento, selectedEvent.horarioEvento))} />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 24, marginTop: 25, color: textColor }}>
                Local
              </Text>
              <Text style={{ fontSize: 20, color: textColor }}>
                {selectedEvent.localEvento}
              </Text>
              
              {/* Botões de Editar e Excluir */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#0077FF' }]}
                  onPress={() => prepareEditForm(selectedEvent)}
                >
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#D9534F' }]}
                  onPress={handleDeleteEvent}
                >
                  <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Seção de Próximos Eventos */}
        <View style={[styles.container, { backgroundColor: container }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 24, color: textColor }}>
            Próximos Eventos
          </Text>
          <View>
            {events.map((event, index) => {
              const eventDateTime = formatDateTime(event.dataEvento, event.horarioEvento);
              return (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => handleDayPress(event.id)}
                  onLongPress={() => prepareEditForm(event)}
                >
                  <ProximosEventos
                    data={eventDateTime.getDate()}
                    titulo={event.tituloEvento}
                    subData={formatDate(eventDateTime)}
                    periodo={formatTime(eventDateTime)}
                    color={eventColors[event.id] || '#0077FF'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Botão Flutuante para Adicionar Evento */}
      <FAB
        style={[styles.fab, { marginBottom: 70 }]}
        icon="plus"
        color="white"
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      />

      {/* Modal para Adicionar/Editar Evento */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#FFF' }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => {
              setModalVisible(false);
              resetForm();
            }}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: '#000' }]}>
              {isEditMode ? 'Editar Evento' : 'Adicionar Evento'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nome do evento"
              placeholderTextColor="#666"
              value={tituloEvento}
              onChangeText={setTituloEvento}
            />

            <TextInput
              style={[styles.input, styles.description]}
              placeholder="Descrição do evento"
              placeholderTextColor="#666"
              multiline
              value={descricaoEvento}
              onChangeText={setDescricaoEvento}
            />

            <Text style={styles.label}>Data do Evento</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="Selecione a data"
                placeholderTextColor="#666"
                value={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
                editable={false}
              />
              <TouchableOpacity style={styles.dateIconButton} onPress={() => setShowDatePicker(true)}>
                <MaterialIcons name="calendar-today" size={24} color="#0077FF" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
              />
            )}

            <Text style={styles.label}>Horário do Evento</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                placeholder="Selecione o horário"
                placeholderTextColor="#666"
                value={selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                editable={false}
              />
              <TouchableOpacity style={styles.dateIconButton} onPress={() => setShowTimePicker(true)}>
                <MaterialIcons name="access-time" size={24} color="#0077FF" />
              </TouchableOpacity>
            </View>
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Local"
              placeholderTextColor="#666"
              value={localEvento}
              onChangeText={setLocalEvento}
            />

            <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
              <Text style={styles.addButtonText}>
                {isEditMode ? 'Atualizar evento' : 'Adicionar evento'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    padding: 15,
    width: '100%',
    height: '100%',
    marginBottom: 50,
  },
  barraAzul: {
    width: '100%',
    height: 70,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  container: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#0077FF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFF',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: '#000',
    backgroundColor: '#FFF',
  },
  description: {
    height: 100,
    textAlignVertical: 'top',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#D9534F',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000',
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    marginRight: 10,
  },
  dateIconButton: {
    padding: 10,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#0077FF',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});