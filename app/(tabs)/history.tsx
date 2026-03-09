import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, History as HistoryIcon, Trash2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';

export default function HistoryScreen() {
    const { history, removeEntry, theme } = useAppStore();
    const c = Colors[theme || 'dark'];

    // Sort history by date descending
    const sortedHistory = useMemo(() =>
        [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [history]);

    const renderRightActions = (id: string) => (
        <TouchableOpacity
            style={[styles.deleteAction, { backgroundColor: c.danger }]}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                removeEntry(id);
            }}
        >
            <Trash2 color="#FFF" size={24} />
        </TouchableOpacity>
    );

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getDayHeading = (iso: string) => {
        const d = new Date(iso);
        const today = new Date().toISOString().split('T')[0];
        const itemDate = iso.split('T')[0];
        if (today === itemDate) return 'Dnes';
        return d.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: c.background }]}>
            <LinearGradient
                colors={[c.secondary + '20', 'transparent']}
                style={styles.headerGradient}
            />

            <View style={styles.header}>
                <Text style={[styles.title, { color: c.text }]}>Historie</Text>
                <Text style={[styles.subTitle, { color: c.textDim }]}>Celkem {history.length} záznamů</Text>
            </View>

            <FlatList
                data={sortedHistory}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => {
                    const showHeading = index === 0 ||
                        item.timestamp.split('T')[0] !== sortedHistory[index - 1].timestamp.split('T')[0];

                    return (
                        <View>
                            {showHeading && (
                                <View style={styles.dateHeader}>
                                    <Calendar size={14} color={c.textDim} />
                                    <Text style={[styles.dateHeading, { color: c.textDim }]}>{getDayHeading(item.timestamp)}</Text>
                                </View>
                            )}
                            <Swipeable renderRightActions={() => renderRightActions(item.id)}>
                                <View style={[styles.item, { backgroundColor: c.card, borderColor: c.border }]}>
                                    <View style={styles.itemMain}>
                                        <Text style={[styles.itemBrand, { color: c.text }]}>{item.brand}</Text>
                                        <Text style={[styles.itemName, { color: c.textDim }]}>{item.name}</Text>
                                    </View>
                                    <View style={styles.itemMeta}>
                                        <Text style={[styles.itemMg, { color: c.primary }]}>{item.mg} mg</Text>
                                        <Text style={[styles.itemTime, { color: c.textDim }]}>{formatDate(item.timestamp)}</Text>
                                    </View>
                                </View>
                            </Swipeable>
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <HistoryIcon size={64} color={c.border} />
                        <Text style={[styles.emptyText, { color: c.textDim }]}>Zatím žádná historie</Text>
                    </View>
                }
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
    header: { marginTop: 60, paddingHorizontal: 20, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold' },
    subTitle: { fontSize: 16, marginTop: 4 },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        marginBottom: 12,
        paddingHorizontal: 4
    },
    dateHeading: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
    },
    itemMain: { flex: 1 },
    itemBrand: { fontSize: 16, fontWeight: '700' },
    itemName: { fontSize: 13, marginTop: 2 },
    itemMeta: { alignItems: 'flex-end', justifyContent: 'center' },
    itemMg: { fontWeight: '800', fontSize: 15 },
    itemTime: { fontSize: 12, marginTop: 4 },
    deleteAction: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        marginBottom: 8,
        marginLeft: 10,
    },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, marginTop: 16, fontWeight: '500' },
});
