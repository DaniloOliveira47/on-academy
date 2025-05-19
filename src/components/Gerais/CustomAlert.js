import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../path/ThemeContext';

const CustomAlert = ({
    visible,
    title,
    message,
    onDismiss,
    iconName = "checkmark-circle",
    buttonText = "ENTENDI"
}) => {

    const { isDarkMode, setIsDarkMode } = useTheme();
    const headerBackgroundColor = isDarkMode ? '#0077FF' : '#0077FF';
    const textColor = isDarkMode ? '#FFF' : '#000';
    const modalBackgroundColor = isDarkMode ? '#000' : '#FFF';
    const contentTextColor = isDarkMode ? '#FFF' : '#555';
    const logoSquareBackground = isDarkMode ? '#333' : '#FFF';
    const logoTextColor = isDarkMode ? '#FFF' : '#FFF';

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onDismiss}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: modalBackgroundColor }]}>
                    {/* Container da Logo */}
                    <View style={[styles.logoHeader, { backgroundColor: headerBackgroundColor }]}>
                        {/* Quadrado para a logo */}
                        <View style={[styles.logoSquare, { backgroundColor: logoSquareBackground }]}>
                            <Image
                                source={require('../../assets/image/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={[styles.logoText, { color: logoTextColor }]}>OnAcademy</Text>
                    </View>

                    <View style={styles.contentContainer}>




                        <Text style={[styles.modalText, { color: contentTextColor }]}>{message}</Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            activeOpacity={0.8}
                            onPress={onDismiss}
                        >
                            <Text style={styles.modalButtonText}>{buttonText}</Text>
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
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 10,
    },
    modalText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    modalButton: {
        backgroundColor: '#0077FF',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        elevation: 3,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default CustomAlert;