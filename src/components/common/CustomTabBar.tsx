import { useBottomInsets } from '@/hooks/useBottomInsets';
import { RootStackParamList } from '@/types/navigation.types';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../../constants/theme';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const parentNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { insets_bottom } = useBottomInsets();

  const handleFabPress = () => {
    // Navigate to ExpenseScreen (create transaction screen)
    parentNavigation.navigate('ExpenseScreen');
  };

  return (
    <View>
      {/* Semi-transparent White Overlay */}
      <View style={[styles.overlay, { top: -(insets_bottom + 30) }]} />
      <View style={[styles.tabBarContainer, { bottom: insets_bottom }]}>
        {/* Tab Bar Background */}
        <View style={styles.tabBarBackground}>
          {/* Left Tabs */}
          <View style={styles.tabRow}>
            {state.routes.slice(0, 2).map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                >
                  <View style={styles.iconWrapper}>
                    {index === 0 ? (
                      <Entypo
                        name="home"
                        size={24}
                        color={isFocused ? Colors.surface : Colors.textSecondary}
                      />
                    ) : (
                      <Entypo
                        name="list"
                        size={24}
                        color={isFocused ? Colors.surface : Colors.textSecondary}
                      />
                    )}
                    {isFocused && <View style={styles.activeIndicator} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FAB Spacer */}
          <View style={styles.fabSpacer} />

          {/* Right Tabs */}
          <View style={styles.tabRow}>
            {state.routes.slice(2).map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const tabIndex = index + 2;
              const isFocused = state.index === tabIndex;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                >
                  <View style={styles.iconWrapper}>
                    {index === 0 ? (
                      <Entypo
                        name="bar-graph"
                        size={24}
                        color={isFocused ? Colors.surface : Colors.textSecondary}
                      />
                    ) : (
                      <Ionicons
                        name="person"
                        size={24}
                        color={isFocused ? Colors.surface : Colors.textSecondary}
                      />
                    )}
                    {isFocused && <View style={styles.activeIndicator} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* FAB Button */}
        <View style={styles.fabWrapper}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleFabPress}
            activeOpacity={0.8}
          >
            <View style={styles.fabInner}>
              <Ionicons name="add" size={32} color={Colors.surface} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.md,
    ...Shadows.lg
  },
  tabBarBackground: {
    paddingBottom: 8,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surface,
  },
  fabSpacer: {
    width: 64,
  },
  fabWrapper: {
    position: 'absolute',
    top: -Spacing.base,
    alignSelf: 'center',
    zIndex: 100,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
