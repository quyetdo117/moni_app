
import ButtonCustom from '@/components/common/ButtonCustom';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import { key_assets } from '@/constants/constants';
import { getCategories } from '@/services/Api/get.services';
import { useListStore, useUserStore } from '@/store/main.store';
import { RootStackScreenProps } from '@/types/navigation.types';
import { Category } from '@/types/schema.types';
import { PopupRef } from '@/types/view.types';
import { formatSmartMoney } from '@/utils/convertData';
import { commonStyles } from '@/utils/styles_shadow';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';
import ItemSave from './items/ItemSave';
import PopupFormSave from './popups/PopupFormSave';

interface DataItem {
  item: Category;
  index: number;
}

export default function SaveScreen({ navigation, route }: RootStackScreenProps<'SaveScreen'>) {
  const refPopupForm = useRef<PopupRef>(null);

  const uid = useUserStore((state) => state.uid);
  const infoAsset = useUserStore((state) => state.infoAsset);

  const listSave = useListStore((state) => state.listSave);
  const setListSave = useListStore((state) => state.setListSave);

  // Get save asset info
  const saveAsset = infoAsset?.[key_assets.save];

  // Calculate totals
  
  const totalSaved = saveAsset?.total_capital || 0;
  const totalWithInterest = saveAsset?.total_value || totalSaved;

  useEffect(() => {
    getData();
  }, []);

  const onBack = () => {
    if(navigation) navigation.goBack();
  }

  const getData = async () => {
    const saveAssetId = saveAsset?.id;
    const data = await getCategories({ asset_id: saveAssetId, type: key_assets.save }, uid);
    if (data.success) {
      const listData = (data?.data as Category[]) || [];
      setListSave(listData);
    }
  };

  const onRefresh = () => {
    getData();
  };

  const onShow = () => {
    if (refPopupForm.current) {
      refPopupForm.current.onShow();
    }
  };

  const keyExtractor_ = (item: Category, index: number) => item.id || index.toString();

  const onItemPress = (data: any) => {
    if (navigation) {
      navigation.navigate('SaveDetailScreen', { data });
    }
  };

  const renderItem = ({ item, index }: DataItem) => {
    return (
      <ItemSave
        data={{
          id: item.id,
          name: item.name,
          total_capital: item.total_capital || 0,
          total_value: item.total_value,
          target: item.target_value,
          date_buy: item.date_buy,
        }}
        onPress={onItemPress}
      />
    );
  };

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerContainer}>
        {/* Summary Card */}
        <View style={[styles.summaryCard, commonStyles.box_shadow]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{'Đã sử dụng để tiết kiệm'}</Text>
              <Text style={styles.summaryValue}>{formatSmartMoney(totalSaved)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, styles.savedLabel]}>{'Số tiền đã tiết kiệm'}</Text>
              <Text style={[styles.summaryValue, styles.savedValue]}>{formatSmartMoney(totalWithInterest)}</Text>
            </View>
          </View>
          <View style={styles.interestRow}>
              <Text style={styles.interestLabel}>{'Bao gồm lãi:'}</Text>
              <Text style={styles.interestValue}>+{formatSmartMoney(totalWithInterest - totalSaved)}</Text>
            </View>
        </View>

        {/* Create Button */}
        <ButtonCustom
          title='Tạo khoản tiết kiệm'
          onPress={onShow}
          variant='primary'
          Icon={FontAwesome6}
          name_icon='plus'
          style_btn={styles.createButton}
        />

        {/* Section Title */}
        <Text style={styles.sectionTitle}>{'Danh sách tiết kiệm'}</Text>
      </View>
    );
  }, [totalSaved, totalWithInterest]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.container}>
        <HeaderView onBack={onBack} title='Tiết kiệm' />
        <FlatList
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          data={listSave}
          keyExtractor={keyExtractor_}
          ListEmptyComponent={<EmptyView />}
          contentContainerStyle={styles.listContent}
        />

        <PopupFormSave onSuccess={onRefresh} ref={refPopupForm} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    paddingTop: Spacing.md,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  savedLabel: {
    textAlign: 'right',
  },
  savedValue: {
    color: Colors.success,
    textAlign: 'right',
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  interestLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  interestValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeight.semiBold,
    marginLeft: Spacing.xs,
  },
  createButton: {
    marginBottom: Spacing.base,
  },
  createButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
  },
  listContent: {
    paddingBottom: 100,
  },
  separator: {
    height: Spacing.sm,
  },
});
