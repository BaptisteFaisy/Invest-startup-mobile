import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { startupsAPI } from '../services/api';

const BG    = '#f5f4f0';
const CARD  = '#ffffff';
const LINE  = 'rgba(0,0,0,0.08)';
const MUTED = 'rgba(0,0,0,0.4)';
const WHITE = '#09090b';

export default function StartupsScreen({ navigation }) {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    startupsAPI.getAll()
      .then(d => setStartups(d.startups || []))
      .catch(() => setStartups([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator color={WHITE} /></View>;

  if (startups.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <View style={s.brand}>
          <Image source={require('../../assets/goutte.png')} style={s.brandImg} />
          <Text style={s.brandTxt}>LIQUID+</Text>
        </View>
        <View style={s.bubble}>
          <Text style={s.bubbleIcon}>🚧</Text>
          <Text style={s.bubbleTitle}>Bientôt disponible</Text>
          <Text style={s.bubbleSub}>Les startups sélectionnées par{'\n'}LIQUID+ arrivent prochainement.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Startups</Text>
        <Text style={s.count}>{startups.length}</Text>
      </View>
      <FlatList
        data={startups}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <Row startup={item} last={index === startups.length - 1}
            onPress={() => navigation.navigate('StartupDetail', { startup: item })} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function Row({ startup, last, onPress }) {
  return (
    <TouchableOpacity style={[s.row, !last && s.rowBorder]} onPress={onPress} activeOpacity={0.6}>
      <View style={[s.logo, { backgroundColor: startup.color || '#1a1d24' }]}>
        <Text style={s.logoTxt}>{startup.emoji || startup.name[0]}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.name}>{startup.name}</Text>
        <Text style={s.sub}>{startup.sector}</Text>
      </View>
      <View style={s.right}>
        <Text style={s.ticket}>{startup.ticket}</Text>
        <View style={[s.dot, { backgroundColor: startup.open ? '#16a34a' : LINE }]} />
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: BG },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG },
  emptyContainer: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', gap: 40, padding: 24 },
  errorTxt:       { fontSize: 13, color: MUTED },

  brand:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandImg: { width: 28, height: 28, resizeMode: 'contain', tintColor: '#09090b' },
  brandTxt: { fontFamily: 'Archivo_700Bold', fontSize: 16, fontWeight: '700', letterSpacing: 3, color: WHITE, textTransform: 'uppercase' },

  bubble:      { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: LINE, borderRadius: 24, paddingHorizontal: 36, paddingVertical: 36, maxWidth: 280, width: '100%', alignItems: 'center', gap: 10 },
  bubbleIcon:  { fontSize: 32, marginBottom: 4 },
  bubbleTitle: { fontSize: 16, fontWeight: '800', color: WHITE, textAlign: 'center', letterSpacing: -0.2 },
  bubbleSub:   { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },

  header: {
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: LINE,
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
  },
  title: { fontSize: 28, fontWeight: '800', color: WHITE },
  count: { fontSize: 13, color: MUTED, fontWeight: '600' },

  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: LINE },

  logo:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoTxt: { fontSize: 18, fontWeight: '800', color: '#fff' },

  info:    { flex: 1 },
  name:    { fontSize: 15, fontWeight: '700', color: WHITE },
  sub:     { fontSize: 12, color: MUTED, marginTop: 2 },

  right:   { alignItems: 'flex-end', gap: 6 },
  ticket:  { fontSize: 12, fontWeight: '600', color: MUTED, fontVariant: ['tabular-nums'] },
  dot:     { width: 7, height: 7, borderRadius: 4 },
});
