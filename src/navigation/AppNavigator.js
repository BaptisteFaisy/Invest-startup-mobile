import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

import HomeScreen          from '../screens/HomeScreen';
import StartupsScreen      from '../screens/StartupsScreen';
import StartupDetailScreen from '../screens/StartupDetailScreen';
import ProfileScreen       from '../screens/ProfileScreen';
import LoginScreen         from '../screens/LoginScreen';
import RegisterScreen      from '../screens/RegisterScreen';
import HowItWorksScreen    from '../screens/HowItWorksScreen';
import FeeCalculatorScreen from '../screens/FeeCalculatorScreen';

const BG    = '#08090c';
const LINE  = 'rgba(255,255,255,0.07)';
const WHITE = '#f4f2ee';
const MUTED = 'rgba(255,255,255,0.35)';

const Stack = createNativeStackNavigator();
const Tab   = createMaterialTopTabNavigator();

const headerDark = {
  headerStyle:      { backgroundColor: BG },
  headerTintColor:  WHITE,
  headerShadowVisible: false,
  headerTitleStyle: { fontWeight: '700', fontSize: 16, color: WHITE },
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

const TABS = [
  { name: 'Investissement', icon: 'trending-up', iconOut: 'trending-up-outline' },
  { name: 'Startups',     icon: 'rocket',     iconOut: 'rocket-outline'     },
  { name: 'Frais',        icon: 'calculator', iconOut: 'calculator-outline' },
  { name: 'Compte',       icon: 'settings',   iconOut: 'settings-outline'   },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color   = focused ? WHITE : MUTED;
        const tab     = TABS[i];
        return (
          <TouchableOpacity key={route.key} style={s.item} activeOpacity={0.7}
            onPress={() => navigation.navigate(route.name)}>
            <Ionicons name={focused ? tab.icon : tab.iconOut} size={30} color={color} />
            <Text style={[s.label, { color }]}>{tab.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar:   { flexDirection: 'row', backgroundColor: BG, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 10 },
  item:  { flex: 1, alignItems: 'center', paddingTop: 2 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, marginTop: 5 },
});

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBarPosition="bottom"
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          swipeEnabled: true,
          animationEnabled: true,
          tabBarIndicatorStyle: { height: 0, backgroundColor: 'transparent' },
          tabBarStyle: { height: 0, overflow: 'hidden' },
          tabBarPressColor: 'transparent',
          tabBarPressOpacity: 1,
        }}
      >
        <Tab.Screen name="Investissement" component={HomeStack}    />
        <Tab.Screen name="Startups"     component={StartupsStack} />
        <Tab.Screen name="Frais"        component={FeesStack}     />
        <Tab.Screen name="Compte"       component={ProfileStack}  />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
