import BottomSheet, { BottomSheetBackdrop, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Plus, Search, TrendingUp, Wallet, Zap } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../src/constants/Colors';
import { POUCH_DB } from '../../src/constants/pouchDb';
import { useAppStore } from '../../src/store';
import { calculateStats, getLocalISODate } from '../../src/utils/stats';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { history, settings, selection, setSelection, addEntry, theme } = useAppStore();
  const c = Colors[theme || 'dark'];

  const [search, setSearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);

  const stats = useMemo(() => calculateStats(history, settings), [history, settings]);
  const todayEntries = history.filter(e => e.timestamp.startsWith(getLocalISODate()));
  const progress = Math.min(todayEntries.length / stats.dailyLimit, 1);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const counts = last7Days.map(date => history.filter(e => e.timestamp.startsWith(date)).length);
    return {
      labels: last7Days.map(d => d.slice(8)),
      datasets: [{ data: counts }]
    };
  }, [history]);

  const filteredPouchDb = useMemo(() => {
    const term = search.toLowerCase();
    return POUCH_DB.filter(p => p.b.toLowerCase().includes(term) || p.n.toLowerCase().includes(term)).slice(0, 50);
  }, [search]);

  const handleAddPouch = (pouch: any, customTime?: Date) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addEntry({
      id: Math.random().toString(36).substr(2, 9),
      brand: pouch.b,
      name: pouch.n,
      mg: pouch.mg,
      timestamp: customTime ? customTime.toISOString() : new Date().toISOString(),
      localDate: getLocalISODate(customTime || new Date()),
    });
    sheetRef.current?.close();
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: c.textDim }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <LinearGradient
          colors={[c.primary + '30', 'transparent']}
          style={styles.headerBackground}
        />

        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: c.textDim }]}>Dobré odpoledne,</Text>
            <Text style={[styles.title, { color: c.text }]}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={[styles.historyBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Clock size={20} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <View style={[styles.mainCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressTitle, { color: c.text }]}>Dnešní limit</Text>
              <Text style={[styles.progressSub, { color: c.textDim }]}>{todayEntries.length} z {stats.dailyLimit} sáčků</Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: c.primary + '20' }]}>
              <Zap size={14} color={c.primary} fill={c.primary} />
              <Text style={[styles.streakText, { color: c.primary }]}>{stats.streak} dní</Text>
            </View>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: c.surface }]}>
            <LinearGradient
              colors={[c.primary, '#34D399']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>

          <View style={styles.quickStats}>
            <View style={styles.qStat}>
              <Wallet size={16} color={c.textDim} />
              <Text style={[styles.qStatText, { color: c.text }]}>{stats.moneySaved} Kč ušetřeno</Text>
            </View>
            <View style={styles.qStat}>
              <TrendingUp size={16} color={c.textDim} />
              <Text style={[styles.qStatText, { color: c.text }]}>{stats.avgPerDay.toFixed(1)}/den</Text>
            </View>
          </View>
        </View>

        {/* Quick Add Section */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryAction, { backgroundColor: c.primary }]}
            onPress={() => handleAddPouch(selection)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.1)']}
              style={StyleSheet.absoluteFill}
            />
            <Plus size={24} color="#FFF" />
            <Text style={styles.primaryActionText}>Přidat {selection?.b || 'puk'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => sheetRef.current?.expand()}
          >
            <Search size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Chart Section */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>Týdenní trend</Text>
        <View style={[styles.chartCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <LineChart
            data={chartData}
            width={width - 48}
            height={180}
            chartConfig={{
              backgroundColor: c.card,
              backgroundGradientFrom: c.card,
              backgroundGradientTo: c.card,
              decimalPlaces: 0,
              color: (opacity = 1) => c.primary,
              labelColor: (opacity = 1) => c.textDim,
              propsForDots: { r: "4", strokeWidth: "2", stroke: c.primary },
              propsForBackgroundLines: { stroke: c.border, strokeDasharray: "" }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="datetime"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) handleAddPouch(selection, date);
          }}
        />
      )}

      {/* Pouch Picker Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['50%', '90%']}
        enablePanDownToClose
        backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />}
        backgroundStyle={{ backgroundColor: c.card }}
        handleIndicatorStyle={{ backgroundColor: c.muted }}
      >
        <View style={styles.sheetContainer}>
          <Text style={[styles.sheetTitle, { color: c.text }]}>Vybrat značku</Text>
          <View style={[styles.searchContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Search size={20} color={c.textDim} />
            <TextInput
              style={[styles.searchInput, { color: c.text }]}
              placeholder="Hledat..."
              placeholderTextColor={c.muted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <BottomSheetFlatList
            data={filteredPouchDb}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.pouchItem, { borderBottomColor: c.border }]}
                onPress={() => {
                  setSelection(item);
                  sheetRef.current?.close();
                }}
              >
                <View>
                  <Text style={[styles.pouchBrand, { color: c.text }]}>{item.b}</Text>
                  <Text style={[styles.pouchName, { color: c.textDim }]}>{item.n}</Text>
                </View>
                <Text style={[styles.pouchMg, { color: c.primary }]}>{item.mg} mg</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  greeting: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 32, fontWeight: 'bold' },
  historyBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  mainCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: { fontSize: 18, fontWeight: '700' },
  progressSub: { fontSize: 14, marginTop: 4 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: { fontSize: 13, fontWeight: '700' },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
  },
  qStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qStatText: { fontSize: 13, fontWeight: '600' },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryAction: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  primaryActionText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  secondaryAction: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  chartCard: {
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
    marginTop: 8,
  },
  sheetContainer: { flex: 1, padding: 20 },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  pouchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  pouchBrand: { fontSize: 16, fontWeight: '700' },
  pouchName: { fontSize: 13, marginTop: 2 },
  pouchMg: { fontWeight: '700' },
  statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600' },
});
