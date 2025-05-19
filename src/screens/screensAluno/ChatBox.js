import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { useTheme } from '../../path/ThemeContext';

const { height } = Dimensions.get('window');

export default function ChatBox() {
    // Estados do componente
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: 'Olá! Como posso te ajudar hoje?',
            timestamp: getCurrentTime()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useTheme();
    const scrollViewRef = useRef(null);

    // Cores baseadas no tema
    const colors = {
        background: isDarkMode ? '#141414' : '#F0F7FF',
        container: isDarkMode ? '#000' : '#F7F9FC',
        text: isDarkMode ? '#FFFFFF' : '#000000',
        border: isDarkMode ? '#333333' : '#E0E0E0',
        userBubble: isDarkMode ? '#0077FF' : '#0077FF',
        assistantBubble: isDarkMode ? '#333333' : '#E3F2FD',
        bubbleText: isDarkMode ? '#FFFFFF' : '#000000',
        timeText: isDarkMode ? '#AAAAAA' : '#666666',
        button: isDarkMode ? '#333333' : '#E0E0E0'
    };

    // Rolar para baixo quando novas mensagens chegarem
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function scrollToBottom() {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const resetChat = () => {
        Alert.alert(
            "Reiniciar conversa",
            "Tem certeza que deseja começar uma nova conversa?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Reiniciar",
                    onPress: () => {
                        setMessages([
                            {
                                id: '1',
                                role: 'assistant',
                                content: 'Olá! Como posso te ajudar hoje?',
                                timestamp: getCurrentTime()
                            }
                        ]);
                    }
                }
            ]
        );
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: getCurrentTime()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiKey = "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";

            if (!apiKey) {
                throw new Error("Chave API não configurada");
            }


            const apiMessages = [
                {
                    role: "system",
                    content: "Você é um assistente de apoio emocional profissional chamado ONA. Seja empático, atencioso e ofereça suporte emocional. Mantenha as respostas claras e focadas no usuário."
                },
                ...messages.filter(msg => msg.role !== 'system').map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: "user",
                    content: input
                }
            ];

            const response = await axios.post(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    messages: apiMessages,
                    model: "llama3-70b-8192",
                    temperature: 0.7,
                    max_tokens: 1024,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const assistantContent = response.data.choices[0]?.message?.content || "Não obtive resposta";


            const assistantMessages = assistantContent.split('\n\n').map((content, index) => ({
                id: `${Date.now()}-${index}`,
                role: 'assistant',
                content: content.trim(),
                timestamp: getCurrentTime()
            }));

            setMessages(prev => [...prev, ...assistantMessages]);
        } catch (error) {
            console.error("Erro detalhado:", error.response?.data || error.message);

            const errorMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Desculpe, estou tendo dificuldades para processar sua mensagem. Podemos tentar novamente?",
                timestamp: getCurrentTime()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <HeaderSimples
                titulo="CHAT DE APOIO"
                rightComponent={
                    <TouchableOpacity onPress={resetChat}>
                        <Icon name="refresh-ccw" size={20} color="#0077FF" />
                    </TouchableOpacity>
                }
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.contentContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.messagesContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.chatContainer, { backgroundColor: colors.container }]}>
                            <View style={styles.header}>
                                <Icon name="message-square" size={24} color="#0077FF" style={styles.icon} />
                                <Text style={[styles.title, { color: '#0077FF' }]}>
                                    Converse conosco
                                </Text>
                            </View>

                            <Text style={[styles.subTitle, { color: colors.text }]}>
                                Este é um espaço seguro para você compartilhar seus pensamentos e sentimentos.
                            </Text>

                            <View style={[styles.messageArea, { borderColor: colors.border }]}>
                                {messages.map((message) => (
                                    <View
                                        key={message.id}
                                        style={[
                                            styles.messageBubble,
                                            message.role === 'user'
                                                ? {
                                                    backgroundColor: colors.userBubble,
                                                    alignSelf: 'flex-end',
                                                    borderBottomRightRadius: 0
                                                }
                                                : {
                                                    backgroundColor: colors.assistantBubble,
                                                    alignSelf: 'flex-start',
                                                    borderBottomLeftRadius: 0
                                                }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.messageText,
                                            { color: message.role === 'user' ? '#FFFFFF' : colors.bubbleText }
                                        ]}>
                                            {message.content}
                                        </Text>
                                        <Text style={[
                                            styles.messageTime,
                                            { color: message.role === 'user' ? '#DDDDDD' : colors.timeText }
                                        ]}>
                                            {message.timestamp}
                                        </Text>
                                    </View>
                                ))}

                                {isLoading && (
                                    <View style={[
                                        styles.messageBubble,
                                        {
                                            backgroundColor: colors.assistantBubble,
                                            alignSelf: 'flex-start',
                                            borderBottomLeftRadius: 0
                                        }
                                    ]}>
                                        <ActivityIndicator size="small" color={colors.text} />
                                        <Text style={[styles.messageText, { color: colors.bubbleText, marginTop: 5 }]}>
                                            Digitando...
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.inputWrapper, { backgroundColor: colors.container }]}>
                        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                            <TextInput
                                style={[
                                    styles.inputArea,
                                    {
                                        color: colors.text,
                                        borderColor: colors.border
                                    }
                                ]}
                                placeholder="Digite sua mensagem..."
                                placeholderTextColor={colors.timeText}
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                                editable={!isLoading}
                                multiline
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSend}
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#0077FF" />
                                ) : (
                                    <Icon name="send" size={24} color="#0077FF" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({   
    fullContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },
    messagesContainer: {
        flexGrow: 1,
        paddingBottom: 20
    },
    chatContainer: {
        borderRadius: 15,
        padding: 20,
        margin: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15
    },
    icon: {
        marginRight: 10
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20
    },
    subTitle: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 24
    },
    messageArea: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        minHeight: height * 0.4
    },
    messageBubble: {
        borderRadius: 15,
        padding: 12,
        marginBottom: 10,
        maxWidth: '80%'
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22
    },
    messageTime: {
        fontSize: 10,
        textAlign: 'right',
        marginTop: 4
    },
    inputWrapper: {
        paddingHorizontal: 15,
        paddingBottom: 60,

    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 25,
        paddingLeft: 15,

    },
    inputArea: {
        flex: 1,
        paddingVertical: 12,
        maxHeight: 100,
        fontSize: 16,
        paddingRight: 10
    },
    sendButton: {
        padding: 10,
        paddingRight: 15
    }
});