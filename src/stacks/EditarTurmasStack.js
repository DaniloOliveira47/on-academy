import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensInstituicao/Turmas';
import Alunos from '../components/EditarTurmas/screens/Alunos';
import PerfilAluno from '../components/EditarTurmas/screens/PerfilAluno';

const Stack = createStackNavigator();

export default function FeedbackStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Turmas"
                component={Turmas}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Alunos"
                component={Alunos}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="PerfilAluno"
                component={PerfilAluno}
                options={{ headerShown: false }}
            />

           
        </Stack.Navigator>
    );
}
