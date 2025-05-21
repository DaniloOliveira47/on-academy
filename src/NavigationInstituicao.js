import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

import HomeScreen from './screens/screensInstituicao/Home';
import EventosScreen from './screens/screensInstituicao/EventosInstitution';
import ProfessoresStack from './stacks/ProfessoresStack';
import NotasStack from './stacks/EditarTurmasStack';

import { useTheme } from './path/ThemeContext';

// 🌀 Definição da animação customizada
Animatable.initializeRegistryWithDefinitions({
  slideUpBackground: {
    from: {
      transform: [{ scaleY: 0 }],
      opacity: 0,
    },
    to: {
      transform: [{ scaleY: 1 }],
      opacity: 1,
    },
  },
});

const Tab = createBottomTabNavigator();

const TabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.tabButtonContainer}
    >
      <View style={[styles.animatedButton, focused && styles.focusedButton]}>
        {focused && (
          <Animatable.View
            animation="slideUpBackground"
            duration={400}
            style={styles.backgroundOverlay}
          />
        )}
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default function NavigationDocente() {
  const { isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#000' : '#F7F9FC',
          height: 60,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          position: 'absolute',
          borderTopWidth: 0,
        },
        tabBarButton: (props) => <TabBarButton {...props} />,
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

          return (
            <Animatable.View
              animation={focused ? 'pulse' : undefined}
              duration={500}
              useNativeDriver
            >
              <Icon name={iconName} size={26} color={color} />
            </Animatable.View>
          );
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

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
  },
  animatedButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  focusedButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#0077FF',
  },
  backgroundOverlay: {
    backgroundColor: 'rgba(0, 119, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    height: '100%',
    width: '100%',
  },
});
