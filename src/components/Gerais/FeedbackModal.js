import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

const FeedbackModal = ({
    visible,
    onDismiss,
    studentName,
    feedbackContent,
    formBackgroundColor,
    textColor
}) => {
    const { isDarkMode } = useTheme();

    const headerBackgroundColor = '#0077FF';
     const modalBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const logoSquareBackground = isDarkMode ? '#333' : '#FFF';
    const logoTextColor = '#FFF';
    const barraAzulColor = '#0077FF';

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: modalBackgroundColor }]}>
                    {/* Header com logo */}
                    <View style={[styles.logoHeader, { backgroundColor: headerBackgroundColor }]}>
                        <View style={[styles.logoSquare, { backgroundColor: logoSquareBackground }]}>
                            <Image
                                source={require('../../assets/image/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.logoText, { color: logoTextColor }]}>OnAcademy</Text>
                    </View>

                    {/* Conteúdo */}
                    <View style={styles.contentContainer}>
                        <Text style={[styles.feedbackModalTitle, { color: textColor }]}>
                            Feedback de {studentName}
                        </Text>
                        <Text style={[styles.feedbackModalText, { color: textColor }]}>
                            {feedbackContent}
                        </Text>

                        {/* Botão */}
                        <TouchableOpacity
                            style={[styles.closeFeedbackButton, { backgroundColor: barraAzulColor }]}
                            onPress={onDismiss}
                        >
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalContainer: {
        width: '80%',
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    logoHeader: {
        width: '100%',
        alignItems: 'center',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    logoSquare: {
        width: 80,
        height: 80,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    logo: {
        width: 60,
        height: 60,
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 5,
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 15,
        alignItems: 'center',
    },
    feedbackModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    feedbackModalText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    closeFeedbackButton: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 3,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default FeedbackModal;