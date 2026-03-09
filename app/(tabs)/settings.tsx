import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, CreditCard, Layers, LogOut, Palette, Target, Trash2, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';

import { createUserWithEmailAndPassword, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsub;
    }, []);

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

    const loginFlow = async () => {
        if (!email || !password) return Alert.alert("Chyba", "Vyplňte e-mail a heslo.");
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert("Chyba přihlášení", "Zkontrolujte údaje nebo se zaregistrujte.");
        } finally {
            setIsLoading(false);
        }
    };

    const registerFlow = async () => {
        if (!email || !password) return Alert.alert("Chyba", "Vyplňte e-mail a heslo.");
        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e: any) {
            Alert.alert("Chyba registrace", e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const OptionRow = ({ icon: Icon, label, value, children }: any) => (
        <View style={[styles.row, { borderBottomColor: c.border }]}>
            <View style={styles.rowLabel}>
                <View style={[styles.rowIcon, { backgroundColor: c.primary + '15' }]}>
                    <Icon size={18} color={c.primary} />
                </View>
                <Text style={[styles.label, { color: c.text }]}>{label}</Text>
            </View>
            {children || <Text style={[styles.rowValue, { color: c.textDim }]}>{value}</Text>}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: c.background }]}>
            <LinearGradient
                colors={[c.primary + '15', 'transparent']}
                style={styles.headerGradient}
            />

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: c.text }]}>Nastavení</Text>
                </View>

                {/* Theme & Look */}
                <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionHeader, { color: c.textDim }]}>Vzhled</Text>
                    <OptionRow icon={Palette} label="Tmavý motiv">
                        <Switch
                            value={theme === 'dark'}
                            trackColor={{ false: c.border, true: c.primary }}
                            thumbColor="#FFF"
                            onValueChange={(val) => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setTheme(val ? 'dark' : 'light');
                            }}
                        />
                    </OptionRow>
                </View>

                {/* Strategy & Limits */}
                <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionHeader, { color: c.textDim }]}>Cíle a Limity</Text>
                    <OptionRow icon={Target} label="Denní limit">
                        <TextInput style={[styles.miniInput, { color: c.primary }]} keyboardType="numeric" value={localLimit} onChangeText={setLocalLimit} onBlur={handleSave} />
                    </OptionRow>
                    <OptionRow icon={CreditCard} label="Cena za puk (Kč)">
                        <TextInput style={[styles.miniInput, { color: c.primary }]} keyboardType="numeric" value={localPrice} onChangeText={setLocalPrice} onBlur={handleSave} />
                    </OptionRow>
                    <OptionRow icon={Layers} label="Sáčků v puku">
                        <TextInput style={[styles.miniInput, { color: c.primary }]} keyboardType="numeric" value={localPieces} onChangeText={setLocalPieces} onBlur={handleSave} />
                    </OptionRow>
                </View>

                {/* Sync Card */}
                <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionHeader, { color: c.textDim }]}>Cloud Synchronizace</Text>
                    {isLoading && <ActivityIndicator style={{ marginBottom: 16 }} color={c.primary} />}

                    {!user ? (
                        <View>
                            <TextInput style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]} placeholder="E-mail" placeholderTextColor={c.muted} value={email} onChangeText={setEmail} autoCapitalize="none" />
                            <TextInput style={[styles.input, { backgroundColor: c.surface, color: c.text, borderColor: c.border }]} placeholder="Heslo" placeholderTextColor={c.muted} value={password} onChangeText={setPassword} secureTextEntry />
                            <View style={styles.authRow}>
                                <TouchableOpacity style={[styles.authBtn, { backgroundColor: c.primary }]} onPress={loginFlow}>
                                    <Text style={styles.authBtnText}>Přihlásit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.authBtnSecondary, { borderColor: c.border }]} onPress={registerFlow}>
                                    <Text style={[styles.authBtnTextSecondary, { color: c.text }]}>Registrovat</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <View style={styles.userStatus}>
                                <User color={c.primary} size={20} />
                                <Text style={[styles.userEmail, { color: c.text }]}>{user.email}</Text>
                            </View>
                            <TouchableOpacity style={[styles.syncBtn, { backgroundColor: c.primary }]} onPress={() => { setIsLoading(true); syncToCloud(user.uid).then(() => { setIsLoading(false); Alert.alert("Uloženo"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }); }}>
                                <Cloud color="#FFF" size={20} />
                                <Text style={styles.syncBtnText}>Zálohovat do cloudu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.syncBtnSecondary, { borderColor: c.border, marginTop: 10 }]} onPress={() => { setIsLoading(true); syncFromCloud(user.uid).then(() => { setIsLoading(false); Alert.alert("Staženo"); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }); }}>
                                <Text style={[styles.syncBtnTextSecondary, { color: c.text }]}>Obnovit z cloudu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logoutBtn} onPress={() => signOut(auth)}>
                                <LogOut color={c.danger} size={18} />
                                <Text style={[styles.logoutText, { color: c.danger }]}>Odhlásit se</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Danger Zone */}
                <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border }]}>
                    <Text style={[styles.sectionHeader, { color: c.danger }]}>Nebezpečná zóna</Text>
                    <TouchableOpacity style={styles.dangerBtn} onPress={handleClear}>
                        <Trash2 color={c.danger} size={18} />
                        <Text style={[styles.dangerText, { color: c.danger }]}>Smazat lokální historii</Text>
                    </TouchableOpacity>
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
    header: { marginTop: 40, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: 'bold' },
    section: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    rowLabel: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '500' },
    miniInput: { fontSize: 16, fontWeight: '700', width: 60, textAlign: 'right' },
    input: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 16 },
    authRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
    authBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    authBtnSecondary: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    authBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    authBtnTextSecondary: { fontWeight: '600', fontSize: 16 },
    userStatus: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    userEmail: { fontSize: 16, fontWeight: '600' },
    syncBtn: { height: 50, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    syncBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    syncBtnSecondary: { height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    syncBtnTextSecondary: { fontWeight: '600', fontSize: 16 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 24 },
    logoutText: { fontWeight: '700', fontSize: 15 },
    dangerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    dangerText: { fontWeight: '600', fontSize: 15 },
});
