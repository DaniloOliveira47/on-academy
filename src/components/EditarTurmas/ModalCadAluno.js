import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';

export default function CadastroAlunoModal({ visible, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <Image style={{width: 350, borderTopRightRadius: 10, borderTopLeftRadius: 10}} source={require('../../assets/image/barraAzul.png')}/>
        <View style={styles.modalContent}>
      
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.profileImage} />
            ) : (
              <Icon name="camera" size={50} color="#1A85FF" />
            )}
          </TouchableOpacity>
          <Text style={styles.imageText}>Adicionar Imagem</Text>

        
          <TextInput style={styles.input} placeholder="Nome Completo" placeholderTextColor="#AAA" />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#AAA" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Nº Matrícula" placeholderTextColor="#AAA" keyboardType="numeric" />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.smallInput]} placeholder="Telefone" placeholderTextColor="#AAA" keyboardType="phone-pad" />
            <TextInput style={[styles.input, styles.smallInput]} placeholder="Turma" placeholderTextColor="#AAA" />
          </View>

          <View style={styles.row}>
            <TextInput style={[styles.input, styles.smallInput]} placeholder="Data de Nascimento" placeholderTextColor="#AAA" />
            <View style={[styles.input, styles.smallInput, styles.passwordContainer]}>
              <TextInput placeholder="Senha" placeholderTextColor="#AAA" secureTextEntry />
              <Icon name="eye-off" size={20} color="#AAA" style={styles.eyeIcon} />
            </View>
          </View>


          <TouchableOpacity style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Salvar Aluno</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  imagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  imageText: {
    fontSize: 14,
    color: '#1A85FF',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 45,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  smallInput: {
    width: '48%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#1A85FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

