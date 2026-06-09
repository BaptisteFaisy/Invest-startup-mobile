import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Image, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { twoFAAPI, passwordAPI } from '../services/api';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';
const GREEN = '#4ade80';

function InfoRow({ label, value, last }) {
  return (
    <View style={[s.row, !last && s.rowBorder]}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();

  const [editing,   setEditing]   = useState(false);
  const [editName,  setEditName]  = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [pwdOpen,      setPwdOpen]      = useState(false);
  const [currentPwd,   setCurrentPwd]   = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [pwdSaving,    setPwdSaving]    = useState(false);
  const [pwdError,     setPwdError]     = useState(null);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);

  const [twoFAEnabled,     setTwoFAEnabled]     = useState(false);
  const [twoFALoading,     setTwoFALoading]     = useState(true);
  const [setupData,        setSetupData]        = useState(null);
  const [code,             setCode]             = useState('');
  const [codeError,        setCodeError]        = useState(null);
  const [confirmLoading,   setConfirmLoading]   = useState(false);

  useEffect(() => { load2FAStatus(); }, []);

  async function load2FAStatus() {
    try {
      const data = await twoFAAPI.status();
      setTwoFAEnabled(data.enabled);
    } catch {}
    setTwoFALoading(false);
  }

  function startEdit() {
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setSaveError(null);
    setEditing(true);
  }

  async function saveProfile() {
    setSaving(true); setSaveError(null);
    const result = await updateProfile(editName, editEmail);
    setSaving(false);
    if (result.success) setEditing(false);
    else setSaveError(result.error);
  }

  async function startSetup() {
    setTwoFALoading(true); setCodeError(null); setCode('');
    try {
      const data = await twoFAAPI.setup();
      setSetupData(data);
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
    setTwoFALoading(false);
  }

  async function confirmCode() {
    if (code.length !== 6) { setCodeError('Code à 6 chiffres requis.'); return; }
    setConfirmLoading(true); setCodeError(null);
    try {
      await twoFAAPI.confirm(code);
      setTwoFAEnabled(true);
      setSetupData(null);
      setCode('');
    } catch (e) {
      setCodeError(e.message);
    }
    setConfirmLoading(false);
  }

  async function savePassword() {
    if (!currentPwd || !newPwd) { setPwdError('Remplissez tous les champs.'); return; }
    if (newPwd.length < 6) { setPwdError('6 caractères minimum.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    setPwdSaving(true); setPwdError(null); setPwdSuccess(false);
    try {
      await passwordAPI.change(currentPwd, newPwd);
      setPwdSuccess(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => { setPwdOpen(false); setPwdSuccess(false); }, 1500);
    } catch (e) {
      setPwdError(e.message);
    }
    setPwdSaving(false);
  }

  function disable2FA() {
    Alert.alert('Désactiver la 2FA', 'Confirmer la désactivation ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Désactiver', style: 'destructive', onPress: async () => {
        setTwoFALoading(true);
        try { await twoFAAPI.disable(); setTwoFAEnabled(false); }
        catch (e) { Alert.alert('Erreur', e.message); }
        setTwoFALoading(false);
      }},
    ]);
  }

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}>

      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <Text style={s.avatarTxt}>{initials}</Text>
        </View>
        <Text style={s.nameTitle}>{user.name || 'Investisseur'}</Text>
        <Text style={s.emailTitle}>{user.email}</Text>
      </View>

      {/* ── COMPTE ── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>COMPTE</Text>
          {!editing && (
            <TouchableOpacity style={s.editBtn} onPress={startEdit}>
              <Ionicons name="pencil-outline" size={13} color={MUTED} />
              <Text style={s.editBtnTxt}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.card}>
          {editing ? (
            <>
              <View style={[s.editField, s.rowBorder]}>
                <Text style={s.rowLabel}>NOM</Text>
                <TextInput style={s.editInput} value={editName} onChangeText={setEditName}
                  placeholder="Ton nom" placeholderTextColor={MUTED} />
              </View>
              <View style={s.editField}>
                <Text style={s.rowLabel}>EMAIL</Text>
                <TextInput style={s.editInput} value={editEmail} onChangeText={setEditEmail}
                  keyboardType="email-address" autoCapitalize="none"
                  placeholder="ton@email.com" placeholderTextColor={MUTED} />
              </View>
              {saveError ? <Text style={s.errorTxt}>{saveError}</Text> : null}
              <View style={s.actions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}>
                  <Text style={s.cancelTxt}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color={BG} size="small" />
                    : <Text style={s.saveTxt}>Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <InfoRow label="Nom"   value={user.name} />
              <InfoRow label="Email" value={user.email} last />
            </>
          )}
        </View>
      </View>

      {/* ── MOT DE PASSE ── */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionLabel}>MOT DE PASSE</Text>
          {!pwdOpen && (
            <TouchableOpacity style={s.editBtn} onPress={() => { setPwdOpen(true); setPwdError(null); setPwdSuccess(false); }}>
              <Ionicons name="pencil-outline" size={13} color={MUTED} />
              <Text style={s.editBtnTxt}>Modifier</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={s.card}>
          {!pwdOpen ? (
            <View style={s.row}>
              <Text style={s.rowLabel}>Mot de passe</Text>
              <Text style={s.rowValue}>••••••••</Text>
            </View>
          ) : (
            <>
              {[
                { label: 'ACTUEL',      value: currentPwd, set: setCurrentPwd, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                { label: 'NOUVEAU',     value: newPwd,     set: setNewPwd,     show: showNew,     toggle: () => setShowNew(v => !v) },
                { label: 'CONFIRMER',   value: confirmPwd, set: setConfirmPwd, show: showNew,     toggle: null },
              ].map((f, i, arr) => (
                <View key={f.label} style={[s.editField, i < arr.length - 1 && s.rowBorder]}>
                  <Text style={s.rowLabel}>{f.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={[s.editInput, { flex: 1 }]}
                      value={f.value}
                      onChangeText={f.set}
                      secureTextEntry={!f.show}
                      placeholder="••••••••"
                      placeholderTextColor={MUTED}
                      autoCapitalize="none"
                    />
                    {f.toggle && (
                      <TouchableOpacity onPress={f.toggle} style={{ paddingLeft: 8 }}>
                        <Ionicons name={f.show ? 'eye-off' : 'eye'} size={18} color={MUTED} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              {pwdError   ? <Text style={s.errorTxt}>{pwdError}</Text>   : null}
              {pwdSuccess ? <Text style={[s.errorTxt, { color: GREEN }]}>Mot de passe modifié ✓</Text> : null}
              <View style={s.actions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setPwdOpen(false); setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); }}>
                  <Text style={s.cancelTxt}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={savePassword} disabled={pwdSaving}>
                  {pwdSaving ? <ActivityIndicator color={BG} size="small" /> : <Text style={s.saveTxt}>Enregistrer</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* ── SÉCURITÉ ── */}
      <View style={s.section}>
        <Text style={s.sectionLabel}>SÉCURITÉ</Text>
        <View style={s.card}>
          <View style={[s.row, setupData ? s.rowBorder : null]}>
            <View style={{ gap: 2 }}>
              <Text style={s.rowLabel}>Double authentification</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: twoFAEnabled ? GREEN : MUTED }}>
                {twoFAEnabled ? '● Activé' : '○ Désactivé'}
              </Text>
            </View>
            {twoFALoading
              ? <ActivityIndicator color={MUTED} size="small" />
              : twoFAEnabled
                ? <TouchableOpacity style={s.badgeBtn} onPress={disable2FA}>
                    <Text style={[s.badgeTxt, { color: '#f87171' }]}>Désactiver</Text>
                  </TouchableOpacity>
                : !setupData
                  ? <TouchableOpacity style={s.badgeBtn} onPress={startSetup}>
                      <Text style={s.badgeTxt}>Activer</Text>
                    </TouchableOpacity>
                  : null
            }
          </View>

          {setupData && (
            <View style={s.setupBox}>
              <Text style={s.setupStep}>1. Scanne ce QR avec Google Authenticator</Text>
              <Image
                source={{ uri: setupData.qr }}
                style={s.qrCode}
              />
              <Text style={s.secretLabel}>Code manuel :</Text>
              <Text style={s.secret} selectable>{setupData.secret}</Text>

              <Text style={[s.setupStep, { marginTop: 20 }]}>2. Entre le code à 6 chiffres</Text>
              <TextInput
                style={s.codeInput}
                value={code} onChangeText={setCode}
                keyboardType="number-pad" maxLength={6}
                placeholder="000 000" placeholderTextColor={MUTED}
              />
              {codeError ? <Text style={s.errorTxt}>{codeError}</Text> : null}
              <View style={s.actions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setSetupData(null); setCode(''); }}>
                  <Text style={s.cancelTxt}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={confirmCode} disabled={confirmLoading}>
                  {confirmLoading
                    ? <ActivityIndicator color={BG} size="small" />
                    : <Text style={s.saveTxt}>Confirmer</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ── DÉCONNEXION ── */}
      <View style={s.section}>
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  avatarWrap: { alignItems: 'center', paddingTop: 64, paddingBottom: 32, gap: 6, borderBottomWidth: 1, borderBottomColor: LINE },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1a1d24', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarTxt:  { fontSize: 28, fontWeight: '800', color: WHITE },
  nameTitle:  { fontSize: 20, fontWeight: '800', color: WHITE },
  emailTitle: { fontSize: 13, color: MUTED },

  section:       { paddingHorizontal: 20, paddingTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: MUTED },
  editBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnTxt:    { fontSize: 12, color: MUTED },

  card:      { backgroundColor: CARD, borderRadius: 14, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: LINE },
  rowLabel:  { fontSize: 12, color: MUTED },
  rowValue:  { fontSize: 13, fontWeight: '600', color: WHITE },

  editField: { paddingHorizontal: 18, paddingVertical: 12, gap: 6 },
  editInput: { fontSize: 14, color: WHITE, paddingVertical: 4 },
  errorTxt:  { fontSize: 12, color: '#f87171', paddingHorizontal: 18, paddingBottom: 10 },

  actions:   { flexDirection: 'row', gap: 10, padding: 14, paddingTop: 6 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, alignItems: 'center' },
  cancelTxt: { fontSize: 13, fontWeight: '600', color: MUTED },
  saveBtn:   { flex: 2, paddingVertical: 12, borderRadius: 10, backgroundColor: WHITE, alignItems: 'center' },
  saveTxt:   { fontSize: 13, fontWeight: '700', color: BG },

  badgeBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  badgeTxt: { fontSize: 12, fontWeight: '600', color: WHITE },

  setupBox:    { padding: 18, gap: 8, borderTopWidth: 1, borderTopColor: LINE },
  setupStep:   { fontSize: 12, fontWeight: '600', color: MUTED, letterSpacing: 0.3 },
  qrCode:      { width: 180, height: 180, alignSelf: 'center', borderRadius: 10, marginVertical: 12 },
  secretLabel: { fontSize: 11, color: MUTED, marginTop: 4 },
  secret:      { fontSize: 13, fontWeight: '700', color: WHITE, letterSpacing: 2, fontVariant: ['tabular-nums'] },
  codeInput:   {
    backgroundColor: BG, borderWidth: 1, borderColor: LINE, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 22, fontWeight: '700',
    color: WHITE, letterSpacing: 8, textAlign: 'center',
  },

  logoutBtn: { backgroundColor: CARD, borderWidth: 1, borderColor: 'rgba(220,38,38,0.3)', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  logoutTxt: { fontSize: 14, fontWeight: '700', color: '#f87171' },
});
