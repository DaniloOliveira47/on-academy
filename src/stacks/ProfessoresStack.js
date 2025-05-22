import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensInstituicao/Turmas';
import NotasTurma from '../components/Turmas/screens/NotasTurma';
import ProfessoresFeedback from '../screens/screensInstituicao/Professores';
import PerfilProfessor from '../components/EditarTurmas/screens/PerfilProfessor';
import { useTheme } from '../path/ThemeContext';
import { View } from 'react-native';

const Stack = createStackNavigator();

export default function ProfessoresStack() {
    const { isDarkMode } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
            <Stack.Navigator
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
        </View>
    );
}
