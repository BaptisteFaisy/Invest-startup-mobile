import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Linking,
} from 'react-native';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';

function InfoRow({ label, value, last }) {
  return (
    <View style={[d.row, !last && d.rowBorder]}>
      <Text style={d.rowLabel}>{label}</Text>
      <Text style={d.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function StartupDetailScreen({ route }) {
  const { startup } = route.params;

  return (
    <ScrollView style={d.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}>

      {/* Identité */}
      <View style={d.identity}>
        <View style={[d.logo, { backgroundColor: startup.color || '#1a1d24' }]}>
          <Text style={d.logoTxt}>{startup.emoji || startup.name[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={d.name}>{startup.name}</Text>
          <Text style={d.tagline}>{startup.tagline}</Text>
        </View>
        <View style={startup.open ? d.openBadge : d.closedBadge}>
          <Text style={startup.open ? d.openTxt : d.closedTxt}>
            {startup.open ? 'Ouvert' : 'Fermé'}
          </Text>
        </View>
      </View>

      {/* Fiche */}
      <View style={d.card}>
        <InfoRow label="Secteur"     value={startup.sector}   />
        <InfoRow label="Stade"       value={startup.stage}    />
        <InfoRow label="Fondée"      value={startup.founded}  />
        <InfoRow label="Capital levé" value={startup.raised}  />
        <InfoRow label="Ticket min." value={startup.ticket} last />
      </View>

      {/* Description */}
      {startup.description && (
        <View style={d.section}>
          <Text style={d.sectionLabel}>PRÉSENTATION</Text>
          <Text style={d.body}>{startup.description}</Text>
        </View>
      )}

      {startup.problem && (
        <View style={d.section}>
          <Text style={d.sectionLabel}>PROBLÈME</Text>
          <Text style={d.body}>{startup.problem}</Text>
        </View>
      )}

      {startup.solution && (
        <View style={d.section}>
          <Text style={d.sectionLabel}>SOLUTION</Text>
          <Text style={d.body}>{startup.solution}</Text>
        </View>
      )}

      {/* Équipe */}
      {(startup.team || []).length > 0 && (
        <View style={d.section}>
          <Text style={d.sectionLabel}>ÉQUIPE</Text>
          <View style={d.card}>
            {startup.team.map((m, i) => (
              <View key={i} style={[d.row, i < startup.team.length - 1 && d.rowBorder]}>
                <View style={[d.avatar, { backgroundColor: m.color || startup.color || '#1a1d24' }]}>
                  <Text style={d.avatarTxt}>{m.name[0]}</Text>
                </View>
                <View>
                  <Text style={d.rowValue}>{m.name}</Text>
                  <Text style={d.rowLabel}>{m.role}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Liens */}
      {(startup.website || startup.linkedin) && (
        <View style={d.section}>
          <Text style={d.sectionLabel}>LIENS</Text>
          <View style={d.linksRow}>
            {startup.website  && <TouchableOpacity style={d.link} onPress={() => Linking.openURL(startup.website)}><Text style={d.linkTxt}>Site web →</Text></TouchableOpacity>}
            {startup.linkedin && <TouchableOpacity style={d.link} onPress={() => Linking.openURL(startup.linkedin)}><Text style={d.linkTxt}>LinkedIn →</Text></TouchableOpacity>}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const d = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  identity: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 24,
    borderBottomWidth: 1, borderBottomColor: LINE,
  },
  logo:    { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoTxt: { fontSize: 20, fontWeight: '800', color: '#fff' },
  name:    { fontSize: 18, fontWeight: '800', color: WHITE },
  tagline: { fontSize: 12, color: MUTED, marginTop: 2, lineHeight: 17 },

  openBadge:  { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(22,163,74,0.15)', borderWidth: 1, borderColor: 'rgba(22,163,74,0.3)' },
  openTxt:    { fontSize: 11, fontWeight: '700', color: '#4ade80' },
  closedBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: LINE },
  closedTxt:  { fontSize: 11, fontWeight: '600', color: MUTED },

  card:      { marginHorizontal: 20, marginTop: 20, backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: LINE },
  rowLabel:  { flex: 1, fontSize: 12, color: MUTED },
  rowValue:  { fontSize: 13, fontWeight: '700', color: WHITE },

  section:      { paddingHorizontal: 20, paddingTop: 28 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: MUTED, marginBottom: 12 },
  body:         { fontSize: 14, color: MUTED, lineHeight: 22 },

  avatar:    { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },

  linksRow: { flexDirection: 'row', gap: 10 },
  link:     { paddingVertical: 12, paddingHorizontal: 18, backgroundColor: CARD, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  linkTxt:  { fontSize: 13, fontWeight: '700', color: WHITE },
});
