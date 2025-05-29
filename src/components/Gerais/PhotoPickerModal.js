import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Icon from 'react-native-vector-icons/FontAwesome';

const PhotoPickerModal = ({
    visible,
    title = "Alterar Foto",
    message = "Escolha uma opção",
    onDismiss,
    onPickImage,
    onTakePhoto,
    pickImageText = "GALERIA",
    takePhotoText = "CÂMERA",
    cancelText = "CANCELAR"
}) => {
    const { isDarkMode } = useTheme();

    const headerBackgroundColor = '#0077FF';
    const modalBackgroundColor = isDarkMode ? '#121212' : '#F0F7FF';
    const textColor = isDarkMode ? '#000' : '#FFF';
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
                            <Icon name="camera" size={40} color="#0077FF" />
                        </View>
                        <Text style={[styles.logoText, { color: logoTextColor }]}>{title}</Text>
                    </View>

                    {/* Conteúdo */}
                    <View style={styles.contentContainer}>
                        <Text style={[styles.modalText, { color: contentTextColor }]}>{message}</Text>

                        {/* Botões */}
                        <View style={styles.tripleButtonContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.pickImageButton]}
                                activeOpacity={0.8}
                                onPress={onPickImage}
                            >
                                <Icon name="photo" size={20} color="white" style={styles.buttonIcon} />
                                <Text style={styles.modalButtonText}>{pickImageText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.takePhotoButton]}
                                activeOpacity={0.8}
                                onPress={onTakePhoto}
                            >
                                <Icon name="camera" size={20} color="white" style={styles.buttonIcon} />
                                <Text style={styles.modalButtonText}>{takePhotoText}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { backgroundColor: textColor }]}
                                activeOpacity={0.8}
                                onPress={onDismiss}
                            >
                                <Text style={[styles.modalButtonText, { color: '#0077FF'}]}>{cancelText}</Text>
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
    tripleButtonContainer: {
        width: '100%',
    },
    modalButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignItems: 'center',
        elevation: 3,
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    pickImageButton: {
        backgroundColor: '#4CAF50',
    },
    takePhotoButton: {
        backgroundColor: '#2196F3',
    },
    cancelButton: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#0077FF',
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        marginLeft: 10,
    },
    buttonIcon: {
        marginRight: 5,
    },
});

export default PhotoPickerModal;