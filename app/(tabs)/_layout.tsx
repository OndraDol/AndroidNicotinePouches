import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useAppStore } from '../../src/store';

export default function TabLayout() {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const currentColors = Colors[theme || 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: currentColors.muted,
        tabBarStyle: {
          backgroundColor: currentColors.card,
          borderTopColor: currentColors.border,
        },
        headerStyle: {
          backgroundColor: currentColors.card,
        },
        headerTintColor: currentColors.text,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('today_usage', 'Today'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('history', 'History'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🕒</Text>,
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          title: t('achievements', 'Achievements'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings', 'Settings'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
