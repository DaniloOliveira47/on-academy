import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeleteAlert from './DeleteAlert'; // ajuste o caminho conforme necessário

const LogoutButton = ({
  iconColor = '#e74c3c',
  textColor = '#e74c3c',
  iconSize = 28,
  textSize = 24,
  onLogoutSuccess,
  onLogoutError
}) => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      await AsyncStorage.clear();
      setShowModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      if (onLogoutSuccess) onLogoutSuccess();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      if (onLogoutError) onLogoutError(error);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => setShowModal(true)}
      >
        <Icon name="log-out" size={iconSize} color={iconColor} style={styles.logoutIcon} />
        <Text style={[styles.logoutText, { color: textColor, fontSize: textSize }]}>
          Sair
        </Text>
      </TouchableOpacity>

      <DeleteAlert
        visible={showModal}
        title="Confirmar Logout"
        message="Tem certeza que deseja sair da sua conta?"
        confirmText="SAIR"
        cancelText="CANCELAR"
        onDismiss={() => setShowModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontWeight: 'bold',
  },
});

export default LogoutButton;
