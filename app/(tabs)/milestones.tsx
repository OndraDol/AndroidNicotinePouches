import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { BADGES_DEF, HEALTH_TIMELINE } from '../../src/constants/badges';
import { USER_BENCHMARKS } from '../../src/constants/pouchDb';
import { useAppStore } from '../../src/store';
import { calculateStats } from '../../src/utils/stats';

export default function MilestonesScreen() {
    const { t, i18n } = useTranslation();
    const { theme, history, settings } = useAppStore();
    const c = Colors[theme || 'dark'];

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
        achievementsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
        },
        badgeBox: {
            width: '30%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: c.border,
            padding: 8,
            backgroundColor: c.background,
        },
        badgeBoxUnlocked: {
            backgroundColor: theme === 'dark' ? '#064e3b' : '#ecfdf5',
            borderColor: theme === 'dark' ? '#059669' : '#6ee7b7',
        },
        badgeIcon: { fontSize: 28, marginBottom: 4 },
        badgeTitle: { fontSize: 10, fontWeight: 'bold', color: c.text, textAlign: 'center' },

        healthItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            gap: 12,
        },
        healthTime: { width: 45, fontSize: 12, fontWeight: 'bold', color: c.muted },
        healthText: { flex: 1, fontSize: 14, color: c.muted },
        healthTextUnlocked: { color: c.text },
        healthCheck: { color: c.primary, fontWeight: 'bold' }
    });

    const stats = useMemo(() => calculateStats(history, settings, USER_BENCHMARKS), [history, settings]);

    const lastLogDate = history.length > 0 ? new Date(history[0].date).getTime() : 0;
    const minsSinceLast = lastLogDate > 0 ? (Date.now() - lastLogDate) / (1000 * 60) : 0;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('achievements', 'Ocenění')}</Text>
                    <View style={styles.achievementsGrid}>
                        {BADGES_DEF.map((badge) => {
                            const unlocked = badge.condition(settings, history, stats);
                            const lang = i18n.language === 'cs' ? 'cs' : 'en';
                            const title = badge[`key_${lang}` as keyof typeof badge] as string;
                            return (
                                <View key={badge.id} style={[styles.badgeBox, unlocked && styles.badgeBoxUnlocked, !unlocked && { opacity: 0.6 }]}>
                                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                    <Text style={styles.badgeTitle} numberOfLines={2}>{title}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>{t('health_timeline', 'Obnova Zdraiví')}</Text>
                    {history.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: c.muted }}>Žádná data</Text>
                    ) : (
                        HEALTH_TIMELINE.map((item, idx) => {
                            const unlocked = minsSinceLast >= item.minutes;
                            const lang = i18n.language === 'cs' ? 'cs' : 'en';
                            const text = item[lang as keyof typeof item] as string;
                            const timeLbl = item.minutes < 60 ? `${item.minutes}m` : (item.minutes < 1440 ? `${item.minutes / 60}h` : `${item.minutes / 1440}d`);

                            return (
                                <View key={idx} style={styles.healthItem}>
                                    <Text style={styles.healthTime}>{timeLbl}</Text>
                                    <Text style={[styles.healthText, unlocked && styles.healthTextUnlocked]}>{text}</Text>
                                    {unlocked && <Text style={styles.healthCheck}>✔</Text>}
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
