import { COLOR_APP, key_assets, TYPE_TRANSACTION } from '@/constants/constants';
import { getCategories } from '@/services/Api/get.services';
import { createTransactionSave } from '@/services/Api/transaction.services';
import { useChartStore, useListStore, useUserStore } from '@/store/main.store';
import { Category } from '@/types/schema.types';
import { PopupRef } from '@/types/view.types';
import RNBounceable from '@freakycoder/react-native-bounceable';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const dataOptions = [
  {
    id: 2,
    title: 'Gửi tiết kiệm',
    type: TYPE_TRANSACTION.IN,
  },
  {
    id: 1,
    title: 'Rút tiết kiệm',
    type: TYPE_TRANSACTION.OUT,
  },
];

interface dataOption {
  id: number;
  title: string;
  type: number;
}

type NameInputMode = 'existing' | 'new';

interface PopupFormSaveProps {
  onSuccess?: () => void;
}

interface DataFormSave {
  type: number;
  name: string;
  quantity: string;
  rate_value: string;
  market_value: string;
  total_value: string;
  date_buy: number;
  note: string;
  asset_id: string;
  user_id: string;
  target: string;
  category_id?: string;
}

const PopupFormSave = forwardRef<PopupRef, PopupFormSaveProps>((props, ref) => {
  const { onSuccess } = props;

  const bottomSheetRef = useRef<BottomSheet>(null);
  const isChangeMarket = useRef(false);
  const dataType = useRef<dataOption>(dataOptions[0]);
  const [isOpen, setOpen] = useState(false);
  const [nameInputMode, setNameInputMode] = useState<NameInputMode>('existing');
  const [selectedAsset, setSelectedAsset] = useState<Category | null>(null);

  const uid = useUserStore((state) => state.uid);
  const infoAsset = useUserStore((state) => state.infoAsset);
  const listSave = useListStore((state) => state.listSave);
  const setListSave = useListStore((state) => state.setListSave);
  const updateChartData = useChartStore((state) => state.updateChartData);

  const [categories, setCategories] = useState<Category[]>([]);

  const saveAsset = infoAsset?.[key_assets.save];

  const initData: DataFormSave = {
    type: TYPE_TRANSACTION.IN,
    name: '',
    quantity: '',
    rate_value: '',
    market_value: '',
    total_value: '',
    date_buy: moment(new Date()).unix(),
    note: '',
    asset_id: saveAsset?.id ?? '',
    user_id: uid,
    target: '',
  };

  const [dataForm, setDataForm] = useState<DataFormSave>(initData);
  const { type, name, rate_value, total_value, date_buy, market_value, target } = dataForm;
  const date_ = new Date(date_buy * 1000);
  const dataStr = moment(date_buy * 1000).format('DD/MM/YYYY');

  const snapPoints = useMemo(() => ['50%', '90%'], []);

  useEffect(() => {
    getCategoriesSave();
  }, []);

  const getCategoriesSave = async () => {
    try {
      const dataBody = {asset_id: saveAsset?.id, type: key_assets.save}
      const jsonData = await getCategories(dataBody, uid);
      if (jsonData.success) {
        const list = (jsonData.data as Category[]) || [];
        setCategories(list);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const onShow = () => {
    // Reset form when showing
    setDataForm({
      ...initData,
      asset_id: saveAsset?.id ?? '',
      user_id: uid,
    });
    setSelectedAsset(null);
    setNameInputMode('existing');
    dataType.current = dataOptions[0];
    
    if (bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(1);
    }
  };

  const openShowDate = () => {
    setOpen(true);
  };

  const cancelDate = () => {
    setOpen(false);
  };

  const onChangeDate = (e: DateTimePickerEvent, date?: Date) => {
    cancelDate();
    setDataForm({
      ...dataForm,
      date_buy: moment(date).unix(),
    });
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const onClose = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.close();
    }
  };

  const onChangeText = (value: string, field: string) => {
    if (field === 'rate_value' && !isChangeMarket.current) {
      setDataForm({
        ...dataForm,
        [field]: value,
        market_value: value,
      });
    } else {
      if (!isChangeMarket.current && field === 'market_value') {
        isChangeMarket.current = true;
      }
      setDataForm({
        ...dataForm,
        [field]: value,
      });
    }
  };

  const onCreate = async () => {
    if (name && total_value && date_buy) {
      const jsonCreate = await createTransactionSave(dataForm);
      if (jsonCreate.success) {
        handleCreateSuccess(jsonCreate.data);
      }
    }
  };

  const handleCreateSuccess = (createdData: any) => {
    if (!createdData) {
      onClose();
      return;
    }

    const existingIndex = listSave.findIndex((item) => item.id === createdData.id);
    if (existingIndex >= 0) {
      const updatedList = [...listSave];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        total_value: (updatedList[existingIndex].total_value || 0) + (createdData.total_value || 0),
      };
      setListSave(updatedList);
    } else {
      const newList = [createdData, ...listSave];
      setListSave(newList);
    }

    const valueChange = dataForm.type === TYPE_TRANSACTION.IN ? Number(total_value) : -Number(total_value);
    updateChartData(key_assets.save, valueChange, { date_buy: dataForm.date_buy, type: dataForm.type });

    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const onSelectNameMode = (mode: NameInputMode) => {
    setNameInputMode(mode);
    setSelectedAsset(null);
    setDataForm({ ...dataForm, name: '' });
  };

  const onSelectExistingAsset = (item: Category) => {
    setSelectedAsset(item);
    setDataForm((prev) => ({ ...prev, name: item.name, category_id: item.id }));
  };

  const onChangeType = (data: dataOption) => {
    dataType.current = data;
    setDataForm({
      ...dataForm,
      type: data.type,
    });
  };

  const renderItemCategory = (data: Category) => {
    return (
      <View style={styles.item_category}>
        <Text style={styles.item_category_txt}>{data.name}</Text>
      </View>
    );
  };

  const renderItemDrop = (item: dataOption, selected?: boolean) => {
    return (
      <View key={item.id} style={[styles.item_list, selected && { backgroundColor: COLOR_APP.blue }]}>
        <Text style={[styles.txt_list, selected && { color: '#fff' }]}>{item.title}</Text>
      </View>
    );
  };

  // Get label by key
  const getLabel = (key: string): string => {
    const labels: Record<string, string> = {
      total_value: 'Số tiền',
      rate_value: 'Lãi suất (%)',
      target: 'Mục tiêu (VNĐ)',
    };
    return labels[key] || '';
  };

  // Get placeholder by key
  const getPlaceholder = (key: string): string => {
    const placeholders: Record<string, string> = {
      total_value: 'Nhập số tiền...',
      rate_value: 'Nhập lãi suất...',
      target: 'Nhập mục tiêu tiết kiệm...',
    };
    return placeholders[key] || '';
  };

  // Get field value from dataForm by key
  const getFieldValue = (key: string): string => {
    return (dataForm as any)[key] || '';
  };

  // Render input by key
  const renderInputByKey = (key: string, keyboardType: 'default' | 'numeric' = 'default') => (
    <>
      <Text style={styles.label}>{getLabel(key)}</Text>
      <TextInput
        style={styles.input}
        value={getFieldValue(key)}
        onChangeText={(txt) => onChangeText(txt, key)}
        keyboardType={keyboardType}
        placeholder={getPlaceholder(key)}
      />
    </>
  );

  useImperativeHandle(ref, () => ({
    onShow,
    onClose,
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onAnimate={(fromIndex, toIndex) => {
        if (toIndex === 0) {
          onClose();
        }
      }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.popupTitle}>{'Tạo giao dịch tiết kiệm'}</Text>

        <View style={styles.box_name_section}>
          <View style={styles.row_mode}>
            <RNBounceable
              style={[styles.mode_btn, nameInputMode === 'existing' && styles.mode_btn_active]}
              onPress={() => onSelectNameMode('existing')}
            >
              <Text style={[styles.mode_btn_txt, nameInputMode === 'existing' && styles.mode_btn_txt_active]}>
                {'Có sẵn'}
              </Text>
            </RNBounceable>
            <RNBounceable
              style={[styles.mode_btn, nameInputMode === 'new' && styles.mode_btn_active]}
              onPress={() => onSelectNameMode('new')}
            >
              <Text style={[styles.mode_btn_txt, nameInputMode === 'new' && styles.mode_btn_txt_active]}>
                {'Tạo mới'}
              </Text>
            </RNBounceable>
          </View>

          <Text style={styles.label}>{'Tên sổ tiết kiệm'}</Text>
          <View style={styles.box_name_input}>
            {nameInputMode === 'existing' ? (
              <Dropdown
                data={categories}
                labelField="name"
                valueField="name"
                placeholder="Chọn sổ tiết kiệm..."
                style={styles.dropdown_name}
                renderItem={renderItemCategory}
                value={selectedAsset?.name}
                onChange={onSelectExistingAsset}
              />
            ) : (
              <TextInput
                placeholder="Nhập tên sổ tiết kiệm ..."
                onChangeText={(txt) => onChangeText(txt, 'name')}
                value={dataForm.name}
                style={styles.txt_name}
              />
            )}
          </View>
        </View>

        <Text style={styles.label}>{'Loại giao dịch'}</Text>
        <View style={styles.input}>
          <Dropdown
            data={dataOptions}
            labelField="title"
            valueField="title"
            renderItem={renderItemDrop}
            placeholder="Chọn một mục..."
            value={dataType.current}
            onChange={(item) => {
              onChangeType(item);
            }}
          />
        </View>

        {renderInputByKey('total_value', 'numeric')}

        {renderInputByKey('rate_value', 'numeric')}

        {renderInputByKey('target', 'numeric')}

        <Text style={styles.label}>{'Ngày tạo'}</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => openShowDate()}>
          <Text style={styles.dateText}>{dataStr}</Text>
        </TouchableOpacity>

        {isOpen && (
          <DateTimePicker value={date_} mode="date" display="default" onChange={onChangeDate} />
        )}

        <Text style={styles.label}>{'Ghi chú'}</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={dataForm.note}
          onChangeText={(txt) => setDataForm({ ...dataForm, note: txt })}
          placeholder="Nhập ghi chú..."
          multiline
        />
      </BottomSheetScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={onCreate}>
        <Text style={styles.saveButtonText}>{'Tạo'}</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
});

PopupFormSave.displayName = 'PopupFormSave';

export default PopupFormSave;

const styles = StyleSheet.create({
  contentContainer: {
    marginHorizontal: 20,
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLOR_APP.blue,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  box_name_section: {
    marginBottom: 5,
  },
  box_name_input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdown_name: {
    padding: 10,
  },
  txt_name: {
    padding: 10,
  },
  row_mode: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  mode_btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
    alignItems: 'center',
  },
  mode_btn_active: {
    backgroundColor: COLOR_APP.blue,
  },
  mode_btn_txt: {
    fontSize: 14,
    color: '#666',
  },
  mode_btn_txt_active: {
    color: '#fff',
  },
  item_category: {
    padding: 10,
  },
  item_category_txt: {
    fontSize: 14,
  },
  item_list: {
    padding: 10,
    borderRadius: 8,
  },
  txt_list: {
    fontSize: 14,
    color: '#1a1a1a',
  },
});
