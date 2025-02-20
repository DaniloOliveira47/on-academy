import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import FeedbackScreen from '../screens/screensDocente/Feedback';
import AlunosFeedback from '../components/Turmas/screens/AlunosFeedback';
import AlunoPerfil from '../components/Turmas/screens/AlunoPerfil';

const Stack = createStackNavigator();

export default function FeedbackStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="FeedbackHome"
                component={FeedbackScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AlunosFeedback"
                component={AlunosFeedback}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="AlunoPerfil"
                component={AlunoPerfil}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}
