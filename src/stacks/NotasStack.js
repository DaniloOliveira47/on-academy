import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensDocente/Turmas';
import NotasTurma from '../components/Turmas/screens/NotasTurma';

const Stack = createStackNavigator();

export default function NotasStack(
) {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Turmas"
                component={Turmas}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NotasTurma"
                component={NotasTurma}
                options={{ headerShown: false }}
            />

           
        </Stack.Navigator>
    );
}
