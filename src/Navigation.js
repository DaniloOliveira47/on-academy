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


import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';

import HomeScreen from './screens/screensAluno/Home';
import PerfilScreen from './screens/screensAluno/Perfil';
import EmocionalScreen from './screens/screensAluno/Emocional';
import BoletimScreen from './screens/screensAluno/Boletim';
import EventosScreen from './screens/Eventos';
import OcorrenciaScreen from './screens/screensAluno/Ocorrencia';
import ChatScreen from './screens/screensAluno/ChatBox';
import { useTheme } from './path/ThemeContext';

const Tab = createBottomTabNavigator();

const TabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState.selected;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.tabButtonContainer}
    >
      <Animatable.View
        style={[styles.animatedButton, focused && styles.focusedButton]}
        duration={0} // sem animação aqui
      >
        {focused && (
          <Animatable.View
            animation="slideUpBackground"
            duration={400}
            style={styles.backgroundOverlay}
          />
        )}
        {children}
      </Animatable.View>
    </TouchableOpacity>
  );
};


export default function Navigation() {
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
            case 'ChatBox':
              iconName = 'message-square';
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
      <Tab.Screen name="Emocional" component={EmocionalScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Boletim" component={BoletimScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Eventos" component={EventosScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Ocorrencia" component={OcorrenciaScreen} options={{ headerShown: false }} />
      <Tab.Screen name="ChatBox" component={ChatScreen} options={{ headerShown: false }} />
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
