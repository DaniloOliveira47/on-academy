import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import FeedbackScreen from '../screens/screensDocente/Feedback';

import AlunoPerfil from '../components/Turmas/screens/AlunoPerfil';
import AlunosFeedback from '../components/Turmas/screens/AlunosFeedback';
import { useTheme } from '../path/ThemeContext';
import { View } from 'react-native';

const Stack = createStackNavigator();

export default function FeedbackStack() {
    const { isDarkMode } = useTheme();
    return (
        <View style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }}>
            <Stack.Navigator screenOptions={{
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

            }}>
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
                    options={{ headerShown: false,  gestureEnabled: false }}
                />
            </Stack.Navigator>
        </View>
    );
}
