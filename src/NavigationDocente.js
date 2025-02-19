import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import HomeScreen from './screens/screensDocente/Home';
import TurmasScreen from './screens/screensDocente/Turmas';
import EventosScreen from './screens/Eventos';
import Feedback from './screens/screensDocente/Feedback';
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
            case 'Turmas':
              iconName = 'users';
              break;
            case 'Eventos':
              iconName = 'calendar';
              break;
            case 'Feedback':
              iconName = 'message-circle';
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
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Turmas" component={TurmasScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Eventos" component={EventosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Feedback" component={Feedback} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
