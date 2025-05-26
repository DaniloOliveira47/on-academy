import React from 'react';
import { View, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

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

const Stack = createStackNavigator();

function AppNavigation() {
  const { isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: isDarkMode ? '#000' : '#F0F7FF' }}>
      <StatusBar
        backgroundColor={isDarkMode ? '#000' : '#000'}

        barStyle={isDarkMode ? 'light-content' : 'light-content'}
        animated={true}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF', }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
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
                open: { animation: 'timing', config: { duration: 300 } },
                close: { animation: 'timing', config: { duration: 300 } },
              },
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          >
            {/* suas telas */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={({ route }) => ({
                animationEnabled: !(route?.params?.noAnimation), // se for true, desativa a animação
              })}
            />

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
      </KeyboardAvoidingView>
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
