import React from 'react';
import { Image } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';

export default function CheckList ({texto}){
  return (
    <View style={styles.linha}>
     <Image style={styles.image} source={require('../../assets/image/checklist.png')}/>
     <Text style={{fontSize: 15, fontWeight: 'bold'}}>{texto}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
    linha: {
        flexDirection: 'row',
        marginTop: 15,
        gap: 10
    },

    image: {
        width: 25,
        height: 25
    }
})
