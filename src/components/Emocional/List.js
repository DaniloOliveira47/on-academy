import React from 'react';
import { Image } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

export default function List({texto}) {
    return (
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 15 }}>{texto}</Text>
    );
};
