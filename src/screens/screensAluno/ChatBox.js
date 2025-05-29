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
import OnaLogo from '../../assets/image/logo.png';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

export default function ChatBox() {
    // Estados do componente
    const [messages, setMessages] = useState([
        {
            id: '1',
            role: 'assistant',
            content: `Olá! Eu sou a ONA, sua assistente virtual. 😊\n\nEstou aqui para te ajudar e oferecer apoio emocional. Como você está se sentindo hoje?`,
            timestamp: getCurrentTime()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useTheme();
    const scrollViewRef = useRef(null);
    const [studentData, setStudentData] = useState(null);
    
    // Cores baseadas no tema com um toque mais acolhedor
    const colors = {
        background: isDarkMode ? '#121212' : '#F0F7FF',
        container: isDarkMode ? '#000' : '#FFFFFF',
        text: isDarkMode ? '#FFFFFF' : '#000',
        border: isDarkMode ? '#121212' : '#F0F7FF',
        userBubble: isDarkMode ? '#4F46E5' : '#4F46E5', 
        assistantBubble: isDarkMode ? '#2D3748' : '#EDF2F7',
        bubbleText: isDarkMode ? '#FFFFFF' : '#2D3748',
        timeText: isDarkMode ? '#A0AEC0' : '#718096',
        button: isDarkMode ? '#0077FF' : '#0077FF',
        assistantName: isDarkMode ? '#81E6D9' : '#2B6CB0' 
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

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const userId = await AsyncStorage.getItem('@user_id');
                const response = await axios.get(`https://backendona-amfeefbna8ebfmbj.eastus2-01.azurewebsites.net/api/student/${userId}`);
                setStudentData(response.data);
                

                if (response.data?.nome) {
                    setMessages([{
                        id: '1',
                        role: 'assistant',
                        content: `Olá, ${response.data.nome.split(' ')[0]}! Eu sou a ONA, sua assistente virtual. 😊\n\nEstou aqui para te ajudar e oferecer apoio. Como você está se sentindo hoje?`,
                        timestamp: getCurrentTime()
                    }]);
                }
            } catch (error) {
                console.error('Erro ao buscar dados do aluno:', error);
            }
        };

        fetchStudentData();
    }, []);

    const resetChat = () => {
        Alert.alert(
            "Reiniciar conversa",
            "Tem certeza que deseja começar uma nova conversa com a ONA?",
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
                                content: studentData?.nome 
                                    ? `Olá, ${studentData.nome.split(' ')[0]}! Vamos começar de novo. 😊 Como posso te ajudar?` 
                                    : 'Olá! Vamos começar de novo. 😊 Como posso te ajudar?',
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

            const apiMessages = [
                {
                    role: "system",
                    content: `Você é a ONA, uma assistente virtual de apoio emocional profissional e também uma amiga próxima. Seja empática, atenciosa e ofereça suporte emocional com um tom caloroso, como uma amiga que se importa de verdade 🫂💬.`
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

            const assistantMessages = assistantContent.split('\n\n').filter(Boolean).map((content, index) => ({
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
                content: "Parece que estou tendo dificuldades para processar sua mensagem. 😔 Vamos tentar novamente?",
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
                titulo="CONVERSE COM A ONA"
               
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={styles.contentContainer}>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.messagesContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.chatContainer, { backgroundColor: colors.container }]}>
                            <View style={styles.onaProfile}>
                                <Image source={OnaLogo} style={[styles.onaAvatar, {backgroundColor: colors.background}]} />
                                <View style={styles.onaInfo}>
                                    <Text style={[styles.onaName, { color: colors.assistantName }]}>ONA</Text>
                                    <Text style={[styles.onaStatus, { color: colors.timeText }]}>Assistente Virtual • Online</Text>
                                </View>
                            </View>

                            <Text style={[styles.subTitle, { color: colors.text }]}>
                                Estou aqui para te ouvir e ajudar. Este é um espaço seguro para compartilhar seus pensamentos. 
                            </Text>

                            <View style={[styles.messageArea, { backgroundColor: isDarkMode ? '#121212' : '#F0F7FF' }]}>
                                {messages.map((message) => (
                                    <View
                                        key={message.id}
                                        style={[
                                            styles.messageWrapper,
                                            { alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start' }
                                        ]}
                                    >
                                        {message.role === 'assistant' && (
                                            <View style={styles.assistantHeader}>
                                                <Image source={OnaLogo} style={styles.avatar} />
                                                <Text style={[styles.assistantName, { color: colors.assistantName }]}>ONA</Text>
                                            </View>
                                        )}

                                        <View
                                            style={[
                                                styles.messageBubble,
                                                message.role === 'user'
                                                    ? {
                                                        backgroundColor: colors.container,
                                                        borderBottomRightRadius: 0
                                                    }
                                                    : {
                                                        backgroundColor: colors.container,
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
                                                { 
                                                    color: message.role === 'user' ? 'rgba(255,255,255,0.7)' : colors.timeText,
                                                    textAlign: message.role === 'user' ? 'right' : 'left'
                                                }
                                            ]}>
                                                {message.timestamp} {message.role === 'user' && '• Você'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}

                                {isLoading && (
                                    <View style={[
                                        styles.messageWrapper,
                                        { alignSelf: 'flex-start' }
                                    ]}>
                                        <View style={styles.assistantHeader}>
                                            <Image source={OnaLogo} style={styles.avatar} />
                                            <Text style={[styles.assistantName, { color: colors.assistantName }]}>ONA</Text>
                                        </View>
                                        <View style={[
                                            styles.messageBubble,
                                            {
                                                backgroundColor: colors.assistantBubble,
                                                borderBottomLeftRadius: 0,
                                                flexDirection: 'row',
                                                alignItems: 'center'
                                            }
                                        ]}>
                                            <ActivityIndicator size="small" color={colors.assistantName} />
                                            <Text style={[styles.messageText, { 
                                                color: colors.bubbleText,
                                                marginLeft: 8
                                            }]}>
                                                Digitando...
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={[styles.inputWrapper, { backgroundColor: colors.container }]}>
                        <View style={[styles.inputContainer, { 
                            backgroundColor: isDarkMode ? '#121212' : '#F0F7FF',
                            borderColor: colors.border
                        }]}>
                            <TextInput
                                style={[
                                    styles.inputArea,
                                    {
                                        color: colors.text,
                                    }
                                ]}
                                placeholder="Digite uma mensagem para a ONA..."
                                placeholderTextColor={colors.timeText}
                                value={input}
                                onChangeText={setInput}
                                onSubmitEditing={handleSend}
                                editable={!isLoading}
                                multiline
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: input.trim() ? colors.button : colors.border }
                                ]}
                                onPress={handleSend}
                                disabled={isLoading || !input.trim()}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Icon name="send" size={20} color="#0077FF" />
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
        borderRadius: 20,
        padding: 15,
        margin: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3
    },
    onaProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    onaAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15
    },
    onaInfo: {
        flex: 1
    },
    onaName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 2
    },
    onaStatus: {
        fontSize: 14,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    resetText: {
        marginLeft: 5,
        fontSize: 14
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
        fontSize: 15,
        marginBottom: 20,
        lineHeight: 22,
        opacity: 0.9
    },
    assistantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5
    },
    assistantName: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: '85%'
    },
    messageArea: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        minHeight: height * 0.4
    },
    messageBubble: {
        borderRadius: 15,
        padding: 15,
        marginBottom: 8,
        maxWidth: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22
    },
    messageTime: {
        fontSize: 11,
        marginTop: 6,
        opacity: 0.7
    },
    inputWrapper: {
        paddingHorizontal: 15,
        paddingBottom: 60 ,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingLeft: 15,
        paddingRight: 5
    },
    inputArea: {
        flex: 1,
        paddingVertical: 12,
        maxHeight: 120,
        fontSize: 16,
        paddingRight: 10,
        lineHeight: 20
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    }
});