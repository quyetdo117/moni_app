
import Avatar from '@/components/common/Avatar';
import BoxMoney from '@/components/common/BoxMoney';
import VirtualButton from '@/components/common/VirtualButton';
import { key_assets } from '@/constants/constants';
import { useBottomInsets } from '@/hooks/useBottomInsets';
import { getInfoUser } from '@/services/Api/get.services';
import { useUserStore } from '@/store/main.store';
import { InfoUser } from '@/types/info.types';
import { MainTabScreenProps } from '@/types/navigation.types';
import { Asset } from '@/types/schema.types';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import ChartOverView from './ChartOverView';
import RecentBox from './RecentBox';

export default function HomeScreen({ navigation, route }: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const { insets_padding } = useBottomInsets();
  const setInfoUser = useUserStore(state => state.setInfoUser);
  const setInfoAsset = useUserStore(state => state.setInfoAsset);
  const uid = useUserStore(state => state.uid);
  const infoAsset = useUserStore(state => state.infoAsset);

  // Convert infoAsset object to array and sort by stt
  const assets = Object.values(infoAsset || {}).sort((a, b) => (a.stt || 0) - (b.stt || 0));

  useEffect(() => {
    getInfo();
  }, [])

  const getInfo = async () => {
    const data = await getInfoUser(uid);
    if (data.success && data.data) {
      const dataUser = data.data as InfoUser;
      const assets = data.data.assets || [];
      setInfoAsset(assets);
      setInfoUser(dataUser)
    }
  }

  const onPressScreen = (data: Asset) => {
    const type = data?.type;
    if (type == key_assets.expense) {
      navigation.navigate('ExpenseScreen')
    } else if (type == key_assets.invest) {
      navigation.navigate('InvestmentScreen')
    } else if (type == key_assets.save) {
      navigation.navigate('SaveScreen')
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, {
          paddingTop: insets.top + Spacing.base,
          paddingBottom: insets_padding
        }]}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.headerTitle}>Tổng quan tài chính</Text>
            </View>
          </View>

          {/* Asset Cards */}
          <View style={styles.box_info}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.info_content}>
                <Avatar style={styles.avatar} />
                {assets.map((item, index) => {
                  return (
                    <BoxMoney
                      onPress={onPressScreen}
                      key={index}
                      data={item}
                      style={styles.assetBox}
                    />
                  )
                })}
              </View>
            </ScrollView>
          </View>

          {/* Chart Section */}
          <ChartOverView />

          {/* Recent Transactions */}
          <RecentBox />
        </View>
      </ScrollView>
      <VirtualButton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.md
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  avatar: {
    marginLeft: Spacing.md
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  balanceValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  assetsContainer: {
    marginBottom: Spacing.lg,
  },
  assetsScroll: {
    paddingRight: Spacing.base,
  },
  assetBox: {
    marginLeft: Spacing.md,
  },
  box_info: {
    backgroundColor: Colors.primaryLight,
    borderBottomLeftRadius: BorderRadius.lg,
    borderTopLeftRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.md
  },
  info_content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md
  }
})
