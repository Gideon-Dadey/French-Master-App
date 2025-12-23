import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { spacing, fontSize } from '../utils/responsive';

const { width } = Dimensions.get('window');

const chartConfig = (colors) => ({
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.secondaryBackground,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(${colors.text === '#0F1419' ? '15, 20, 25' : '247, 249, 250'}, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary,
  },
});

export default function AnalyticsChart({ type = 'line', data, title, height = 220 }) {
  const { colors } = useTheme();

  const renderChart = () => {
    const config = chartConfig(colors);

    switch (type) {
      case 'line':
        return (
          <LineChart
            data={data}
            width={width - spacing.xl * 2}
            height={height}
            chartConfig={config}
            bezier
            style={styles.chart}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            withDots={true}
            withShadow={false}
          />
        );
      case 'bar':
        return (
          <BarChart
            data={data}
            width={width - spacing.xl * 2}
            height={height}
            chartConfig={config}
            style={styles.chart}
            showValuesOnTopOfBars
            withInnerLines={false}
            fromZero
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            width={width - spacing.xl * 2}
            height={height}
            chartConfig={config}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            absolute
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      )}
      {renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: spacing.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    marginHorizontal: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: spacing.md,
    marginVertical: spacing.sm,
  },
});

