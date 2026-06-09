import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import { investmentsAPI, newsAPI } from '../services/api';

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

export default function InvestmentsScreen({ navigation }) {
  const { user }                    = useAuth();
  const [investments, setInvestments] = useState([]);
  const [news, setNews]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('portfolio');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([investmentsAPI.getAll(), newsAPI.getAll()])
      .then(([inv, nws]) => { setInvestments(inv.investments || []); setNews(nws.news || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <View style={s.center}>
      <Text style={s.lockIcon}>🔒</Text>
      <Text style={s.lockTitle}>Connectez-vous pour accéder à votre portefeuille</Text>
      <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Profil', { screen: 'Login' })}>
        <Text style={s.loginBtnTxt}>Se connecter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color={colors.accent} size="large" /></View>;

  const totalInvested = investments.reduce((a, i) => a + i.invested, 0);
  const totalValue    = investments.reduce((a, i) => a + i.current_value, 0);
  const totalGain     = totalValue - totalInvested;
  const totalPct      = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(1) : '0';

  if (investments.length === 0) {
    return (
      <View style={s.center}>
        <View style={s.bubble}>
          <Text style={s.bubbleIcon}>📊</Text>
          <Text style={s.bubbleTitle}>Vous n'avez pas encore investi</Text>
          <Text style={s.bubbleSub}>Vos investissements apparaîtront{'\n'}ici dès votre premier placement.</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* Résumé sur fond sombre */}
      <View style={s.summary}>
        <Text style={s.summaryLabel}>VALEUR DU PORTEFEUILLE</Text>
        <Text style={s.summaryValue}>{fmt(totalValue)}</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryInvested}>Investi : {fmt(totalInvested)}</Text>
          <Text style={[s.summaryGain, { color: totalGain >= 0 ? '#4ade80' : '#f87171' }]}>
            {totalGain >= 0 ? '+' : ''}{fmt(totalGain)} ({totalPct}%)
          </Text>
        </View>
      </View>

      {/* Onglets */}
      <View style={s.tabs}>
        {['portfolio', 'news'].map(t => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>
              {t === 'portfolio' ? 'Portefeuille' : 'Actualités'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Portefeuille */}
      {tab === 'portfolio' && (
        <View style={s.list}>
          {investments.map(inv => (
            <View key={inv.id} style={s.card}>
              <View style={[s.stripe, { backgroundColor: inv.color }]} />
              <View style={s.cardBody}>
                <View style={s.cardHead}>
                  <View>
                    <Text style={s.invName}>{inv.name}</Text>
                    <Text style={s.invSector}>{inv.sector}</Text>
                  </View>
                  <View style={s.statusBadge}><Text style={s.statusTxt}>{inv.status}</Text></View>
                </View>
                <Text style={s.invDesc}>{inv.description}</Text>
                <View style={s.numbers}>
                  {[
                    { l: 'Investi', v: fmt(inv.invested), c: colors.text },
                    { l: 'Valeur', v: fmt(inv.current_value), c: inv.color },
                    { l: 'Perf.', v: `${inv.return_pct >= 0 ? '+' : ''}${inv.return_pct.toFixed(1)}%`, c: inv.return_pct >= 0 ? colors.green : colors.red },
                  ].map((n, i) => (
                    <View key={i} style={s.numberItem}>
                      <Text style={s.numberLabel}>{n.l}</Text>
                      <Text style={[s.numberValue, { color: n.c }]}>{n.v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actualités */}
      {tab === 'news' && (
        <View style={s.list}>
          {news.length === 0 ? (
            <View style={s.empty}><Text style={s.emptyTxt}>Pas d'actualités pour le moment</Text></View>
          ) : news.map(item => (
            <View key={item.id} style={s.newsCard}>
              <View style={s.newsHead}>
                <View style={[s.newsDot, { backgroundColor: item.startup_color }]} />
                <Text style={s.newsStartup}>{item.startup_name}</Text>
                <Text style={s.newsDate}>{item.date}</Text>
              </View>
              <Text style={s.newsTitle}>{item.title}</Text>
              <Text style={s.newsContent}>{item.content}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center:    { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  lockIcon:  { fontSize: 40 },
  lockTitle: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'center', lineHeight: 26 },
  loginBtn:  { backgroundColor: colors.accentBtn, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 32 },
  loginBtnTxt:{ color: '#fff', fontWeight: '700', fontSize: 15 },

  bubble:      { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 24, paddingHorizontal: 36, paddingVertical: 36, alignItems: 'center', gap: 10, maxWidth: 280 },
  bubbleIcon:  { fontSize: 32, marginBottom: 4 },
  bubbleTitle: { fontSize: 16, fontWeight: '800', color: '#f4f2ee', textAlign: 'center' },
  bubbleSub:   { fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 20 },

  summary: {
    backgroundColor: colors.bgDark,
    padding: 24,
    gap: 6,
  },
  summaryLabel:   { fontSize: 11, color: 'rgba(247,243,238,0.45)', textTransform: 'uppercase', letterSpacing: 1 },
  summaryValue:   { fontSize: 38, fontWeight: '900', color: colors.textLight },
  summaryRow:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryInvested:{ fontSize: 13, color: colors.textLightMuted },
  summaryGain:    { fontSize: 14, fontWeight: '700' },

  tabs: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1, borderColor: colors.line,
  },
  tabBtn:       { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.accentBtn },
  tabTxt:       { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  tabTxtActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 14 },

  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18, borderWidth: 1, borderColor: colors.line,
    overflow: 'hidden', flexDirection: 'row',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  stripe:   { width: 4 },
  cardBody: { flex: 1, padding: 16, gap: 10 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  invName:  { fontSize: 16, fontWeight: '800', color: colors.text },
  invSector:{ fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statusBadge:{ backgroundColor: 'rgba(22,163,74,0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(22,163,74,0.2)' },
  statusTxt:  { fontSize: 11, fontWeight: '700', color: colors.green },
  invDesc:  { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  numbers:  { flexDirection: 'row', gap: 8 },
  numberItem: { flex: 1, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: colors.line },
  numberLabel:{ fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  numberValue:{ fontSize: 13, fontWeight: '800' },

  empty:    { alignItems: 'center', paddingVertical: 40 },
  emptyTxt: { color: colors.textMuted, fontSize: 15 },

  newsCard: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.line, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  newsHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newsDot:  { width: 8, height: 8, borderRadius: 4 },
  newsStartup:{ fontSize: 12, fontWeight: '700', color: colors.textMuted, flex: 1 },
  newsDate: { fontSize: 11, color: colors.textMuted },
  newsTitle:{ fontSize: 15, fontWeight: '800', color: colors.text },
  newsContent:{ fontSize: 13, color: colors.textMuted, lineHeight: 20 },
});
