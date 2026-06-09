import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet,
} from 'react-native';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';
const UP    = '#4ade80';
const UP_BG = 'rgba(74,222,128,0.1)';

// ── Logique frais (identique au site) ──────────────────────────────────────

function liquidEntryPct(amount) {
  if (amount <=   5000) return 10.0;
  if (amount <=  10000) return  9.0;
  if (amount <=  30000) return  8.0;
  if (amount <= 100000) return  7.0;
  if (amount <= 300000) return  6.0;
  return 5.0;
}

function altarocMgmtPct(amount) {
  if (amount <   500000) return 2.50;
  if (amount <  1000000) return 2.25;
  if (amount <  2000000) return 2.00;
  if (amount <  3000000) return 1.80;
  if (amount < 10000000) return 1.65;
  return 1.50;
}

function anaxagoMgmtByYear(amount, year) {
  if (amount < 30000) {
    if (year === 1) return 4.5;
    if (year <= 5)  return 2.0;
  } else {
    if (year === 1) return 3.5;
    if (year <= 5)  return 1.0;
  }
  return 0;
}
function anaxagoMgmtLabel(amount) {
  return amount < 30000
    ? '4,5 % an 1 · 2 % / an'
    : '3,5 % an 1 · 1 % / an';
}

function blastEntryFee(amount) {
  if (amount <=  10000) return 1500 + amount * 0.05;
  if (amount <=  25000) return 2000 + amount * 0.05;
  if (amount <=  50000) return 3000 + amount * 0.04;
  if (amount <= 100000) return 5000 + amount * 0.04;
  return 10000 + amount * 0.03;
}
function blastEntryLabel(amount) {
  if (amount <=  10000) return '1 500 € + 5 %';
  if (amount <=  25000) return '2 000 € + 5 %';
  if (amount <=  50000) return '3 000 € + 4 %';
  if (amount <= 100000) return '5 000 € + 4 %';
  return '10 000 € + 3 %';
}
function blastMgmtAbs(amount, capital, year) {
  if (year === 1) return capital * 0.01;
  var fixed = amount <= 10000 ? 1500 : amount <= 25000 ? 2000 : amount <= 50000 ? 3000 : amount <= 100000 ? 5000 : 10000;
  return fixed + capital * 0.01;
}
function blastMgmtLabel(amount) {
  var s = amount <= 10000 ? '1 500 €' : amount <= 25000 ? '2 000 €' : amount <= 50000 ? '3 000 €' : amount <= 100000 ? '5 000 €' : '10 000 €';
  return '1 % an 1 · ' + s + ' + 1 % / an';
}

function fundoraEntryPct(amount) {
  if (amount < 30000)  return 20.0;
  if (amount < 100000) return 17.5;
  return 14.0;
}

function liquidPerfFee(capitalAfterEntry, finalCapital, amount) {
  if (finalCapital < amount * 10) return 0;
  return Math.max(0, finalCapital - amount) * 0.03;
}
function liquidPerfLabel(capitalAfterEntry, finalCapital, amount) {
  if (finalCapital < amount * 10) return 'Aucun (< x10)';
  return '3 % des gains (x10 atteint)';
}

const COMPANIES = [
  { name: 'LIQUID+',    entryFn: liquidEntryPct, entryAbsFn: null,           entryLbl: null,           entry: null, mgmtFn: null,          mgmtByYear: null,              mgmtAbsFn: null,         mgmtLbl: null,             mgmt: 0,    perf: null, perfFn: liquidPerfFee, perfLbl: liquidPerfLabel, minAmount: 1000,   minYears: 5 },
  { name: 'Altaroc',    entryFn: null,            entryAbsFn: null,           entryLbl: null,           entry: 5,   mgmtFn: altarocMgmtPct,  mgmtByYear: null,              mgmtAbsFn: null,         mgmtLbl: null,             mgmt: null, perf: 20,   perfFn: null,          perfLbl: null,            minAmount: 100000, minYears: 10 },
  { name: 'Anaxago',    entryFn: null,            entryAbsFn: null,           entryLbl: null,           entry: 2.5, mgmtFn: null,            mgmtByYear: anaxagoMgmtByYear, mgmtAbsFn: null,         mgmtLbl: anaxagoMgmtLabel, mgmt: null, perf: 10,   perfFn: null,          perfLbl: null,            minAmount: 1000,   minYears: 5 },
  { name: 'Blast Club', entryFn: null,            entryAbsFn: blastEntryFee,  entryLbl: blastEntryLabel, entry: null, mgmtFn: null,          mgmtByYear: null,              mgmtAbsFn: blastMgmtAbs, mgmtLbl: blastMgmtLabel,   mgmt: null, perf: 20,   perfFn: null,          perfLbl: null,            minAmount: 1000,   minYears: 5 },
  { name: 'Fundora *',  entryFn: fundoraEntryPct, entryAbsFn: null,           entryLbl: null,           entry: null, mgmtFn: null,          mgmtByYear: null,              mgmtAbsFn: null,         mgmtLbl: null,             mgmt: 0,    perf: 0,    perfFn: null,          perfLbl: null,            minAmount: 100,    minYears: 5 },
];

const COLORS = ['#080c14', '#8b5cf6', '#0ea5e9', '#ec4899', '#f97316'];

function getEntryPct(co, amount) { return co.entryFn ? co.entryFn(amount) : co.entry; }
function getMgmtPct(co, amount)  { return co.mgmtFn  ? co.mgmtFn(amount)  : co.mgmt; }

function calc(co, amount, yrs, returnRate) {
  var entryFee = co.entryAbsFn
    ? co.entryAbsFn(amount)
    : amount * (getEntryPct(co, amount) / 100);
  var entryDisplay = co.entryLbl
    ? co.entryLbl(amount)
    : (getEntryPct(co, amount)) + ' %';

  var capital           = amount - entryFee;
  var capitalAfterEntry = capital;
  var totalMgmt = 0;
  for (var y = 0; y < yrs; y++) {
    var gain = capital * returnRate;
    var mg;
    if (co.mgmtAbsFn)      mg = co.mgmtAbsFn(amount, capital, y + 1);
    else if (co.mgmtByYear) mg = capital * (co.mgmtByYear(amount, y + 1) / 100);
    else                    mg = capital * (getMgmtPct(co, amount) / 100);
    totalMgmt += mg;
    capital   += gain - mg;
  }

  var totalPerf, perfDisplay;
  if (co.perfFn) {
    totalPerf   = co.perfFn(capitalAfterEntry, capital, amount);
    perfDisplay = co.perfLbl ? co.perfLbl(capitalAfterEntry, capital, amount) : '—';
  } else {
    var exitGains = Math.max(0, capital - capitalAfterEntry);
    totalPerf    = exitGains * ((co.perf || 0) / 100);
    perfDisplay  = (co.perf || 0) + ' % à la sortie';
  }

  var mgmtDisplay = co.mgmtLbl
    ? co.mgmtLbl(amount)
    : (getMgmtPct(co, amount) + ' % / an');

  return { entryDisplay, mgmtDisplay, perfDisplay, entryFee, totalMgmt, totalPerf, total: entryFee + totalMgmt + totalPerf };
}

// ── Formatage ──────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
function fmtAmt(n) {
  if (n >= 1000000) return (n / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M€';
  if (n >= 1000)    return (n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' k€';
  return n + ' €';
}

// ── Paliers de montant ─────────────────────────────────────────────────────

const PRESETS = [5000, 25000, 50000, 100000, 250000, 500000];

// ── Composant principal ───────────────────────────────────────────────────

export default function FeeCalculatorScreen() {
  const [amount,      setAmount]      = useState(50000);
  const [amountText,  setAmountText]  = useState('50000');
  const [returnRate,  setReturnRate]  = useState(20);
  const [returnText,  setReturnText]  = useState('20');
  const [years,       setYears]       = useState(5);
  const [selectedCos, setSelectedCos] = useState([1]);
  const [search,      setSearch]      = useState('');
  const [dropOpen,    setDropOpen]    = useState(false);
  const searchRef = useRef(null);

  function toggleCo(idx) {
    setSelectedCos(prev => {
      if (prev.includes(idx)) return prev.filter(x => x !== idx);
      if (prev.length >= 3)   return prev;
      const next = [...prev, idx];
      const minY = next.reduce((mx, i) => Math.max(mx, COMPANIES[i].minYears), 5);
      if (years < minY) setYears(minY);
      return next;
    });
  }

  const minYears = selectedCos.reduce((mx, i) => Math.max(mx, COMPANIES[i].minYears), 5);
  const effectiveYears = Math.max(years, minYears);
  const rr = (returnRate || 20) / 100;

  const visIdx = [0, ...selectedCos];
  const visCos  = visIdx.map(i => COMPANIES[i]);
  const visCols = visIdx.map(i => COLORS[i]);
  const visRes  = visCos.map(co => {
    if (amount < co.minAmount) return null;
    return calc(co, amount, Math.max(effectiveYears, co.minYears), rr);
  });

  const maxTotal = visRes.reduce((mx, r) => r ? Math.max(mx, r.total) : mx, 1);
  const liquidRes = visRes[0];
  const minTotalIdx = visRes.reduce((minI, r, i) => {
    if (!r || amount < visCos[i].minAmount) return minI;
    if (minI === -1 || r.total < visRes[minI].total) return i;
    return minI;
  }, -1);

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

      {/* ── Header ── */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>Calculateur de frais</Text>
        <View style={s.pillRow}>
          <View style={s.pillGreen}>
            <Text style={s.pillGreenTxt}>La plateforme avec le moins de frais au monde</Text>
          </View>
          <View style={s.pillMuted}>
            <Text style={s.pillMutedTxt}>0 frais cachés</Text>
          </View>
        </View>
      </View>

      <View style={s.body}>

        {/* ── Montant ── */}
        <View style={s.block}>
          <Text style={s.blockLabel}>MONTANT INVESTI</Text>
          <View style={s.amountRow}>
            <TextInput
              style={s.amountInput}
              value={amountText}
              onChangeText={v => { setAmountText(v); const n = parseInt(v, 10); if (!isNaN(n) && n >= 100) setAmount(n); }}
              onBlur={() => { const v = Math.max(100, Math.min(10000000, parseInt(amountText, 10) || 50000)); setAmount(v); setAmountText(String(v)); }}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <Text style={s.amountEuro}>€</Text>
          </View>
        </View>

        {/* ── Espérance de rendement + Horizon ── */}
        <View style={s.rowBlock}>
          <View style={s.halfBlock}>
            <Text style={s.blockLabel}>RENDEMENT / AN</Text>
            <View style={s.returnRow}>
              <TextInput
                style={s.returnInput}
                value={returnText}
                onChangeText={v => { setReturnText(v); const n = parseFloat(v); if (!isNaN(n) && n > 0) setReturnRate(n); }}
                onBlur={() => { const v = Math.min(200, Math.max(1, parseFloat(returnText) || 20)); setReturnRate(v); setReturnText(String(v)); }}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={s.returnPct}>%</Text>
            </View>
          </View>
          <View style={s.halfBlock}>
            <Text style={s.blockLabel}>HORIZON</Text>
            <View style={s.horizonRow}>
              <TouchableOpacity
                style={[s.horizonBtn, effectiveYears === 5 && s.horizonBtnActive]}
                disabled={minYears > 5}
                onPress={() => setYears(5)}>
                <Text style={[s.horizonTxt, effectiveYears === 5 && s.horizonTxtActive, minYears > 5 && { opacity: 0.35 }]}>5 ans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.horizonBtn, effectiveYears === 10 && s.horizonBtnActive, s.horizonBtnRight]}
                onPress={() => setYears(10)}>
                <Text style={[s.horizonTxt, effectiveYears === 10 && s.horizonTxtActive]}>10 ans</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Comparer avec ── */}
        <View style={s.block}>
          <Text style={s.blockLabel}>COMPARER AVEC (max 3)</Text>

          {/* Champ de recherche */}
          <View style={s.searchWrap}>
            <View style={[s.searchBox, dropOpen && s.searchBoxFocused]}>
              <Text style={s.searchIcon}>⌕</Text>
              <TextInput
                ref={searchRef}
                style={s.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Rechercher un concurrent…"
                placeholderTextColor={MUTED}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 150)}
                returnKeyType="done"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Text style={s.searchClear}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdown */}
            {dropOpen && (
              <View style={s.dropdown}>
                {COMPANIES.slice(1)
                  .filter(co => co.name.toLowerCase().includes(search.toLowerCase()))
                  .map(co => {
                    const i        = COMPANIES.indexOf(co);
                    const selected = selectedCos.includes(i);
                    const disabled = !selected && selectedCos.length >= 3;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[s.dropItem, selected && s.dropItemSelected]}
                        onPress={() => {
                          if (!disabled) {
                            toggleCo(i);
                            setSearch('');
                          }
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[s.dropDot, { backgroundColor: COLORS[i] }]} />
                        <Text style={[
                          s.dropName,
                          selected && { color: COLORS[i], fontWeight: '700' },
                          disabled && { opacity: 0.35 },
                        ]}>
                          {co.name}
                        </Text>
                        {selected && <Text style={[s.dropCheck, { color: COLORS[i] }]}>✓</Text>}
                        {!selected && disabled && <Text style={s.dropMax}>max 3</Text>}
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
            )}
          </View>

          {/* Chips sélectionnés */}
          {selectedCos.length > 0 && (
            <View style={s.chipsRow}>
              {selectedCos.map(i => (
                <TouchableOpacity key={i}
                  style={[s.chip, { backgroundColor: COLORS[i] + '22', borderColor: COLORS[i] }]}
                  onPress={() => toggleCo(i)} activeOpacity={0.7}>
                  <View style={[s.chipDot, { backgroundColor: COLORS[i] }]} />
                  <Text style={[s.chipTxt, { color: COLORS[i] }]}>{COMPANIES[i].name}</Text>
                  <Text style={[s.chipRemove, { color: COLORS[i] }]}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Graphique barres ── */}
        <View style={s.block}>
          <Text style={s.blockLabel}>FRAIS TOTAUX EN {effectiveYears} ANS</Text>
          <View style={s.barsContainer}>
            {visCos.map((co, i) => {
              const r     = visRes[i];
              const color = co.name === 'LIQUID+' ? WHITE : visCols[i];
              if (amount < co.minAmount) {
                return (
                  <View key={i} style={s.barCol}>
                    <View style={s.barMinWrap}>
                      <Text style={s.barMinTxt}>Min.{'\n'}{fmtAmt(co.minAmount)}</Text>
                    </View>
                    <Text style={s.barName}>{co.name}</Text>
                  </View>
                );
              }
              const barMaxH = 140;
              const h = Math.max(8, Math.round((r.total / maxTotal) * barMaxH));
              return (
                <View key={i} style={s.barCol}>
                  <View style={[s.barWrapper, { height: barMaxH }]}>
                    <Text style={[s.barValue, { color }]}>{fmt(r.total)}</Text>
                    <View style={[s.bar, { height: h, backgroundColor: color }]} />
                  </View>
                  <Text style={[s.barName, co.name === 'LIQUID+' && s.barNameLiquid]}>{co.name}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Tableau comparatif ── */}
        <View style={s.block}>
          <Text style={s.blockLabel}>DÉTAIL DES FRAIS</Text>
          <View style={s.table}>
            {/* Header */}
            <View style={[s.tRow, s.tHeader]}>
              <Text style={[s.tCell, s.tLabelCell, s.tHeaderTxt]}>Type</Text>
              {visCos.map((co, i) => (
                <Text key={i} style={[s.tCell, s.tHeaderTxt, { color: co.name === 'LIQUID+' ? WHITE : visCols[i] }]}
                  numberOfLines={1}>{co.name}</Text>
              ))}
            </View>

            {/* Frais d'entrée */}
            <TableRow label="Frais payé à l'entrée" visRes={visRes} visCos={visCos} visCols={visCols} amount={amount} field="entryDisplay" />
            <TableRow label="Frais annuels" visRes={visRes} visCos={visCos} visCols={visCols} amount={amount} field="mgmtDisplay" />
            <TableRow label="Frais de performance" visRes={visRes} visCos={visCos} visCols={visCols} amount={amount} field="perfDisplay" thick />

            {/* Sous-jacent */}
            <TableRow label="Frais payé à l'entrée du sous-jacent" fixed="0 %" visCos={visCos} />
            <TableRow label="Frais annuels du sous-jacent" fixed="0 %" visCos={visCos} />
            <TableRow label="Frais de performance du sous-jacent" fixed="0 %" visCos={visCos} thick />

            {/* Total */}
            <View style={[s.tRow, s.tTotalRow]}>
              <Text style={[s.tCell, s.tLabelCell, s.tTotalLabel]}>Total frais calculés sur {effectiveYears} ans</Text>
              {visRes.map((r, i) => (
                <Text key={i} style={[s.tCell, s.tTotalValue, { color: visCos[i].name === 'LIQUID+' ? WHITE : visCols[i] }]}>
                  {r === null || amount < visCos[i].minAmount ? '—' : fmt(r.total)}
                </Text>
              ))}
            </View>

            {/* Économies */}
            <View style={[s.tRow, s.tSavingRow]}>
              <Text style={[s.tCell, s.tLabelCell, s.tSavingLabel]}>▲ Économies réalisées avec LIQUID+</Text>
              {visRes.map((r, i) => {
                if (visCos[i].name === 'LIQUID+') return <Text key={i} style={[s.tCell, s.tSavingValue]}>Référence</Text>;
                if (r === null || liquidRes === null || amount < visCos[i].minAmount) return <Text key={i} style={[s.tCell, s.tSavingValue]}>—</Text>;
                const saving = r.total - liquidRes.total;
                return <Text key={i} style={[s.tCell, s.tSavingAmount]}>+ {fmt(saving)}</Text>;
              })}
            </View>

            {/* Soit moins cher de */}
            <View style={[s.tRow, s.tSavingRow2]}>
              <Text style={[s.tCell, s.tLabelCell, s.tSaving2Label]}>Soit LIQUID+ est moins cher de</Text>
              {visRes.map((r, i) => {
                if (visCos[i].name === 'LIQUID+') return <Text key={i} style={[s.tCell, s.tSaving2Value]}>—</Text>;
                if (r === null || liquidRes === null || liquidRes.total === 0 || amount < visCos[i].minAmount) return <Text key={i} style={[s.tCell, s.tSaving2Value]}>—</Text>;
                const times = (r.total / liquidRes.total).toFixed(1);
                return <Text key={i} style={[s.tCell, s.tSaving2Amount]}>{times}x moins cher</Text>;
              })}
            </View>
          </View>
        </View>

        {/* ── Barème LIQUID+ ── */}
        <View style={s.block}>
          <Text style={s.blockLabel}>BARÈME DES FRAIS LIQUID+</Text>
          <View style={s.table}>
            {[
              ['1 000 € – 5 000 €',       '10 %'],
              ['5 000 € – 10 000 €',       '9 %'],
              ['10 000 € – 30 000 €',      '8 %'],
              ['30 000 € – 100 000 €',     '7 %'],
              ['100 000 € – 300 000 €',    '6 %'],
              ['300 000 € et plus',        '5 %'],
            ].map(([label, val], i) => (
              <View key={i} style={[s.scheduleRow, i < 5 && s.scheduleBorder]}>
                <Text style={s.scheduleLabel}>{label}</Text>
                <Text style={s.scheduleValue}>{val}</Text>
              </View>
            ))}
            <View style={[s.scheduleRow, s.scheduleTopBorder]}>
              <Text style={s.scheduleLabel}>Frais de performance (si x10)</Text>
              <Text style={s.scheduleValue}>3 % des gains</Text>
            </View>
            <View style={[s.scheduleRow, s.scheduleTopBorder, s.scheduleGreenRow]}>
              <Text style={s.scheduleLabelGreen}>Frais cachés</Text>
              <Text style={s.scheduleValueGreen}>0 %</Text>
            </View>
          </View>
        </View>

        <Text style={s.note}>
          * Le calcul des frais de Fundora n'est pas significatif : les frais des sociétés sous-jacentes ne sont pas pris en compte dans cette simulation.
        </Text>

      </View>
    </ScrollView>
  );
}

function TableRow({ label, visRes, visCos, visCols, amount, field, fixed, thick }) {
  return (
    <View style={[s.tRow, s.tDataRow, thick && s.tDataRowThick]}>
      <Text style={[s.tCell, s.tLabelCell, s.tRowLabel]}>{label}</Text>
      {fixed !== undefined
        ? visCos.map((_, i) => <Text key={i} style={[s.tCell, s.tRowValue]}>{fixed}</Text>)
        : visRes.map((r, i) => (
            <Text key={i} numberOfLines={2} style={[s.tCell, s.tRowValue]}>
              {r === null || amount < visCos[i].minAmount ? '—' : r[field]}
            </Text>
          ))
      }
    </View>
  );
}

const BAR_H = 140;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  hero: { paddingHorizontal: 24, paddingTop: 72, paddingBottom: 28, gap: 6 },
  eyebrow:   { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: MUTED, marginBottom: 10 },
  heroTitle: { fontSize: 28, fontWeight: '800', color: WHITE },
  heroSub:   { fontSize: 13, color: MUTED },

  pillRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  pillGreen:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(74,222,128,0.15)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  pillGreenTxt: { fontSize: 12, fontWeight: '600', color: UP },
  pillMuted:    { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: LINE },
  pillMutedTxt: { fontSize: 12, fontWeight: '600', color: MUTED },

  body: { padding: 20, gap: 24 },

  block:      { gap: 12 },
  blockLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: MUTED },

  // Montant
  amountRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  amountInput: { fontSize: 36, fontWeight: '900', color: WHITE, padding: 0, minWidth: 120, fontVariant: ['tabular-nums'] },
  amountEuro:  { fontSize: 22, fontWeight: '700', color: MUTED },

  // Rendement + Horizon
  rowBlock:  { flexDirection: 'row', gap: 20 },
  halfBlock: { flex: 1, gap: 10 },
  returnRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, borderBottomWidth: 2, borderBottomColor: WHITE, paddingBottom: 4 },
  returnInput:{ fontSize: 22, fontWeight: '800', color: WHITE, padding: 0, minWidth: 48, fontVariant: ['tabular-nums'] },
  returnPct: { fontSize: 16, fontWeight: '700', color: WHITE },

  horizonRow:    { flexDirection: 'row', borderWidth: 1, borderColor: LINE, borderRadius: 10, overflow: 'hidden' },
  horizonBtn:    { flex: 1, paddingVertical: 10, alignItems: 'center', backgroundColor: CARD },
  horizonBtnActive:{ backgroundColor: WHITE },
  horizonBtnRight:{ borderLeftWidth: 1, borderLeftColor: LINE },
  horizonTxt:    { fontSize: 13, fontWeight: '600', color: MUTED },
  horizonTxtActive:{ color: BG, fontWeight: '700' },

  // Recherche + dropdown
  searchWrap:       { position: 'relative', zIndex: 10 },
  searchBox:        { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: LINE, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  searchBoxFocused: { borderColor: 'rgba(255,255,255,0.25)' },
  searchIcon:       { fontSize: 18, color: MUTED },
  searchInput:      { flex: 1, fontSize: 14, color: WHITE, padding: 0 },
  searchClear:      { fontSize: 13, color: MUTED, paddingHorizontal: 4 },

  dropdown:         { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: LINE, marginTop: 6, overflow: 'hidden', elevation: 10, zIndex: 20 },
  dropItem:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: LINE },
  dropItemSelected: { backgroundColor: 'rgba(255,255,255,0.04)' },
  dropDot:          { width: 8, height: 8, borderRadius: 4 },
  dropName:         { flex: 1, fontSize: 14, color: WHITE },
  dropCheck:        { fontSize: 14, fontWeight: '700' },
  dropMax:          { fontSize: 11, color: MUTED, fontWeight: '600' },

  // Chips concurrents sélectionnés
  chipsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, gap: 6 },
  chipDot:    { width: 7, height: 7, borderRadius: 999 },
  chipTxt:    { fontSize: 12, fontWeight: '700' },
  chipRemove: { fontSize: 11, fontWeight: '700', marginLeft: 2 },

  // Barres
  barsContainer: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: 28 },
  barCol:     { flex: 1, alignItems: 'center', gap: 8 },
  barWrapper: { justifyContent: 'flex-end', alignItems: 'center', gap: 6, width: '100%' },
  bar:        { width: '100%', borderRadius: 4 },
  barValue:   { fontSize: 13, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  barLine:    { height: 2, width: '100%', backgroundColor: LINE, borderRadius: 2 },
  barName:    { fontSize: 9, fontWeight: '600', color: MUTED, textAlign: 'center', letterSpacing: 0.3 },
  barNameLiquid: { color: WHITE, fontWeight: '800' },
  barMinWrap: { height: BAR_H, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: LINE, borderRadius: 8, width: '100%' },
  barMinTxt:  { fontSize: 9, color: MUTED, textAlign: 'center', lineHeight: 14 },

  // Table
  table:      { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  tRow:       { flexDirection: 'row' },
  tHeader:    { borderBottomWidth: 2, borderBottomColor: LINE, backgroundColor: BG },
  tHeaderTxt: { fontSize: 11, fontWeight: '700', color: WHITE, paddingVertical: 10 },
  tDataRow:     { borderBottomWidth: 1, borderBottomColor: LINE },
  tDataRowThick:{ borderBottomWidth: 2, borderBottomColor: LINE },
  tTotalRow:  { borderTopWidth: 2, borderTopColor: LINE, backgroundColor: 'rgba(255,255,255,0.03)' },
  tSavingRow: { backgroundColor: UP_BG },
  tCell:      { flex: 1, paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'center' },
  tLabelCell: { flex: 1.2 },
  tRowLabel:  { fontSize: 11, color: MUTED },
  tRowValue:  { fontSize: 11, color: WHITE, fontWeight: '500' },
  tTotalLabel:{ fontSize: 12, fontWeight: '700', color: WHITE },
  tTotalValue:{ fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  tSavingLabel: { fontSize: 11, fontWeight: '700', color: UP },
  tSavingValue: { fontSize: 11, color: MUTED },
  tSavingAmount:{ fontSize: 13, fontWeight: '800', color: UP, fontVariant: ['tabular-nums'] },

  tSavingRow2:  { backgroundColor: 'rgba(74,222,128,0.03)' },
  tSaving2Label:{ fontSize: 11, fontWeight: '600', color: UP },
  tSaving2Value:{ fontSize: 11, color: MUTED },
  tSaving2Amount:{ fontSize: 13, fontWeight: '700', color: UP },

  // Barème
  scheduleRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  scheduleBorder:   { borderBottomWidth: 1, borderBottomColor: LINE },
  scheduleTopBorder:{ borderTopWidth: 2, borderTopColor: LINE },
  scheduleLabel:    { fontSize: 13, color: MUTED },
  scheduleValue:    { fontSize: 13, fontWeight: '700', color: WHITE },
  scheduleGreenRow: { backgroundColor: UP_BG },
  scheduleLabelGreen:{ fontSize: 13, fontWeight: '700', color: UP },
  scheduleValueGreen:{ fontSize: 13, fontWeight: '800', color: UP },

  note: { fontSize: 10, color: MUTED, lineHeight: 16 },
});
