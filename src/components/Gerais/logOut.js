
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LogoutButton = ({ 
  iconColor = '#e74c3c', 
  textColor = '#e74c3c',
  iconSize = 28,
  textSize = 24,
  onLogoutSuccess,
  onLogoutError 
}) => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
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
    <TouchableOpacity 
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Icon name="log-out" size={iconSize} color={iconColor} style={styles.logoutIcon} />
      <Text style={[styles.logoutText, { color: textColor, fontSize: textSize }]}>
        Sair
      </Text>
    </TouchableOpacity>
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