import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';

import HomeScreen from './screens/Home';
import PerfilScreen from './screens/Perfil';
import BoletimScreen from './screens/Boletim';
import Screen3 from './screens/Home';
import Screen4 from './screens/Home';


const Tab = createBottomTabNavigator();

export default function Navigation() {
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
            case 'Perfil':
              iconName = 'users';
              break;
            case 'Boletim':
              iconName = 'file-text';
              break;
            case 'Screen3':
              iconName = 'calendar';
              break;
            case 'Screen4':
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
          backgroundColor: '#F7F9FC',
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
        name="Perfil"
        component={PerfilScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Boletim"
        component={BoletimScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Screen3"
        component={Screen3}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Screen4"
        component={Screen4}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}
