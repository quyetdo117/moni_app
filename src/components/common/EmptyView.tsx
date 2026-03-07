import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyView() {
  return (
    <View style={styles.constainer}>
        <MaterialCommunityIcons name="database-outline" size={100} color="#7d94c4" />
        <Text style={styles.txt}>{"No Data"}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    constainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80
    },
    txt: {
        color: '#525151',
        fontSize: 20,
        fontWeight: 'bold'
    }
})
