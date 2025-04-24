import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const CardNota = ({ title, subtitle, percentage, isDarkMode }) => {
  const radius = 25;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 10) * circumference;
  
  // Pegar as duas primeiras letras do título e converter para maiúsculas
  const initials = title ? title.substring(0, 2).toUpperCase() : '';

  return (
    <View style={[styles.card, { backgroundColor: isDarkMode ? '#000' : '#FFF' }]}>
      <View style={[styles.initialsContainer, { backgroundColor: isDarkMode ? '#1E6BE6' : '#0077FF' }]}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#000' }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: isDarkMode ? '#BBB' : '#8A8A8A' }]}>{subtitle}</Text>
      </View>
      <View style={styles.progressContainer}>
        <Svg width={60} height={60} viewBox="0 0 60 60">
          <Circle cx="30" cy="30" r={radius} stroke="#EAEAEA" strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx="30"
            cy="30"
            r={radius}
            stroke={isDarkMode ? '#4A90E2' : '#0077FF'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 30 30)"
          />
        </Svg>
        <Text style={[styles.progressText, { color: isDarkMode ? '#FFF' : '#000' }]}>{`${percentage},0`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  initialsContainer: {
    width: 57,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  initialsText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
  },
  info: {
    marginTop: 5,
    flex: 1,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CardNota;