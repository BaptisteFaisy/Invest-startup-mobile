import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen          from '../screens/HomeScreen';
import StartupsScreen      from '../screens/StartupsScreen';
import StartupDetailScreen from '../screens/StartupDetailScreen';
import InvestmentsScreen   from '../screens/InvestmentsScreen';
import ProfileScreen       from '../screens/ProfileScreen';
import LoginScreen         from '../screens/LoginScreen';
import RegisterScreen      from '../screens/RegisterScreen';
import HowItWorksScreen    from '../screens/HowItWorksScreen';
import FeeCalculatorScreen from '../screens/FeeCalculatorScreen';

const BG    = '#08090c';
const CARD  = '#111318';
const LINE  = 'rgba(255,255,255,0.07)';
const WHITE = '#f4f2ee';
const MUTED = 'rgba(255,255,255,0.35)';

const Stack = createNativeStackNavigator();
const Tab   = createMaterialTopTabNavigator();

const TABS = [
  { name: 'Accueil',         label: 'Accueil',          icon: 'home-outline'        },
  { name: 'Investissements', label: 'Investissements',  icon: 'trending-up-outline' },
  { name: 'Startups',        label: 'Startups',         icon: 'rocket-outline'      },
  { name: 'Frais',           label: 'Frais',            icon: 'calculator-outline'  },
  { name: 'Compte',          label: 'Compte',           icon: 'person-outline'      },
];

function NavModal({ visible, activeIndex, onNavigate, onClose }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={m.overlay} onPress={onClose}>
        <Pressable style={[m.menu, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          {user && (
            <View style={m.userRow}>
              <Text style={m.userName}>{user.name || user.email}</Text>
            </View>
          )}
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
                  color={active ? WHITE : MUTED}
                />
                <Text style={[m.itemTxt, active && m.itemTxtActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function CustomTabBar({ state, navigation }) {
  const insets  = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  return (
    <>
      <NavModal
        visible={open}
        activeIndex={state.index}
        onNavigate={i => navigation.navigate(state.routes[i].name)}
        onClose={() => setOpen(false)}
      />
      <View style={[s.bar, { paddingTop: insets.top || 12 }]}>
        <TouchableOpacity onPress={() => setOpen(true)} style={s.arrowBtn} activeOpacity={0.6}>
          <Ionicons name="arrow-back-outline" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const headerDark = {
  headerStyle:         { backgroundColor: BG },
  headerTintColor:     WHITE,
  headerShadowVisible: false,
  headerTitleStyle:    { fontWeight: '700', fontSize: 16, color: WHITE },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="Home"       component={HomeScreen}       options={{ headerShown: false }} />
      <Stack.Screen name="HowItWorks" component={HowItWorksScreen} options={{ title: 'Comment ça fonctionne' }} />
    </Stack.Navigator>
  );
}

function StartupsStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="StartupsMain"  component={StartupsScreen}      options={{ headerShown: false }} />
      <Stack.Screen name="StartupDetail" component={StartupDetailScreen} options={({ route }) => ({ title: route.params?.startup?.name || 'Détail' })} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  const { user } = useAuth();
  return (
    <Stack.Navigator screenOptions={headerDark}>
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
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="FeesMain" component={FeeCalculatorScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarPosition="top"
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          swipeEnabled:          true,
          animationEnabled:      true,
          tabBarIndicatorStyle:  { height: 0, backgroundColor: 'transparent' },
          tabBarStyle:           { height: 0, overflow: 'hidden' },
          tabBarPressColor:      'transparent',
        }}
      >
        <Tab.Screen name="Accueil"         component={HomeStack}         />
        <Tab.Screen name="Investissements" component={InvestmentsScreen} />
        <Tab.Screen name="Startups"        component={StartupsStack}     />
        <Tab.Screen name="Frais"           component={FeesStack}         />
        <Tab.Screen name="Compte"          component={ProfileStack}      />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  bar:      { backgroundColor: BG, paddingBottom: 8, paddingHorizontal: 16 },
  arrowBtn: { padding: 6, alignSelf: 'flex-start' },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  menu: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 260, backgroundColor: CARD,
    borderRightWidth: 1, borderRightColor: LINE,
    paddingHorizontal: 12,
  },
  userRow: { paddingHorizontal: 12, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: LINE, marginBottom: 12 },
  userName: { fontSize: 13, fontWeight: '700', color: WHITE },

  item:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  itemActive:  { backgroundColor: 'rgba(255,255,255,0.06)' },
  itemTxt:     { fontSize: 14, fontWeight: '600', color: MUTED },
  itemTxtActive: { color: WHITE, fontWeight: '700' },
});
