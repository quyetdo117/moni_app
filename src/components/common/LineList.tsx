import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

interface LineProps {
    style?: ViewStyle
}

export default function LineList({style}: LineProps) {
  return (
    <View style={[styles.line, style]}/>
  )
}

const styles = StyleSheet.create({
    line: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        backgroundColor: '#999',
        marginVertical: 2
    }
})
