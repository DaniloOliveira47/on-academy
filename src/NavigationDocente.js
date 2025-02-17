import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import HomeScreen from './screens/screensDocente/Home';
import PerfilScreen from './screens/Perfil';
import EmocionalScreen from './screens/Emocional';
import BoletimScreen from './screens/Boletim';
import EventosScreen from './screens/Eventos';
import OcorrenciaScreen from './screens/Ocorrencia';
import { useTheme } from './path/ThemeContext';


const Tab = createBottomTabNavigator();

export default function NavigationDocente() {
  const { isDarkMode } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          let color = focused ? '#0077FF' : '#A0A0A0';
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Emocional':
              iconName = 'smile';
              break;
            case 'Boletim':
              iconName = 'file-text';
              break;
            case 'Eventos':
              iconName = 'calendar';
              break;
            case 'Ocorrencia':
              iconName = 'alert-circle';
              break;
            default:
              iconName = 'help-circle';
          }
          return <Icon name={iconName} size={30} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          alignItems: 'center',
          backgroundColor: isDarkMode ? '#000' : '#F7F9FC',
          height: 50,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Emocional"
        component={EmocionalScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Boletim"
        component={BoletimScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Eventos"
        component={EventosScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Ocorrencia"
        component={OcorrenciaScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
