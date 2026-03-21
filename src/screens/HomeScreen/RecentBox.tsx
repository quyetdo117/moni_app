import EmptyView from '@/components/common/EmptyView';
import LineList from '@/components/common/LineList';
import ItemPayment from '@/components/items/ItemPayment';
import { getListTransaction } from '@/services/Api/get.services';
import { useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Spacing, Typography } from '../../constants/theme';

export default function RecentBox() {

  const [dataList, setDataList] = useState<InfoTransaction[]>([]);
  const uid = useUserStore(state => state.uid);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const data = await getListTransaction(uid);
    if (data.success) {
      const listData = data?.data as InfoTransaction[] || [];
      // Take only first 10 items for recent transactions
      setDataList(listData.slice(0, 5));
    } else {
      console.log('error', data.msg)
    }
  }

  const renderItem = ({ item, index }: { item: InfoTransaction; index: number }) => (
    <View>
      {index !== 0 && <LineList style={styles.separator} />}
      <ItemPayment data={item} />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{'Gần đây'}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyView />
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={dataList}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        ListEmptyComponent={renderEmpty}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.base,
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.xl
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.text,
  },
  separator: {
    marginHorizontal: Spacing.base,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
  },
  listContent: {
    paddingTop: Spacing.sm,
  },
})
