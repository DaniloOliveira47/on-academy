import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../path/ThemeContext';

const DeleteAlert = ({
    visible,
    title = "Confirmar Exclusão",
    message = "Tem certeza que deseja excluir este item?",
    onDismiss,
    onConfirm,
    confirmText = "EXCLUIR",
    cancelText = "CANCELAR"
}) => {
    const { isDarkMode } = useTheme();

    const headerBackgroundColor = '#0077FF';
    const modalBackgroundColor = isDarkMode ? '#000' : '#FFF';
    const contentTextColor = isDarkMode ? '#FFF' : '#555';
    const logoSquareBackground = isDarkMode ? '#333' : '#FFF';
    const logoTextColor = '#FFF';

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
                        <Text style={[styles.modalText, { color: contentTextColor }]}>{message}</Text>

                        {/* Botões */}
                        <View style={styles.doubleButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                activeOpacity={0.8}
                                onPress={onDismiss}
                            >
                                <Text style={[styles.modalButtonText, { color: '#0077FF' }]}>{cancelText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                activeOpacity={0.8}
                                onPress={onConfirm}
                            >
                                <Text style={styles.modalButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
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
    modalText: {
        fontSize: 16,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 25,
        paddingHorizontal: 10,
    },
    doubleButtonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 3,
        flex: 1,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#0077FF',
    },
    confirmButton: {
        backgroundColor: '#0077FF',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default DeleteAlert;
