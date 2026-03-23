
import AccountScreen from '@/screens/AccountScreen';
import HomeScreen from '@/screens/HomeScreen';
import ReportScreen from '@/screens/ReportScreen';
import TransactionListScreen from '@/screens/TransactionListScreen';
import { MainTabParamList } from '@/types/navigation.types';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import CustomTabBar from '../components/common/CustomTabBar';
import { Colors } from '../constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="home" color={color} size={size} />,
          title: 'Trang chủ',
        }}
      />
      <Tab.Screen
        name="TransactionList"
        component={TransactionListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="list" color={color} size={size} />,
          title: 'Giao dịch',
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Entypo name="bar-graph" color={color} size={size} />,
          title: 'Báo cáo',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          title: 'Tài khoản',
        }}
      />
    </Tab.Navigator>
  );
}
