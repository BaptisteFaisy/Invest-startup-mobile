import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const BG    = '#f5f4f0';
const WHITE = '#09090b';
const MUTED = 'rgba(0,0,0,0.4)';
const LINE  = 'rgba(0,0,0,0.08)';

export default function SecondaryMarketScreen() {
  return (
    <View style={s.container}>
      <View style={s.logo}>
        <Image source={require('../../assets/goutte.png')} style={s.logoImg} />
        <Text style={s.logoTxt}>LIQUID+</Text>
      </View>
      <View style={s.card}>
        <Text style={s.emoji}>🔄</Text>
        <Text style={s.title}>Marché secondaire</Text>
        <Text style={s.sub}>La revente de parts entre investisseurs{'\n'}arrive prochainement.</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    padding: 24,
  },
  logo:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: WHITE },
  logoTxt: { fontFamily: 'Archivo_700Bold', fontSize: 13, fontWeight: '700', letterSpacing: 3, color: WHITE, textTransform: 'uppercase' },

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 24,
    paddingHorizontal: 36,
    paddingVertical: 36,
    maxWidth: 280,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  emoji: { fontSize: 32, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '800', color: WHITE, textAlign: 'center', letterSpacing: -0.2 },
  sub:   { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
});
