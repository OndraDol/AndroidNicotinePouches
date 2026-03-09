import * as Haptics from 'expo-haptics';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FlatList, Swipeable } from 'react-native-gesture-handler';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';

export default function HistoryScreen() {
    const { t } = useTranslation();
    const { theme, history, removeEntry } = useAppStore();
    const c = Colors[theme || 'dark'];

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: c.background },
        item: {
            padding: 16,
            backgroundColor: c.card,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        title: { color: c.text, fontWeight: 'bold' },
        sub: { color: c.muted, fontSize: 12 },
        time: { color: c.muted, fontSize: 12 },
        deleteBtn: {
            backgroundColor: c.danger,
            justifyContent: 'center',
            alignItems: 'center',
            width: 80,
        },
        deleteText: {
            color: 'white',
            fontWeight: 'bold',
        },
        emptyText: {
            textAlign: 'center',
            marginTop: 20,
            color: c.muted,
        }
    });

    const handleDelete = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        removeEntry(id);
    };

    const renderRightActions = (progress: any, dragX: any, id: string) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });
        return (
            <View style={styles.deleteBtn}>
                <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]} onPress={() => handleDelete(id)}>
                    Delete
                </Animated.Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Swipeable renderRightActions={(p, d) => renderRightActions(p, d, item.id)}>
                        <View style={styles.item}>
                            <View>
                                <Text style={styles.title}>{item.name}</Text>
                                <Text style={styles.sub}>{item.mg} mg</Text>
                            </View>
                            <Text style={styles.time}>{new Date(item.date).toLocaleTimeString()}</Text>
                        </View>
                    </Swipeable>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Historie je prázdná</Text>}
            />
        </View>
    );
}
