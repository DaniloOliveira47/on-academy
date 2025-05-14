import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Turmas from '../screens/screensInstituicao/Turmas';
import Alunos from '../components/EditarTurmas/screens/Alunos';
import PerfilAluno from '../components/EditarTurmas/screens/PerfilAluno';
import { useTheme } from '../path/ThemeContext'; // ajuste o caminho conforme seu projeto
import { View } from 'react-native';

const Stack = createStackNavigator();

export default function FeedbackStack() {
    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? '#121212' : '#F0F7FF';

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
                <Stack.Screen name="Turmas" component={Turmas} />
                <Stack.Screen name="Alunos" component={Alunos} />
                <Stack.Screen name="PerfilAluno" component={PerfilAluno} />
            </Stack.Navigator>
        </View>
    );
}
