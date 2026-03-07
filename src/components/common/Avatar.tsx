import React from 'react'
import { Image, StyleSheet, View, ViewStyle } from 'react-native'

interface AvatarProps {
    style?: ViewStyle
}

export default function Avatar({style}: AvatarProps) {
  return (
    <View style={[style]}>
        <Image 
        style={styles.img}
        source={{uri: 'https://dogovinhvuong.com/wp-content/uploads/2025/12/avatar-anime-sang-nu-thiet-ke-toi-gian-dep.jpg'}}
        />
    </View>
  )
}
const styles = StyleSheet.create({
    img: {
        width: 60,
        height: 60,
        borderRadius: 60
    }
})
