import EmptyView from '@/components/common/EmptyView';
import LineList from '@/components/common/LineList';
import ItemPayment from '@/components/items/ItemPayment';
import { getListTransaction } from '@/services/Api/get.services';
import { useUserStore } from '@/store/main.store';
import { InfoTransaction } from '@/types/info.types';
import { commonStyles } from '@/utils/styles_shadow';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      setDataList(listData);
    } else {
      console.log('error', data.msg)
    }
  }

  return (
    <View style={[styles.container, commonStyles.box_shadow]}>
      <View style={styles.box_header}>
        <Text style={styles.txt_title}>{'Gần đây'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {
          !!dataList.length ? dataList.map((item, index) => {
            return (
              <View key={index}>
                {index !== 0 && <LineList style={styles.line} />}
                <ItemPayment data={item} />
              </View>
            )
          }) : <EmptyView />
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginHorizontal: 10,
    marginTop: 20
  },
  txt_title: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 5,
    fontSize: 14
  },
  box_header: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#1a73e8'
  },
  line: {
    marginHorizontal: 10
  }
})
