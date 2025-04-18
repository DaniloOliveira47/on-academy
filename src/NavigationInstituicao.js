import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import HomeScreen from './screens/screensInstituicao/Home';

import EventosScreen from './screens/screensInstituicao/EventosInstitution';
import FeedbackStack from './screens/screensInstituicao/Professores';
import NotasStack from './stacks/EditarTurmasStack'
import ProfessoresStack from './stacks/ProfessoresStack';

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
            case 'FeedbackTab': 
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
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          position: 'absolute',
          borderTopWidth: 0,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Turmas" component={NotasStack} options={{ headerShown: false }} />
      <Tab.Screen name="Eventos" component={EventosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="FeedbackTab" component={ProfessoresStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}
