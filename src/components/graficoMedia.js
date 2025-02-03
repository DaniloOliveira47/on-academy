import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle, Line } from 'react-native-svg';

export default function GraficoMedia() {

  const getPointerAngle = (imc) => {
    if (imc < 18.6) return -135;
    if (imc > 30) return 45;
    return ((imc - 16) / (40 - 16)) * 180 - 90;
  };

  const pointerAngle = getPointerAngle(60);

  const pointerLength = 60;

  return (
    <View style={styles.container}>
      <Svg height="200" width="300" viewBox="0 0 300 200">
        <G transform="rotate(314, 150, 150)">
          <Circle cx="150" cy="150" r="10" fill="white" />
          <Path
            d="M 50 150 A 100 100 0 0 1 150 50"
            fill="none"
            stroke="#cfa16d"
            strokeWidth="50"
          />

          <Path
            d="M 150 50 A 100 100 0 0 1 250 150"
            fill="none"
            stroke="#b0814c"
            strokeWidth="50"
          />

          <Path
            d="M 250 150 A 100 100 0 0 1 50 150"
            fill="none"
            stroke="#7a501f"
            strokeWidth="50"
          />

          <Line
            x1="150"
            y1="150"
            x2={150 + pointerLength * Math.cos(pointerAngle * (Math.PI / 180))}
            y2={150 + pointerLength * Math.sin(pointerAngle * (Math.PI / 180))}
            stroke="white"
            strokeWidth="4"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  }
});