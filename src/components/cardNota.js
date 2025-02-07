import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const CardNota = ({ title, subtitle, imageSource, percentage }) => {
  const radius = 25;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;

  return (
    <View style={styles.card}>
      <View style={styles.imageBack}>
        <Image style={styles.image} source={imageSource} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.progressContainer}>
        <Svg width={60} height={60} viewBox="0 0 60 60">

          <Circle
            cx="30"
            cy="30"
            r={radius}
            stroke="#EAEAEA"
            strokeWidth={strokeWidth}
            fill="none"
          />

          <Circle
            cx="30"
            cy="30"
            r={radius}
            stroke="#0077FF"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform="rotate(-90 30 30)"
          />
        </Svg>
        <Text style={styles.progressText}>{`${percentage},0`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageBack: {
    backgroundColor: '#0077FF',
    width: 57,
    height: 60,
    alignItems: 'center',
    padding: 7,
    borderRadius: 10,
  },
  image: {
    width: 47,
    height: 47,
  },
  card: {
    backgroundColor: '#FCF9F9',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    color: '#8A8A8A',
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
