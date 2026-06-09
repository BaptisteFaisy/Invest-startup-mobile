import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const BG    = '#08090c';
const WHITE = '#f4f2ee';
const MUTED = 'rgba(255,255,255,0.35)';
const LINE  = 'rgba(255,255,255,0.07)';

export default function InvestmentsScreen() {
  return (
    <View style={s.container}>

      <View style={s.logo}>
        <Image source={require('../../assets/goutte.png')} style={s.logoImg} />
        <Text style={s.logoTxt}>LIQUID+</Text>
      </View>

      <View style={s.card}>
        <Text style={s.emoji}>📊</Text>
        <Text style={s.title}>Vous n'avez pas encore investi</Text>
        <Text style={s.sub}>Vos investissements apparaîtront{'\n'}ici dès votre premier placement.</Text>
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

  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    opacity: 0.5,
  },
  logoImg: { width: 28, height: 28, resizeMode: 'contain' },
  logoTxt: {
    fontFamily: 'Archivo_700Bold',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
    color: WHITE,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
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
