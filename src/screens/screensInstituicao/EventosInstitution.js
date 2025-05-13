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
  const [errors, setErrors] = useState({
    tituloEvento: '',
    localEvento: '',
    descricaoEvento: '',
    dataEvento: '',
    horarioEvento: ''
  });

  // Estados para os campos do evento
  const [tituloEvento, setTituloEvento] = useState('');
  const [localEvento, setLocalEvento] = useState('');
  const [descricaoEvento, setDescricaoEvento] = useState('');

  // Cores baseadas no tema
  const backgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
  const textColor = isDarkMode ? '#FFF' : '#000';
  const containerColor = isDarkMode ? '#1E1E1E' : '#FFF';
  const modalBackgroundColor = isDarkMode ? '#1E1E1E' : '#FFF';
  const modalTextColor = isDarkMode ? '#FFF' : '#000';
  const inputBackgroundColor = isDarkMode ? '#333' : '#FFF';
  const inputTextColor = isDarkMode ? '#FFF' : '#000';
  const placeholderColor = isDarkMode ? '#AAA' : '#666';
  const borderColor = isDarkMode ? '#444' : '#CCC';

  // Função para buscar eventos
  const fetchEvents = async () => {
    try {
      const response = await fetch('https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event');
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
      setErrors(prev => ({...prev, dataEvento: ''}));
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      setErrors(prev => ({...prev, horarioEvento: ''}));
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
    setErrors({
      tituloEvento: '',
      localEvento: '',
      descricaoEvento: '',
      dataEvento: '',
      horarioEvento: ''
    });
  };

  const prepareEditForm = (event) => {
    setTituloEvento(event.tituloEvento);
    setLocalEvento(event.localEvento);
    setDescricaoEvento(event.descricaoEvento);
    
    // Formata a data do evento
    const [year, month, day] = event.dataEvento.split('-');
    setSelectedDate(new Date(year, month - 1, day));
    
    // Formata o horário do evento
    const [hours, minutes] = event.horarioEvento.split(':');
    const timeDate = new Date();
    timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    setSelectedTime(timeDate);
    
    setIsEditMode(true);
    setSelectedEventId(event.id);
    setModalVisible(true);
  };

  const validateEventDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Verifica se a data é anterior à data atual
    if (date < today) {
      setErrors(prev => ({...prev, dataEvento: 'Não é possível agendar eventos para datas passadas'}));
      return false;
    }
    
    // Verifica se a data é mais de 2 anos no futuro
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 2);
    
    if (date > maxDate) {
      setErrors(prev => ({...prev, dataEvento: 'Não é possível agendar eventos com mais de 2 anos de antecedência'}));
      return false;
    }
    
    return true;
  };

  const validateFields = () => {
    let valid = true;
    const newErrors = {
      tituloEvento: '',
      localEvento: '',
      descricaoEvento: '',
      dataEvento: '',
      horarioEvento: ''
    };

    if (!tituloEvento.trim()) {
      newErrors.tituloEvento = 'Título é obrigatório';
      valid = false;
    } else if (tituloEvento.trim().length < 3) {
      newErrors.tituloEvento = 'Título deve ter pelo menos 3 caracteres';
      valid = false;
    }

    if (!localEvento.trim()) {
      newErrors.localEvento = 'Local é obrigatório';
      valid = false;
    }

    if (!descricaoEvento.trim()) {
      newErrors.descricaoEvento = 'Descrição é obrigatória';
      valid = false;
    }

    if (!selectedDate) {
      newErrors.dataEvento = 'Data é obrigatória';
      valid = false;
    } else if (!validateEventDate(selectedDate)) {
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAddEvent = async () => {
    try {
      if (!validateFields()) return;

      const token = await AsyncStorage.getItem('@user_token');
      if (!token) {
        Alert.alert('Erro', 'Token não encontrado. Faça login novamente.');
        return;
      }

      // Formata a data como YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Formata o horário como HH:MM:SS
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:00`;

      const eventData = {
        tituloEvento: tituloEvento.trim(),
        dataEvento: formattedDate,
        horarioEvento: formattedTime,
        localEvento: localEvento.trim(),
        descricaoEvento: descricaoEvento.trim(),
      };

      const url = isEditMode 
        ? `https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event/${selectedEventId}`
        : 'https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event';
      
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
              const response = await fetch(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/event/${selectedEventId}`, {
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
    <ScrollView style={{ backgroundColor: backgroundColor }}>
      <HeaderSimples titulo="EVENTOS" />
      <View style={[styles.tela, { backgroundColor: backgroundColor, paddingBottom: 70 }]}>
        <View style={{ marginTop: 0 }}>
          <Image style={styles.barraAzul} source={require('../../assets/image/barraAzul.png')} />
          <CustomCalendar events={events} onDayPress={handleDayPress} />
        </View>
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 20, marginLeft: 20, color: textColor }}>
          Sobre o Evento
        </Text>
        <View style={[styles.container, { backgroundColor: containerColor }]}>
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
        <View style={[styles.container, { backgroundColor: containerColor }]}>
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
          <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: '#D9534F' }]} 
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
            >
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: modalTextColor }]}>
              {isEditMode ? 'Editar Evento' : 'Adicionar Evento'}
            </Text>

            <TextInput
              style={[
                styles.input, 
                errors.tituloEvento && styles.inputError,
                { 
                  backgroundColor: inputBackgroundColor,
                  color: inputTextColor,
                  borderColor: borderColor
                }
              ]}
              placeholder="Nome do evento"
              placeholderTextColor={placeholderColor}
              value={tituloEvento}
              onChangeText={(text) => {
                setTituloEvento(text);
                if (text.trim()) {
                  setErrors(prev => ({...prev, tituloEvento: ''}));
                }
              }}
            />
            {errors.tituloEvento ? <Text style={[styles.errorText, {color: '#FF3B30'}]}>{errors.tituloEvento}</Text> : null}

            <TextInput
              style={[
                styles.input, 
                styles.description, 
                errors.descricaoEvento && styles.inputError,
                { 
                  backgroundColor: inputBackgroundColor,
                  color: inputTextColor,
                  borderColor: borderColor
                }
              ]}
              placeholder="Descrição do evento"
              placeholderTextColor={placeholderColor}
              multiline
              value={descricaoEvento}
              onChangeText={(text) => {
                setDescricaoEvento(text);
                if (text.trim()) {
                  setErrors(prev => ({...prev, descricaoEvento: ''}));
                }
              }}
            />
            {errors.descricaoEvento ? <Text style={[styles.errorText, {color: '#FF3B30'}]}>{errors.descricaoEvento}</Text> : null}

            <Text style={[styles.label, {color: modalTextColor}]}>Data do Evento</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.dateInput, 
                  errors.dataEvento && styles.inputError,
                  { 
                    backgroundColor: inputBackgroundColor,
                    color: inputTextColor,
                    borderColor: borderColor
                  }
                ]}
                placeholder="Selecione a data"
                placeholderTextColor={placeholderColor}
                value={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
                editable={false}
              />
              <TouchableOpacity style={styles.dateIconButton} onPress={() => setShowDatePicker(true)}>
                <MaterialIcons name="calendar-today" size={24} color="#0077FF" />
              </TouchableOpacity>
            </View>
            {errors.dataEvento ? <Text style={[styles.errorText, {color: '#FF3B30'}]}>{errors.dataEvento}</Text> : null}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={isDarkMode ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() + 2))}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />
            )}

            <Text style={[styles.label, {color: modalTextColor}]}>Horário do Evento</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[
                  styles.input, 
                  styles.dateInput, 
                  errors.horarioEvento && styles.inputError,
                  { 
                    backgroundColor: inputBackgroundColor,
                    color: inputTextColor,
                    borderColor: borderColor
                  }
                ]}
                placeholder="Selecione o horário"
                placeholderTextColor={placeholderColor}
                value={selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                editable={false}
              />
              <TouchableOpacity style={styles.dateIconButton} onPress={() => setShowTimePicker(true)}>
                <MaterialIcons name="access-time" size={24} color="#0077FF" />
              </TouchableOpacity>
            </View>
            {errors.horarioEvento ? <Text style={[styles.errorText, {color: '#FF3B30'}]}>{errors.horarioEvento}</Text> : null}
            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={isDarkMode ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                themeVariant={isDarkMode ? 'dark' : 'light'}
              />
            )}

            <TextInput
              style={[
                styles.input, 
                errors.localEvento && styles.inputError,
                { 
                  backgroundColor: inputBackgroundColor,
                  color: inputTextColor,
                  borderColor: borderColor
                }
              ]}
              placeholder="Local"
              placeholderTextColor={placeholderColor}
              value={localEvento}
              onChangeText={(text) => {
                setLocalEvento(text);
                if (text.trim()) {
                  setErrors(prev => ({...prev, localEvento: ''}));
                }
              }}
            />
            {errors.localEvento ? <Text style={[styles.errorText, {color: '#FF3B30'}]}>{errors.localEvento}</Text> : null}

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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 5,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  description: {
    height: 100,
    textAlignVertical: 'top',
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
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
    marginBottom: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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