import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';


const GraficoFeedbackTurma = ({
    dadosGrafico,
    bimestreSelecionado,
    professorSelecionado,
    semFeedbacks,
    onSelecionarBimestre,
    onSelecionarProfessor,
    onLimparFiltroProfessor,
    onBarraClick,
    professores
}) => {
    const { isDarkMode } = useTheme();


    const textColor = isDarkMode ? '#FFF' : '#000';
    const barraAzulColor = isDarkMode ? '#1E6BE6' : '#1E6BE6';
    const formBackgroundColor = isDarkMode ? '#000' : '#FFFFFF';
    const perfilBackgroundColor = isDarkMode ? '#141414' : '#F0F7FF';


    const maxValue = 5;
    const maxBarHeight = 150;
    const labels = ['Engaj.', 'Desemp.', 'Entrega', 'Atenção', 'Comp.'];

    return (
        <View style={[styles.grafico, { backgroundColor: formBackgroundColor }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>



            </View>

            {semFeedbacks ? (
                <View style={styles.semFeedbacksContainer}>
                    <Image
                        source={require('../../assets/image/sem-feedback.png')}
                        style={styles.semFeedbacksImagem}
                    />
                    <Text style={[styles.semFeedbacksTitulo, { color: textColor }]}>
                        Nenhum feedback encontrado
                    </Text>
                    <Text style={[styles.semFeedbacksTexto, { color: textColor }]}>
                        {professorSelecionado
                            ? `O professor ${professorSelecionado.nomeDocente} ainda não enviou feedbacks para a Turma`
                            : `Nenhum professor enviou feedbacks para a Turma`}
                    </Text>
                </View>
            ) : (
                <View style={[styles.chartContainer, { backgroundColor: perfilBackgroundColor }]}>
                    <Text style={[styles.graficoTitulo, { color: textColor }]}>
                        {'Média Geral da Turma'}
                    </Text>
                    <View style={styles.chart}>
                        {dadosGrafico.map((value, index) => {
                            const barHeight = (value / maxValue) * maxBarHeight;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => onBarraClick(labels[index], value)}
                                    disabled={value === 0}
                                >
                                    <View style={styles.barContainer}>
                                        <View style={[styles.bar, {
                                            height: barHeight,
                                            backgroundColor: value === 0 ? '#CCCCCC' : barraAzulColor
                                        }]} />
                                        <Text style={[styles.barLabel, {
                                            color: textColor,
                                            opacity: value === 0 ? 0.5 : 1
                                        }]}>{labels[index]}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    grafico: {
        padding: 10,
        width: '100%',
        marginTop: 20,
        borderRadius: 10,
    },
    graficoTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 10,
    },
    chart: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexDirection: 'row',
        padding: 10
    },
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
        borderRadius: 10,
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    bar: {
        width: 30,
        borderRadius: 5,
    },
    barLabel: {
        marginTop: 5,
        fontSize: 12,
        textAlign: 'center',
    },
    semFeedbacksContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    semFeedbacksImagem: {
        width: 150,
        height: 150,
        marginBottom: 20,
        opacity: 0.7
    },
    semFeedbacksTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    semFeedbacksTexto: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
});

export default GraficoFeedbackTurma;