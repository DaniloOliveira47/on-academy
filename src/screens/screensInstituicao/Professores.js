import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import HeaderSimples from '../../components/Gerais/HeaderSimples';
import { Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import CardSelecao from '../../components/Turmas/CardSelecao';
import { useTheme } from '../../path/ThemeContext';
import CardProfessor from '../../components/Ocorrência/CardProfessor';
import axios from 'axios';

import CadastroProfessorModal from '../../components/EditarTurmas/ModalCadProfessor';

export default function ProfessoresFeedback() {
    const [paginaSelecionada, setPaginaSelecionada] = useState(1);
    const { isDarkMode } = useTheme();
    const [professores, setProfessores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [professorSelecionado, setProfessorSelecionado] = useState(null);
    const [modalCriarVisible, setModalCriarVisible] = useState(false);
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

    return (
        <View>
            <HeaderSimples />
            <View style={[styles.tela, { backgroundColor: isDarkMode ? '#141414' : '#F0F7FF' }]}>
                <View style={styles.linha}>
                    <Text style={{ fontWeight: 'bold', fontSize: 20, color: isDarkMode ? 'white' : 'black' }}>Professores</Text>

                </View>
                <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
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
                                <CardProfessor
                                    key={index}
                                    nome={"Prof - " + professor.nomeDocente}
                                    id={professor.id}
                                    onPress={() => selecionarProfessor(professor)} // Passa a função para selecionar o professor
                                    selecionado={professorSelecionado?.id === professor.id} // Destaca o card selecionado
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
                    <View style={{ flex: 1, width: '100%', alignItems: 'flex-end', marginTop: 10 }}>
                        <TouchableOpacity style={styles.botaoCriar} onPress={() => setModalCriarVisible(true)}>
                            <Icon name="plus" size={24} color="white" />
                        </TouchableOpacity>
                        <CadastroProfessorModal visible={modalCriarVisible} onClose={() => setModalCriarVisible(false)}/>
                    </View>
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
        borderRadius: 16
    },
    tela: {
        backgroundColor: '#F0F7FF',
        width: '100%',
        height: '100%',
        padding: 10
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
        width: 50, // Definindo um tamanho fixo para o botão
        height: 50, // Tamanho fixo
        backgroundColor: '#1A85FF', // Cor de fundo do botão
        borderRadius: 10, // Tornando o botão redondo
        justifyContent: 'center', // Alinhamento central do conteúdo
        alignItems: 'center', // Alinhamento central
        position: 'absolute', // Garantir que o botão fique sobre outros elementos
        bottom: 0, // Distância da parte inferior da tela
        right: 0, // Distância da parte direita da tela
        elevation: 5, // Sombra para dar destaque
    },
});
