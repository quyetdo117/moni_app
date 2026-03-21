import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { Colors, Spacing } from '../../constants/theme'

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
        height: 1,
        backgroundColor: Colors.divider,
        marginVertical: Spacing.xs
    }
})
