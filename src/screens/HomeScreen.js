import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { investmentsAPI } from '../services/api';

function formatEur(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    investmentsAPI.getAll()
      .then(d => setInvestments(d.investments || []))
      .catch(() => setInvestments([]))
      .finally(() => setLoading(false));
  }, [user]);

  const totalValue = investments?.reduce((a, i) => a + i.current_value, 0) ?? 0;

  return (
    <View style={s.container}>
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={s.value}>{formatEur(totalValue)}</Text>
      }
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08090c', alignItems: 'center', justifyContent: 'center' },
  value:     { fontSize: 42, fontWeight: '800', color: '#fff', fontVariant: ['tabular-nums'], letterSpacing: -1 },
});
