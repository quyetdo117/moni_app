
import ExpenseScreen from '@/screens/ExpenseScreen';
import { MainTabScreenProps } from '@/types/navigation.types';
import React from 'react';

// Re-export ExpenseScreen as TransactionListScreen
export default function TransactionListScreen(props: MainTabScreenProps<'TransactionList'>) {
  return <ExpenseScreen {...props} navigation={props.navigation as any} route={props.route as any} />;
}
