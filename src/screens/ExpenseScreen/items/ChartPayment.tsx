import { COLOR_APP } from '@/constants/constants';
import { useListStore } from '@/store/main.store';
import { formatChartData } from '@/utils/convertData';
import moment from 'moment';
import React, { ReactNode, Ref, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const WIDTH = Dimensions.get('window').width - 10;

export interface ChartTransacion {
  value: number,
  labelComponent?: (txt: string) => ReactNode;
}

export interface ChartRef {
  setColor: (color: string) => void
}

interface ChartProps {
  ref: Ref<ChartRef>
}

const ChartPayment = ({ ref }: ChartProps) => {

  const listExpense = useListStore(state => state.listExpense);
  const [dataChart, setChart] = useState<ChartTransacion[]>([]);
  const [spacing_width, setSpacing] = useState(13)
  const isReady = useRef(false);
  const [colorLine, setColorLine] = useState(COLOR_APP.green)

  useEffect(() => {
    const date_ = moment(new Date()).unix()*1000;
    const newData = formatChartData(date_, listExpense);
    isReady.current = true;
    const size = newData.length;
    setSpacing(WIDTH/size);
    setChart(newData)
  }, [listExpense]);

  useImperativeHandle(ref, () => ({
    setColor
  }))

  const setColor = (color: string) => {
    setColorLine(color);
  }

  
  
  return (
    <View style={{ marginBottom: 15 }}>
      {
        isReady.current && <LineChart
          isAnimated
          color={colorLine}
          noOfSections={3}
          animateOnDataChange
          animationDuration={2000}
          onDataChangeAnimationDuration={300}
          data={dataChart}
          hideDataPoints
          backgroundColor={'transparent'}
          spacing={spacing_width}
          initialSpacing={0}
          endSpacing={0}
          hideYAxisText
          hideRules
          yAxisColor="lightgray"
          xAxisColor="lightgray"
        />
      }
    </View>
  );
};

const styles = StyleSheet.create({

});

export default ChartPayment;