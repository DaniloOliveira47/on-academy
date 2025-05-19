import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../path/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Campo({
    label,
    text,
    isPassword = false,
    isInline = false,
    editable = false,
    onChangeText,
    textColor,
    placeholder
}) {
    const { isDarkMode } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(text);

    const fundoColor = isDarkMode ? '#141414' : '#F0F7FF';
    const textInputColor = isDarkMode ? '#FFF' : '#33383E';

    const handleChange = (text) => {
        setValue(text);
        if (onChangeText) {
            onChangeText(text);
        }
    };

    return (
        <View style={[styles.campo, isInline && styles.inline]}>
            <Text style={[styles.label, { color: textColor }]}>
                {label}
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: fundoColor }]}>
                {editable ? (
                    <TextInput
                        style={[styles.colorInput, { color: textInputColor }]}
                        value={value}
                        onChangeText={handleChange}
                        placeholder={placeholder}
                        placeholderTextColor="#999"
                        secureTextEntry={isPassword && !showPassword}
                    />
                ) : (
                    <Text
                        style={[styles.colorInput, { color: textInputColor }]}
                        numberOfLines={1}
                    >
                        {isPassword && !showPassword ? '••••••••' : text}
                    </Text>
                )}

                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye' : 'eye-off'}
                            size={20}
                            color={textColor}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    campo: {
        marginTop: 15,
    },
    inline: {
        flex: 1,
        marginHorizontal: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        backgroundColor: '#F0F7FF',
        borderRadius: 30,
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    colorInput: {
        fontSize: 17,
        flex: 1,
    },
});