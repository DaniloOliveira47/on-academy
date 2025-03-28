import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CadastroProfessorModal from '../../components/EditarTurmas/ModalCadProfessor';
import CardProfessorIns from '../../components/Ocorrência/CardProfessoreIns';

export default function ProfessoresFeedback() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [professores, setProfessores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
    const [modalCriarAlunoVisible, setModalCriarAlunoVisible] = useState(false);
    const [turmaId, setTurmaId] = useState(null);

    useEffect(() => {
        const fetchProfessores = async () => {
            try {
                const response = await axios.get('http://10.0.2.2:3000/api/teacher');
                setProfessores(response.data);
            } catch (error) {
                console.error('Erro ao buscar professores:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessores();
    }, []);

    const selecionarProfessor = (professor) => {
        setProfessorSelecionado(professor);
    };

    return (
        <View style={{ flex: 1 }}>
            <HeaderSimples />
            <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black', textAlign: 'center' }}>Professores</Text>
                </View>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF', height: '100%' }]}>
                    <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Digite o nome ou número da mátricula"
                            placeholderTextColor="#756262"
                        />
                        <Icon name="search" size={20} color="#1A85FF" style={styles.icon} />
                    </View>
                    {loading ? (
                        <ActivityIndicator size="large" color="#1A85FF" style={{ marginTop: 20 }} />
                    ) : (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 40 }}>
                            {professores.slice(0, 2).map((professor, index) => (
                                <CardProfessorIns
                                    key={index}
                                    nome={"Prof - " + professor.nomeDocente}
                                    id={professor.id}
                                    onPress={() => selecionarProfessor(professor)}
                                    selecionado={professorSelecionado?.id === professor.id}
                                />
                            ))}
                        </View>
                    )}
                    <View style={styles.selecao}>
                        {[1, 2, 3, '>'].map((numero, index) => (
                            <CardSelecao
                                key={index}
                                numero={numero}
                                selecionado={paginaSelecionada === numero}
                                onPress={() => setPaginaSelecionada(numero)}
                            />
                        ))}
                    </View>
                    
                    {/* Botões de criação no canto inferior direito */}
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', position: 'absolute', bottom: 20, right: 20 }}>
                        {/* Botão para adicionar professor */}
                        <TouchableOpacity 
                            style={[styles.botaoCriar, { marginRight: 10 }]} 
                            onPress={() => setModalCriarVisible(true)}
                        >
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        
                        {/* Botão para adicionar aluno */}
                
                    </View>
                    
                    {/* Modais */}
                    <CadastroProfessorModal 
                        visible={modalCriarVisible} 
                        onClose={() => setModalCriarVisible(false)}
                    />
                    

                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: 10,
        paddingBottom: 10
    },
    contColumn: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    container: {
        backgroundColor: 'white',
        width: '100%',
        padding: 10,
        borderRadius: 16,
        flex: 1
    },
    tela: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
        padding: 10,
        flex: 1
    },
    linha: {
        marginTop: -5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1A85FF',
        borderRadius: 25,
        width: '100%',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',
        marginBottom: 10,
        marginTop: 10
    },
    icon: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 10,
    },
    selecao: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    botaoCriar: {
        width: 60,
        height: 60,
        backgroundColor: '#1A85FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        marginBottom: 30,
        
    },
});