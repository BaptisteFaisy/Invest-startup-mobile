import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const MUTED = 'rgba(255,255,255,0.35)';
const WHITE = '#f4f2ee';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) { setError('Remplissez tous les champs.'); return; }
    if (password.length < 6) { setError('Mot de passe trop court (6 caractères min.).'); return; }
    setLoading(true); setError(null);
    try {
      const result = await register(email, password, name);
      if (!result.success) setError(result.error || 'Erreur lors de la création du compte.');
    } catch (e) {
      setError(e.message || 'Erreur lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.inner}>

        <Text style={s.title}>Créer un compte</Text>

        {error && <Text style={s.error}>{error}</Text>}

        <View style={s.field}>
          <Text style={s.label}>NOM</Text>
          <TextInput style={s.input} value={name} onChangeText={setName}
            autoCapitalize="words" placeholder="Jean Dupont" placeholderTextColor={MUTED} />
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
              secureTextEntry={!showPass} placeholder="6 caractères minimum" placeholderTextColor={MUTED} />
            <TouchableOpacity onPress={() => setShowPass(v => !v)} style={s.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off' : 'eye'} size={20} color={MUTED} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color={BG} /> : <Text style={s.btnTxt}>Créer mon compte</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.switch}>Déjà un compte ? <Text style={s.switchLink}>Se connecter →</Text></Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner:     { flex: 1, justifyContent: 'center', paddingHorizontal: 28, gap: 20 },

  title: { fontSize: 28, fontWeight: '800', color: WHITE, marginBottom: 4 },
  error: { fontSize: 13, color: '#f87171', fontWeight: '600' },

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
