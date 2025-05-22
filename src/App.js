import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/Login';
import Navigation from './Navigation';
import NavigationDocente from './NavigationDocente';
import NavigationInstituicao from './NavigationInstituicao';

import Perfil from './screens/screensAluno/Perfil';
import NotasTurma from './components/Turmas/screens/NotasTurma';
import AlunosFeedback from './components/Turmas/screens/AlunosFeedback';
import AlunoPerfil from './components/Turmas/screens/AlunoPerfil';
import ProfessorPerfil from './screens/screensAluno/PerfilProfessor';
import TurmasInstituicao from './screens/screensInstituicao/Turmas';
import PerfilDocente from './screens/screensDocente/PerfilDocente';
import PerfilProfessor from './components/EditarTurmas/screens/PerfilProfessor';
import PerfilInstitution from './screens/screensInstituicao/PerfilInstitution';

import { ThemeProvider, useTheme } from './path/ThemeContext';
import { CardStyleInterpolators } from '@react-navigation/stack';
import EventosInstitution from './screens/screensInstituicao/EventosInstitution';
const Stack = createStackNavigator();

function AppNavigation() {
  const { isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
            },
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 300,
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 300,
                },
              },
            },
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}

        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={Navigation} />
          <Stack.Screen name="MainIns" component={NavigationInstituicao} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="PerfilDocente" component={PerfilDocente} />
          <Stack.Screen name="MainDoc" component={NavigationDocente} />
          <Stack.Screen name="NotasTurma" component={NotasTurma} />
          <Stack.Screen name="PerfilProfessor" component={PerfilProfessor} />
          <Stack.Screen name="AlunosFeedback" component={AlunosFeedback} />
          <Stack.Screen name="AlunoPerfil" component={AlunoPerfil} />
          <Stack.Screen name="ProfessorPerfil" component={ProfessorPerfil} />
          <Stack.Screen name="TurmasInstituicao" component={TurmasInstituicao} />
          <Stack.Screen name="PerfilInstitution" component={PerfilInstitution} />

        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}
