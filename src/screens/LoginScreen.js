import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { OAUTH_BASE_URL } from '../services/api';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';

export default function LoginScreen({ navigation }) {
  const { login, googleLogin } = useAuth();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPass,  setShowPass]  = useState(false);
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    setLoading(true); setError(null);
    try {
      const result = await login(email, password);
      if (!result.success) setError(result.error || 'Identifiants incorrects.');
    } catch (e) {
      setError(e.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGLoading(true); setError(null);
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `${OAUTH_BASE_URL}/auth/google?from=app`,
        'liquidplus://auth'
      );
      if (result.type === 'success' && result.url) {
        const token = result.url.match(/[?&]token=([^&]+)/)?.[1];
        if (token) {
          const r = await googleLogin(decodeURIComponent(token));
          if (!r.success) setError(r.error || 'Erreur Google.');
        } else {
          setError('Connexion Google annulée.');
        }
      }
    } catch (e) {
      setError('Erreur : ' + e.message);
    } finally {
      setGLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>

        <Text style={s.title}>Connexion</Text>

        {error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={s.googleBtn} onPress={handleGoogle} disabled={gLoading} activeOpacity={0.85}>
          {gLoading
            ? <ActivityIndicator color={BG} size="small" />
            : <><Text style={s.googleG}>G</Text><Text style={s.googleTxt}>Continuer avec Google</Text></>
          }
        </TouchableOpacity>

        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTxt}>ou</Text>
          <View style={s.dividerLine} />
        </View>

        <View style={s.field}>
          <Text style={s.label}>EMAIL</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
            placeholder="exemple@email.com" placeholderTextColor={MUTED} />
        </View>

        <View style={s.field}>
          <Text style={s.label}>MOT DE PASSE</Text>
          <View style={s.pwdWrap}>
            <TextInput style={[s.input, { flex: 1, borderWidth: 0 }]} value={password} onChangeText={setPassword}
              secureTextEntry={!showPass} placeholder="••••••••" placeholderTextColor={MUTED} />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={MUTED} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={BG} /> : <Text style={s.btnTxt}>Se connecter</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.switch}>Pas de compte ? <Text style={s.switchLink}>Créer un compte →</Text></Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner:     { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 18 },

  title: { fontSize: 28, fontWeight: '800', color: WHITE, marginBottom: 4 },
  error: { fontSize: 13, color: '#f87171', fontWeight: '600' },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: WHITE, paddingVertical: 14, borderRadius: 12,
  },
  googleG:   { fontSize: 16, fontWeight: '800', color: '#4285F4' },
  googleTxt: { fontSize: 15, fontWeight: '700', color: BG },

  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: LINE },
  dividerTxt:  { fontSize: 12, color: MUTED, fontWeight: '600' },

  field: { gap: 8 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: MUTED },
  input: {
    backgroundColor: CARD, borderWidth: 1, borderColor: LINE,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: WHITE,
  },
  pwdWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderWidth: 1, borderColor: LINE, borderRadius: 12,
  },
  eyeBtn: { paddingHorizontal: 14 },

  btn:    { backgroundColor: WHITE, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnTxt: { fontSize: 15, fontWeight: '700', color: BG },

  switch:     { textAlign: 'center', fontSize: 13, color: MUTED },
  switchLink: { color: WHITE, fontWeight: '700' },
});
