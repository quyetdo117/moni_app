import ButtonCustom from '@/components/common/ButtonCustom';
import EmptyView from '@/components/common/EmptyView';
import HeaderView from '@/components/common/HeaderView';
import { COLOR_APP, key_assets } from '@/constants/constants';
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
  
  const totalSaved = saveAsset?.total_value || 0;
  const totalWithInterest = saveAsset?.total_market || totalSaved;

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
          total_value: item.total_value,
          total_market: item.market_value,
          target: item.target_value,
          date_buy: item.date_update,
        }}
        onPress={onItemPress}
      />
    );
  };

  const renderHeader = useMemo(() => {
    return (
      <View style={styles.headerContainer}>
        <View style={[styles.summaryCard, commonStyles.box_shadow]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{'Đã sử dụng để tiết kiệm'}</Text>
              <Text style={styles.summaryValue}>{formatSmartMoney(totalSaved)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, styles.savedValue]}>{'Số tiền đã tiết kiệm'}</Text>
              <Text style={[styles.summaryValue, styles.savedValue]}>{formatSmartMoney(totalWithInterest)}</Text>
            </View>
          </View>
          <View style={styles.interestRow}>
              <Text style={styles.interestLabel}>{'Bao gồm lãi:'}</Text>
              <Text style={styles.interestValue}>+{formatSmartMoney(totalWithInterest - totalSaved)}</Text>
            </View>
        </View>
        <ButtonCustom
          title='Tạo khoản tiết kiệm'
          onPress={onShow}
          style_btn={styles.createButton}
          Icon={FontAwesome6}
          name_icon={'plus'}
        />

        <Text style={styles.sectionTitle}>{'Danh sách tiết kiệm'}</Text>
      </View>
    );
  }, [totalSaved, totalWithInterest]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container]}>
        <HeaderView onBack={onBack} title='Tài khoản tiết kiệm' />
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
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    marginTop: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  savedValue: {
    color: COLOR_APP.green,
    textAlign: 'right',
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  interestLabel: {
    fontSize: 12,
    color: '#666',
  },
  interestValue: {
    fontSize: 12,
    color: COLOR_APP.green,
    fontWeight: '600',
    marginLeft: 4,
  },
  createButton: {
    backgroundColor: COLOR_APP.blue,
    marginBottom: 10
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContent: {
    paddingBottom: 100,
  },
  separator: {
    height: 10,
  },
});
