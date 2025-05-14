import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensInstituicao/Turmas';
import NotasTurma from '../components/Turmas/screens/NotasTurma';
import { useTheme } from '../path/ThemeContext';
import { View } from 'react-native';

const Stack = createStackNavigator();

export default function FeedbackStack() {
    const { isDarkMode } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
                    },
                }}
            >

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
        </View>
    );
}
