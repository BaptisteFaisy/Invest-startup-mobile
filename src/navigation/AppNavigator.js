import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const Stack  = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const headerDark = {
  headerStyle:         { backgroundColor: BG },
  headerTintColor:     WHITE,
  headerShadowVisible: false,
  headerTitleStyle:    { fontWeight: '700', fontSize: 16, color: WHITE },
};

const MENU_ITEMS = [
  { name: 'Accueil',         icon: 'home-outline'         },
  { name: 'Investissements', icon: 'trending-up-outline'  },
  { name: 'Startups',        icon: 'rocket-outline'       },
  { name: 'Frais',           icon: 'calculator-outline'   },
  { name: 'Compte',          icon: 'person-outline'       },
];

function CustomDrawer({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <DrawerContentScrollView
      scrollEnabled={false}
      contentContainerStyle={{ flex: 1 }}
      style={{ backgroundColor: CARD }}
    >
      <View style={[sd.wrap, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={sd.header}>
          <Text style={sd.brand}>LIQUID+</Text>
          {user && <Text style={sd.username}>{user.name || user.email}</Text>}
        </View>
        <View style={sd.items}>
          {state.routes.map((route, i) => {
            const focused = state.index === i;
            const item    = MENU_ITEMS[i];
            return (
              <TouchableOpacity
                key={route.key}
                style={[sd.item, focused && sd.itemActive]}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(route.name)}
              >
                <Ionicons
                  name={focused ? item.icon.replace('-outline', '') : item.icon}
                  size={20}
                  color={focused ? WHITE : MUTED}
                />
                <Text style={[sd.itemTxt, focused && sd.itemTxtActive]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </DrawerContentScrollView>
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

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={headerDark}>
      <Stack.Screen name="Home"       component={HomeScreen}       options={{ headerShown: false }} />
      <Stack.Screen name="HowItWorks" component={HowItWorksScreen} options={{ title: 'Comment ça fonctionne' }} />
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
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={({ navigation }) => ({
          headerStyle:         { backgroundColor: BG },
          headerTintColor:     WHITE,
          headerShadowVisible: false,
          headerTitleStyle:    { fontWeight: '700', fontSize: 16, color: WHITE },
          headerTitle:         () => null,
          headerLeft:          () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={s.menuBtn} activeOpacity={0.6}>
              <Ionicons name="arrow-back-outline" size={22} color={WHITE} />
            </TouchableOpacity>
          ),
          drawerStyle: { backgroundColor: CARD, width: 260 },
          drawerType:  'front',
          overlayColor: 'rgba(0,0,0,0.6)',
          swipeEnabled: true,
        })}
      >
        <Drawer.Screen name="Accueil"         component={HomeStack}        />
        <Drawer.Screen name="Investissements" component={InvestmentsScreen} />
        <Drawer.Screen name="Startups"        component={StartupsStack}    />
        <Drawer.Screen name="Frais"           component={FeesStack}        />
        <Drawer.Screen name="Compte"          component={ProfileStack}     />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const s = StyleSheet.create({
  menuBtn: { paddingHorizontal: 16, paddingVertical: 8 },
});

const sd = StyleSheet.create({
  wrap:   { flex: 1, paddingHorizontal: 0 },
  header: { paddingHorizontal: 24, paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: LINE },
  brand:  { fontSize: 13, fontWeight: '800', letterSpacing: 3, color: WHITE, textTransform: 'uppercase' },
  username: { fontSize: 12, color: MUTED, marginTop: 4 },

  items:       { paddingHorizontal: 12, paddingTop: 16, gap: 4 },
  item:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  itemActive:  { backgroundColor: 'rgba(255,255,255,0.06)' },
  itemTxt:     { fontSize: 14, fontWeight: '600', color: MUTED },
  itemTxtActive: { color: WHITE, fontWeight: '700' },
});
