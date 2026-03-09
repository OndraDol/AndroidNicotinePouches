import BottomSheet, { BottomSheetFlatList, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../src/constants/Colors';
import { POUCH_DB, USER_BENCHMARKS } from '../../src/constants/pouchDb';
import { useAppStore } from '../../src/store';
import { calculateStats, getDynamicLimitForDate, getLocalISODate } from '../../src/utils/stats';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { theme, history, addEntry, settings, customPouches, selection, setSelection } = useAppStore();
  const c = Colors[theme || 'dark'];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%', '90%'], []);
  const [searchQuery, setSearchQuery] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: { padding: 16 },
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    title: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 10 },
    grid: { flexDirection: 'row', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
    statBox: {
      flex: 1,
      minWidth: '40%',
      backgroundColor: c.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    statVal: { fontSize: 24, fontWeight: '900', color: c.text },
    statLbl: { fontSize: 12, fontWeight: '700', color: c.muted, textTransform: 'uppercase' },
    addBtn: {
      backgroundColor: c.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      flex: 1,
      marginLeft: 10,
    },
    addBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    selectorBtn: {
      flex: 2,
      backgroundColor: c.card,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.border,
      justifyContent: 'center'
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'stretch'
    },
    backdateBtn: {
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: c.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    backdateText: { color: c.text, fontSize: 12, fontWeight: 'bold' },
    sheetSearch: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      backgroundColor: c.card,
    },
    searchInput: {
      backgroundColor: c.background,
      color: c.text,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    chartContainer: {
      marginTop: 10,
      alignItems: 'center',
      borderRadius: 16,
      overflow: 'hidden'
    }
  });

  const allPouches = useMemo(() => [...customPouches, ...POUCH_DB], [customPouches]);
  const searchResults = useMemo(() => {
    if (!searchQuery) return allPouches.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return allPouches.filter(p => p.n.toLowerCase().includes(q) || p.b.toLowerCase().includes(q)).slice(0, 50);
  }, [searchQuery, allPouches]);

  const handleOpenSearch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSelect = useCallback((pouch: any) => {
    Haptics.selectionAsync();
    setSelection(pouch);
    bottomSheetRef.current?.close();
  }, [setSelection]);

  const handleAdd = useCallback(() => {
    if (!selection) return handleOpenSearch();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const logTime = showDatePicker ? selectedDate : new Date();
    addEntry({
      id: Date.now().toString(),
      brand: selection.b,
      name: selection.n,
      mg: selection.mg,
      date: logTime.toISOString(),
      localDate: getLocalISODate(logTime),
    });
    if (showDatePicker) {
      setShowDatePicker(false);
      setSelectedDate(new Date());
    }
  }, [selection, showDatePicker, selectedDate, addEntry, handleOpenSearch]);

  const onDateChange = (event: any, selected: Date | undefined) => {
    if (selected) {
      setSelectedDate(selected);
      // Wait a moment so the picker has time to close on Android before adding
      if (event.type === 'set') {
        setTimeout(() => handleAdd(), 100);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const todayStr = getLocalISODate(new Date());
  const todayEntries = history.filter(h => h.localDate === todayStr);
  const stats = calculateStats(history, settings, USER_BENCHMARKS);

  // Calculate Chart Data (Last 7 Days)
  const chartData = useMemo(() => {
    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = getLocalISODate(d);
      const count = history.filter(h => h.localDate === iso).length;
      labels.push(d.toLocaleDateString('en-GB', { weekday: 'short' }).substring(0, 2)); // Mo, Tu
      data.push(count);
    }
    return {
      labels,
      datasets: [{ data, color: (opacity = 1) => c.primary }],
    };
  }, [history, c.primary]);

  const renderSheetItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity style={styles.searchItem} onPress={() => handleSelect(item)}>
      <View>
        <Text style={{ fontWeight: 'bold', color: c.text }}>{item.n}</Text>
        <Text style={{ fontSize: 12, color: c.muted }}>{item.b}</Text>
      </View>
      <View style={{ backgroundColor: c.background, padding: 6, borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: c.text, fontWeight: '700' }}>{item.mg} mg</Text>
      </View>
    </TouchableOpacity>
  ), [c, styles, handleSelect]);

  const chartConfig = {
    backgroundColor: c.card,
    backgroundGradientFrom: c.card,
    backgroundGradientTo: c.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => c.muted,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "2", stroke: c.card }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.grid}>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>{t('today_usage')}</Text>
            <Text style={styles.statVal}>{todayEntries.length}</Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>{t('limit_label')}: {getDynamicLimitForDate(settings, new Date())}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLbl}>{t('streak')}</Text>
            <Text style={styles.statVal}>{stats.streak}</Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>{t('days_recorded')}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('log_usage')}</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.selectorBtn} onPress={handleOpenSearch}>
              <Text style={{ fontSize: 11, color: c.muted }}>Selected</Text>
              <Text style={{ fontWeight: 'bold', color: c.text }} numberOfLines={1}>
                {selection ? selection.n : 'Select a pouch...'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => { setShowDatePicker(false); handleAdd(); }}>
              <Text style={styles.addBtnText}>+ ADD</Text>
            </TouchableOpacity>
          </View>

          {selection && (
            <TouchableOpacity
              style={styles.backdateBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.backdateText}>🕒 Zadat do minulosti</Text>
            </TouchableOpacity>
          )}

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={selectedDate}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('charts_title', 'Analytics')}</Text>
          <Text style={{ color: c.muted, fontSize: 12, marginBottom: 10 }}>Přehed posledních 7 dnů</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={chartConfig}
              bezier
              withInnerLines={false}
              withOuterLines={false}
              style={{ paddingRight: 15 }}
            />
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: c.card }}
        handleIndicatorStyle={{ backgroundColor: c.muted }}
      >
        <View style={styles.sheetSearch}>
          <BottomSheetTextInput
            style={styles.searchInput}
            placeholder="Search brand or flavor..."
            placeholderTextColor={c.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <BottomSheetFlatList
          data={searchResults}
          keyExtractor={(item, idx) => item.n + idx}
          renderItem={renderSheetItem}
          keyboardShouldPersistTaps="handled"
        />
      </BottomSheet>
    </View>
  );
}
