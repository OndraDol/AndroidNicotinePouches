import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth } from '../../src/services/firebase';
import { syncFromCloud, syncToCloud } from '../../src/services/sync';

export default function SettingsScreen() {
    const { t } = useTranslation();
    const { theme, setTheme, settings, updateSettings, clearHistory } = useAppStore();
    const c = Colors[theme || 'dark'];

    const [localLimit, setLocalLimit] = useState(String(settings.dailyLimit));
    const [localPrice, setLocalPrice] = useState(String(settings.packPrice));
    const [localPieces, setLocalPieces] = useState(String(settings.pouchesPerPack));

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsub;
    }, []);

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
        title: { fontSize: 18, fontWeight: 'bold', color: c.text, marginBottom: 16 },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.border,
        },
        label: { color: c.text, fontSize: 16, flex: 1 },
        input: {
            backgroundColor: c.background,
            color: c.text,
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: c.border,
            width: 100,
            textAlign: 'center',
        },
        textInput: {
            backgroundColor: c.background,
            color: c.text,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: c.border,
            marginBottom: 10,
        },
        saveBtn: {
            marginTop: 20,
        },
        statusText: { color: c.primary, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }
    });

    const handleSave = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateSettings({
            dailyLimit: Number(localLimit) || 10,
            packPrice: Number(localPrice) || 150,
            pouchesPerPack: Number(localPieces) || 20,
        });
    };

    const handleClear = () => {
        Alert.alert(
            "Smazat historii",
            "Opravdu chcete vymazat celou historii záznamů? Tuto operaci nelze vrátit zpět.",
            [
                { text: "Zrušit", style: "cancel" },
                {
                    text: "Smazat",
                    style: "destructive",
                    onPress: () => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                        clearHistory();
                    }
                }
            ]
        );
    };

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Chyba", "Vyplňte e-mail a heslo.");
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert("Chyba přihlášení", e.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) return Alert.alert("Chyba", "Vyplňte e-mail a heslo.");
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert("Chyba registrace", e.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsLoading(false);
        }
    };

    const doUpload = async () => {
        if (!user) return;
        setIsLoading(true);
        const res = await syncToCloud(user.uid);
        setIsLoading(false);
        if (res.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Hotovo", "Data byla úspěšně zálohována do Cloudu.");
        } else {
            Alert.alert("Chyba", "Záloha selhala.");
        }
    };

    const doDownload = async () => {
        if (!user) return;
        setIsLoading(true);
        const res = await syncFromCloud(user.uid);
        setIsLoading(false);
        if (res.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Hotovo", res.empty ? "Žádná data v cloudu." : "Data úspěšně načtena z Cloudu.");
        } else {
            Alert.alert("Chyba", "Obnova dat selhala.");
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scroll}>
                <View style={styles.card}>
                    <Text style={styles.title}>{t('settings')}</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Tmavý motiv (Dark Theme)</Text>
                        <Switch
                            value={theme === 'dark'}
                            onValueChange={(val) => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setTheme(val ? 'dark' : 'light');
                            }}
                        />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Denní limit (kusů)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={localLimit} onChangeText={setLocalLimit} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Cena za puk</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={localPrice} onChangeText={setLocalPrice} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Sáčků v puku</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={localPieces} onChangeText={setLocalPieces} />
                    </View>
                    <View style={styles.saveBtn}>
                        <Button title="Uložit změny" onPress={handleSave} color={c.primary} />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Cloud Sync (Firebase)</Text>
                    {isLoading && <ActivityIndicator size="large" color={c.primary} />}

                    {!user ? (
                        <View>
                            <TextInput style={styles.textInput} placeholder="E-mail" placeholderTextColor={c.muted} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                            <TextInput style={styles.textInput} placeholder="Heslo" placeholderTextColor={c.muted} value={password} onChangeText={setPassword} secureTextEntry />
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                <Button title="Login" onPress={handleLogin} color={c.primary} />
                                <Button title="Registrovat" onPress={handleRegister} color={c.muted} />
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.statusText}>Přihlášen jako: {user.email}</Text>
                            <View style={{ marginBottom: 10 }}>
                                <Button title="Nahrát do Cloudu (Záloha)" onPress={doUpload} color={c.primary} />
                            </View>
                            <View style={{ marginBottom: 10 }}>
                                <Button title="Stáhnout z Cloudu (Obnova)" onPress={doDownload} color={c.primaryDark} />
                            </View>
                            <Button title="Odhlásit" onPress={() => signOut(auth)} color={c.danger} />
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Data Management</Text>
                    <Button title="Vymazat lokální historii" color={c.danger} onPress={handleClear} />
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}
