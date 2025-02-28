import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/Login';
import Navigation from './Navigation';
import { ThemeProvider } from './path/ThemeContext';
import Perfil from './screens/Perfil';
import NavigationDocente from './NavigationDocente';
import NotasTurma from './components/Turmas/screens/NotasTurma';
import AlunosFeedback from './components/Turmas/screens/AlunosFeedback';
import AlunoPerfil from './components/Turmas/screens/AlunoPerfil';
import ProfessorPerfil from './screens/PerfilProfessor';
import TurmasInstituicao from './screens/screensInstituicao/Turmas';
import NavigationInstituicao from './screens/screensInstituicao/Turmas'

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={Navigation} />
          <Stack.Screen name="MainIns" component={NavigationInstituicao} />
          <Stack.Screen name="Perfil" component={Perfil} />
          <Stack.Screen name="MainDoc" component={NavigationDocente} />
          <Stack.Screen name="NotasTurma" component={NotasTurma} />
          <Stack.Screen name="AlunosFeedback" component={AlunosFeedback} />
          <Stack.Screen name="AlunoPerfil" component={AlunoPerfil} />
          <Stack.Screen name="ProfessorPerfil" component={ProfessorPerfil} />
          <Stack.Screen name="TurmasInstituicao" component={TurmasInstituicao} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
