import Avatar from '@/components/common/Avatar';
import BoxMoney from '@/components/common/BoxMoney';
import VirtualButton from '@/components/common/VirtualButton';
import { key_assets } from '@/constants/constants';
import { getInfoUser } from '@/services/Api/get.services';
import { useUserStore } from '@/store/main.store';
import { MainTabScreenProps } from '@/types/navigation.types';
import { Asset } from '@/types/schema.types';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ChartOverView from './ChartOverView';
import RecentBox from './RecentBox';

export default function HomeScreen({ navigation, route }: MainTabScreenProps<'Home'>) {
  const insets = useSafeAreaInsets();
  const infoUser = useUserStore(state => state.infoUser);
  const setInfoUser = useUserStore(state => state.setInfoUser);
  const uid = useUserStore(state => state.uid);
  const assets = infoUser?.assets || [];

  useEffect(() => {
    getInfo();
  }, [])

  const getInfo = async () => {
    const data = await getInfoUser(uid);
    if(data.success && data.data){
      setInfoUser(data.data)
    }
  }

  const onPressScreen = (data: Asset) => {
    const type = data?.type;
    if(type == key_assets.expense){
      navigation.navigate('ExpenseScreen')
    } else if (type == key_assets.invest){
      navigation.navigate('InvestmentScreen')
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={{ flex: 1, paddingTop: insets.top }}>
          <View style={styles.box_header}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.box_info}>
                <Avatar style={styles.avt} />
                {
                  assets.map((item, index) => {
                    return <BoxMoney onPress={onPressScreen} key={index} data={item} style={styles.box} />
                  })
                }
              </View>
            </ScrollView>
          </View>
          <ChartOverView />
          <RecentBox />
        </View>
      </ScrollView>
      <VirtualButton />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  txt_: {
    color: '#fff'
  },
  box_info: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  box: {
    marginLeft: 10
  },
  avt: {
    marginLeft: 10
  },
  box_header: {
    backgroundColor: '#0099FF',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    marginLeft: 10,
    paddingVertical: 10
  }
})
