import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';

const ITEMS = [
  { n: '01', title: 'Sélection des dossiers',  body: 'Chaque startup a été analysée par notre équipe : modèle économique, équipe fondatrice, traction, marché adressable.' },
  { n: '02', title: 'Suivi de vos positions',  body: "Retrouvez l'ensemble de vos participations dans l'onglet Portefeuille. Valorisation, capital investi, plus ou moins-value latente." },
  { n: '03', title: 'Transparence totale',     body: 'Chaque fiche startup présente les informations clés : équipe, stade, capital levé, marché. Aucun filtre commercial.' },
  { n: '04', title: 'Risques',                 body: "L'investissement en startup est illiquide et risqué. La plupart des startups échouent. Ne jamais investir plus que ce que l'on accepte de perdre." },
];

export default function HowItWorksScreen() {
  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}>

      <View style={s.header}>
        <Text style={s.title}>Comment ça fonctionne</Text>
      </View>

      <View style={s.list}>
        {ITEMS.map((item, i) => (
          <View key={i} style={[s.item, i < ITEMS.length - 1 && s.itemBorder]}>
            <Text style={s.num}>{item.n}</Text>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.itemTitle}>{item.title}</Text>
              <Text style={s.itemBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: LINE },
  title:  { fontSize: 28, fontWeight: '800', color: WHITE },

  list:       { marginHorizontal: 20, marginTop: 24, backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  item:       { flexDirection: 'row', paddingVertical: 22, paddingHorizontal: 20, gap: 18 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: LINE },
  num:        { fontSize: 12, fontWeight: '800', color: MUTED, width: 24, marginTop: 2 },
  itemTitle:  { fontSize: 15, fontWeight: '700', color: WHITE },
  itemBody:   { fontSize: 13, color: MUTED, lineHeight: 20 },
});
