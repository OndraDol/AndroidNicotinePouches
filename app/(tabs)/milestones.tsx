import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Trophy } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BADGES_DEF, HEALTH_TIMELINE } from '../../src/constants/badges';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';
import { calculateStats } from '../../src/utils/stats';

const { width } = Dimensions.get('window');

export default function MilestonesScreen() {
    const { history, settings, theme } = useAppStore();
    const c = Colors[theme || 'dark'];
    const stats = useMemo(() => calculateStats(history, settings), [history, settings]);

    const lastEntryTime = history.length > 0
        ? new Date(history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp)
        : new Date();

    const hoursSinceLast = Math.round((new Date().getTime() - lastEntryTime.getTime()) / (1000 * 60 * 60));

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <LinearGradient
                colors={[c.warning + '20', 'transparent']}
                style={styles.headerGradient}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: c.text }]}>Milníky</Text>
                    <View style={[styles.scoreCard, { backgroundColor: c.card, borderColor: c.border }]}>
                        <Trophy color={c.warning} size={32} />
                        <View>
                            <Text style={[styles.scoreValue, { color: c.text }]}>{stats.streak}</Text>
                            <Text style={[styles.scoreLabel, { color: c.textDim }]}>Denní Streak</Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: c.text }]}>Úspěchy</Text>
                <View style={styles.badgeGrid}>
                    {BADGES_DEF.map((badge) => {
                        const isUnlocked = badge.condition(stats, history);
                        return (
                            <View
                                key={badge.id}
                                style={[
                                    styles.badgeWrapper,
                                    { backgroundColor: isUnlocked ? c.card : c.surface, borderColor: isUnlocked ? c.border : 'transparent' }
                                ]}
                            >
                                {!isUnlocked && <View style={styles.lockOverlay}><Lock size={16} color={c.muted} /></View>}
                                <Text style={[styles.badgeIcon, { opacity: isUnlocked ? 1 : 0.3 }]}>{badge.icon}</Text>
                                <Text style={[styles.badgeName, { color: isUnlocked ? c.text : c.muted }]} numberOfLines={1}>{badge.name_cs}</Text>
                            </View>
                        );
                    })}
                </View>

                <Text style={[styles.sectionTitle, { color: c.text }]}>Zdravotní osa</Text>
                <View style={[styles.timelineCard, { backgroundColor: c.card, borderColor: c.border }]}>
                    {HEALTH_TIMELINE.map((item, index) => {
                        const isCompleted = hoursSinceLast >= item.hours;
                        return (
                            <View key={index} style={styles.timelineItem}>
                                <View style={styles.timelineLeft}>
                                    <View style={[
                                        styles.timelineDot,
                                        { backgroundColor: isCompleted ? c.primary : c.border }
                                    ]} />
                                    {index !== HEALTH_TIMELINE.length - 1 && <View style={[styles.timelineLine, { backgroundColor: c.border }]} />}
                                </View>
                                <View style={styles.timelineRight}>
                                    <Text style={[styles.timelineTime, { color: isCompleted ? c.primary : c.textDim }]}>
                                        {item.hours < 24 ? `${item.hours}h` : `${Math.floor(item.hours / 24)}d`}
                                    </Text>
                                    <Text style={[styles.timelineStatus, { color: isCompleted ? c.text : c.muted }]}>
                                        {item.label_cs}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 250 },
    scroll: { padding: 20 },
    header: { marginTop: 40, marginBottom: 30 },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    scoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
    },
    scoreValue: { fontSize: 28, fontWeight: '800' },
    scoreLabel: { fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, marginTop: 10 },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 30,
    },
    badgeWrapper: {
        width: (width - 64) / 3,
        aspectRatio: 1,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        padding: 10,
    },
    badgeIcon: { fontSize: 32, marginBottom: 8 },
    badgeName: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
    lockOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    timelineCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 16,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 20,
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    timelineRight: {
        paddingBottom: 24,
        flex: 1,
    },
    timelineTime: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 4,
    },
    timelineStatus: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
    },
});
