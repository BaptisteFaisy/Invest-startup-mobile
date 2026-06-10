import React from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BG    = '#f5f4f0';
const CARD  = '#ffffff';
const LINE  = 'rgba(0,0,0,0.08)';
const MUTED = 'rgba(0,0,0,0.4)';
const TEXT  = '#09090b';
const GREEN = '#16a34a';

const CONTACTS = [
  {
    label:  'Email',
    value:  'liquidplus.contact@gmail.com',
    btn:    'Écrire',
    color:  TEXT,
    bgBtn:  'transparent',
    border: TEXT,
    icon:   'mail-outline',
    url:    'mailto:liquidplus.contact@gmail.com',
  },
  {
    label:  'Calendly',
    value:  'Prendre un rendez-vous',
    btn:    'Réserver',
    color:  TEXT,
    bgBtn:  TEXT,
    border: TEXT,
    icon:   'calendar-outline',
    url:    'https://calendly.com/liquidplus-contact/30min',
    btnColor: '#fff',
  },
  {
    label:  'WhatsApp',
    value:  '+33 6 48 17 63 23',
    btn:    'Message',
    color:  TEXT,
    bgBtn:  '#25D366',
    border: '#25D366',
    icon:   'logo-whatsapp',
    url:    'https://wa.me/33648176323',
    btnColor: '#fff',
  },
  {
    label:  'WhatsApp',
    value:  '+33 7 69 66 45 31',
    btn:    'Message',
    color:  TEXT,
    bgBtn:  '#25D366',
    border: '#25D366',
    icon:   'logo-whatsapp',
    url:    'https://wa.me/33769664531',
    btnColor: '#fff',
  },
  {
    label:  'LinkedIn',
    value:  'linkedin.com/company/liquidplus',
    btn:    'Suivre',
    color:  TEXT,
    bgBtn:  '#0A66C2',
    border: '#0A66C2',
    icon:   'logo-linkedin',
    url:    'https://www.linkedin.com/company/liquidplus',
    btnColor: '#fff',
  },
];

export default function ContactScreen() {
  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Brand */}
        <View style={s.brand}>
          <Image source={require('../../assets/goutte.png')} style={s.brandImg} />
          <Text style={s.brandTxt}>LIQUID+</Text>
        </View>

        <Text style={s.heading}>Nous contacter</Text>
        <Text style={s.sub}>Une question, un projet&nbsp;? On vous répond sous 24&nbsp;h.</Text>

        {CONTACTS.map((c, i) => (
          <View key={i} style={s.card}>
            <View style={s.cardLeft}>
              <View style={s.labelRow}>
                <Ionicons name={c.icon} size={14} color={MUTED} />
                <Text style={s.label}>{c.label}</Text>
              </View>
              <Text style={[s.value, { color: c.color }]} numberOfLines={1}>{c.value}</Text>
            </View>
            <TouchableOpacity
              style={[
                s.btn,
                { backgroundColor: c.bgBtn, borderColor: c.border },
                c.bgBtn === 'transparent' && s.btnOutline,
              ]}
              activeOpacity={0.75}
              onPress={() => Linking.openURL(c.url)}
            >
              <Text style={[s.btnTxt, { color: c.btnColor || TEXT }]}>{c.btn}</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 60, gap: 12 },

  brand:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  brandImg: { width: 20, height: 20, resizeMode: 'contain', tintColor: TEXT },
  brandTxt: { fontSize: 13, fontWeight: '800', letterSpacing: 3, color: TEXT, textTransform: 'uppercase' },

  heading: { fontSize: 28, fontWeight: '800', color: TEXT, letterSpacing: -0.5, marginBottom: 4 },
  sub:     { fontSize: 14, color: MUTED, lineHeight: 22, marginBottom: 8 },

  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardLeft:  { flex: 1, gap: 4 },
  labelRow:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label:     { fontSize: 11, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8 },
  value:     { fontSize: 14, fontWeight: '700' },

  btn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 2,
    flexShrink: 0,
  },
  btnOutline: { backgroundColor: 'transparent' },
  btnTxt: { fontSize: 13, fontWeight: '700' },
});
