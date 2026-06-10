import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

import StartupsScreen        from '../screens/StartupsScreen';
import StartupDetailScreen   from '../screens/StartupDetailScreen';
import InvestmentsScreen     from '../screens/InvestmentsScreen';
import SecondaryMarketScreen from '../screens/SecondaryMarketScreen';
import ProfileScreen         from '../screens/ProfileScreen';
import LoginScreen           from '../screens/LoginScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import FeeCalculatorScreen   from '../screens/FeeCalculatorScreen';
import ContactScreen         from '../screens/ContactScreen';

// ── Thème clair (écrans) ──────────────────────────────────────────────────────
const BG   = '#f5f4f0';
const LINE = 'rgba(0,0,0,0.08)';
const TEXT = '#09090b';

// ── Menu (reste sombre) ───────────────────────────────────────────────────────
const MENU_BG    = '#111318';
const MENU_LINE  = 'rgba(255,255,255,0.07)';
const MENU_MUTED = 'rgba(255,255,255,0.35)';
const MENU_WHITE = '#f4f2ee';

const Stack    = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab      = createMaterialTopTabNavigator();

const TABS = [
  { name: 'Investissements', label: 'Investissements',   icon: 'trending-up-outline'     },
  { name: 'Startups',        label: 'Startups',          icon: 'rocket-outline'          },
  { name: 'Marche',          label: 'Marché secondaire', icon: 'swap-horizontal-outline' },
  { name: 'Frais',           label: 'Frais',             icon: 'calculator-outline'      },
  { name: 'Compte',          label: 'Compte',            icon: 'person-outline'          },
];

function NavModal({ visible, activeIndex, onNavigate, onContact, onClose }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={m.overlay} onPress={onClose}>
        <Pressable style={[m.menu, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>

          {/* ── Brand LIQUID+ ── */}
          <View style={m.brand}>
            <Image source={require('../../assets/goutte.png')} style={m.brandImg} />
            <Text style={m.brandTxt}>LIQUID+</Text>
          </View>

          {/* ── Utilisateur ── */}
          {user && (
            <View style={m.userRow}>
              <Text style={m.userName}>{user.name || user.email}</Text>
            </View>
          )}

          {/* ── Navigation ── */}
          {TABS.map((tab, i) => {
            const active = activeIndex === i;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[m.item, active && m.itemActive]}
                activeOpacity={0.7}
                onPress={() => { onNavigate(i); onClose(); }}
              >
                <Ionicons
                  name={active ? tab.icon.replace('-outline', '') : tab.icon}
                  size={20}
                  color={active ? MENU_WHITE : MENU_MUTED}
                />
                <Text style={[m.itemTxt, active && m.itemTxtActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}

          {/* ── Séparateur ── */}
          <View style={m.divider} />

          {/* ── Contact ── */}
          <TouchableOpacity
            style={m.item}
            activeOpacity={0.7}
            onPress={() => { onContact(); onClose(); }}
          >
            <Ionicons name="mail-outline" size={20} color={MENU_MUTED} />
            <Text style={m.itemTxt}>Nous contacter</Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const handleContact = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Contact');
    else navigation.navigate('Contact');
  };

  return (
    <>
      <NavModal
        visible={open}
        activeIndex={state.index}
        onNavigate={i => navigation.navigate(state.routes[i].name)}
        onContact={handleContact}
        onClose={() => setOpen(false)}
      />
      <View style={[s.bar, { paddingTop: insets.top || 12 }]}>
        <TouchableOpacity onPress={() => setOpen(true)} style={s.arrowBtn} activeOpacity={0.6}>
          <Ionicons name="menu-outline" size={24} color={TEXT} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const headerLight = {
  headerStyle:         { backgroundColor: BG },
  headerTintColor:     TEXT,
  headerShadowVisible: false,
  headerTitleStyle:    { fontWeight: '700', fontSize: 16, color: TEXT },
};

function StartupsStack() {
  return (
    <Stack.Navigator screenOptions={headerLight}>
      <Stack.Screen name="StartupsMain"  component={StartupsScreen}      options={{ headerShown: false }} />
      <Stack.Screen name="StartupDetail" component={StartupDetailScreen} options={({ route }) => ({ title: route.params?.startup?.name || 'Détail' })} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={headerLight}>
      {user ? (
        <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Login"    component={LoginScreen}    options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Créer un compte' }} />
        </>
      )}
    </Stack.Navigator>
  );
}

function FeesStack() {
  return (
    <Stack.Navigator screenOptions={headerLight}>
      <Stack.Screen name="FeesMain" component={FeeCalculatorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="top"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled:         true,
        animationEnabled:     true,
        tabBarIndicatorStyle: { height: 0, backgroundColor: 'transparent' },
        tabBarStyle:          { height: 0, overflow: 'hidden' },
        tabBarPressColor:     'transparent',
      }}
    >
      <Tab.Screen name="Investissements" component={InvestmentsScreen}     />
      <Tab.Screen name="Startups"        component={StartupsStack}         />
      <Tab.Screen name="Marche"          component={SecondaryMarketScreen} />
      <Tab.Screen name="Frais"           component={FeesStack}             />
      <Tab.Screen name="Compte"          component={ProfileStack}          />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Tabs"    component={TabsNavigator} />
        <RootStack.Screen
          name="Contact"
          component={ContactScreen}
          options={{ headerShown: true, title: 'Nous contacter', ...headerLight }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  bar:      { backgroundColor: BG, paddingBottom: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: LINE },
  arrowBtn: { padding: 6, alignSelf: 'flex-start' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  menu: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 270, backgroundColor: MENU_BG,
    borderRightWidth: 1, borderRightColor: MENU_LINE,
    paddingHorizontal: 12,
  },

  brand:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: MENU_LINE, marginBottom: 12 },
  brandImg: { width: 24, height: 24, resizeMode: 'contain' },
  brandTxt: { fontSize: 15, fontWeight: '800', color: MENU_WHITE, letterSpacing: 3, textTransform: 'uppercase' },

  userRow: { paddingHorizontal: 12, paddingBottom: 16, marginBottom: 4 },
  userName: { fontSize: 12, fontWeight: '600', color: MENU_MUTED },

  item:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  itemActive:    { backgroundColor: 'rgba(255,255,255,0.06)' },
  itemTxt:       { fontSize: 14, fontWeight: '600', color: MENU_MUTED },
  itemTxtActive: { color: MENU_WHITE, fontWeight: '700' },

  divider: { height: 1, backgroundColor: MENU_LINE, marginHorizontal: 14, marginVertical: 10 },
});
