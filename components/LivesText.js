import React from 'react';
import { StyleSheet, Text,Platform, View, Dimensions} from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import { LIVES } from '../src/quizManager';

function generateTextShadow(width) {
  return  Platform.select({ web: {
    textShadow: `-${width}px 0px 0px #000, ${width}px 0px 0px #000, 0px -${width}px 0px #000, 0px ${width}px 0px #000`
  }, default: {} });
} 
const textShadow = generateTextShadow(4)
export default function Lives() {
  const { top, left } = useSafeArea();
  return (
    <View pointerEvents="none" style={[styles.container, { top: Math.max(top, 16), left: Math.max(left, 8) }]}>
      <span><Text style={[styles.lives, textShadow]}>{LIVES}</Text><Text style={[styles.livesText, textShadow]}> {LIVES != 1 ? "Lives" : "Life"}</Text></span>
      <Text style={[styles.livesText, textShadow]}>remaining</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    marginLeft: Dimensions.get('window').width-250
  },
  
  lives: {
    color: 'lightcoral',
    fontFamily: 'retro_menu',
    fontSize: 48,
    backgroundColor: 'transparent',
  },
  livesText: {
    color: "lightcoral",
    fontFamily: "retro",
    fontSize: 32,
    backgroundColor: 'transparent',
    marginTop: -30,
    letterSpacing: '0.1em',
  },
})