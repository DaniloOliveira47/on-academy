import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensInstituicao/Turmas';
import NotasTurma from '../components/Turmas/screens/NotasTurma';
import ProfessoresFeedback from '../screens/screensInstituicao/Professores';
import PerfilProfessor from '../components/EditarTurmas/screens/PerfilProfessor';

const Stack = createStackNavigator();

export default function ProfessoresStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Professores"
                component={ProfessoresFeedback}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PerfilInsProfessor"
                component={PerfilProfessor}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
