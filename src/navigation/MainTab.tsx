import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import { MainTabParamList } from '@/types/navigation.types';
import Entypo from '@expo/vector-icons/Entypo';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF', 
        headerShown: false,              
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="home" color={color} size={size} />,
          title: 'Trang chủ'
        }}
      />
      <Tab.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="login" color={color} size={size} />,
          title: 'Đăng Nhập'
        }}
      />
    </Tab.Navigator>
  );
}