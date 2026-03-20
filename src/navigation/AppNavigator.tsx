import { auth } from '@/configs/firebaseConfig';
import InvestmentScreen from '@/screens/InvestmentScreen';
import InvestmentDetailScreen from '@/screens/InvestmentScreen/InvestmentDetailScreen';
import SaveScreen from '@/screens/SaveScreen';
import { useUserStore } from '@/store/main.store';
import { RootStackParamList } from '@/types/navigation.types';
import { onAuthStateChanged } from '@firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import ExpenseScreen from '../screens/ExpenseScreen';
import LoginScreen from '../screens/LoginScreen';
import MainTab from './MainTab';

const Stack = createNativeStackNavigator<RootStackParamList>();

SplashScreen.preventAutoHideAsync();

const AppNavigator = () => {
  const isLoggedIn = useUserStore((state) => state.isLogin);
  const logout = useUserStore((state) => state.logout);
  const [isReady, setIsReady] = useState<boolean>(false);

  const initApp = async () => {
      await useUserStore.persist.rehydrate();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          logout();
        }
        setIsReady(true);
        await SplashScreen.hideAsync();
      });
      return unsubscribe;
    };

  useEffect(() => {
    initApp();
  }, []);

  if(!isReady) {
    return null
  }
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isLoggedIn ? "MainTab" : "Login"}
        screenOptions={{
          headerShown: false, 
          animation: 'slide_from_right',
        }}
      >
        {isLoggedIn ? (
          <Stack.Group>
            <Stack.Screen name="MainTab" component={MainTab} />
            <Stack.Screen name="ExpenseScreen" component={ExpenseScreen} />
            <Stack.Screen name="InvestmentScreen" component={InvestmentScreen} />
            <Stack.Screen name="InvestmentDetailScreen" component={InvestmentDetailScreen} />
            <Stack.Screen name="SaveScreen" component={SaveScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;