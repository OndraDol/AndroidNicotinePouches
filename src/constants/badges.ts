export const BADGES_DEF = [
    { id: 'b1', icon: '👶', key_en: 'First Step', key_cs: 'První krok', desc_en: 'Log first pouch', desc_cs: 'První záznam', condition: (settings: any, history: any[], stats: any) => history.length > 0 },
    { id: 'b2', icon: '🔥', key_en: 'Heating Up', key_cs: 'Zahříváme se', desc_en: '3 day streak', desc_cs: '3 dny v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 3 },
    { id: 'b3', icon: '🚀', key_en: 'On Fire', key_cs: 'V ráži', desc_en: '7 day streak', desc_cs: '7 dní v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 7 },
    { id: 'b4', icon: '⚔️', key_en: 'Warrior', key_cs: 'Bojovník', desc_en: '14 day streak', desc_cs: '14 dní v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 14 },
    { id: 'b5', icon: '💎', key_en: 'Diamond Will', key_cs: 'Diamantová vůle', desc_en: '30 day streak', desc_cs: '30 dní v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 30 },
    { id: 'b6', icon: '💰', key_en: 'Saver', key_cs: 'Spořič', desc_en: 'Save 500', desc_cs: 'Ušetři 500', condition: (settings: any, history: any[], stats: any) => stats.savedTotal >= 500 },
    { id: 'b7', icon: '🏦', key_en: 'Investor', key_cs: 'Investor', desc_en: 'Save 2000', desc_cs: 'Ušetři 2000', condition: (settings: any, history: any[], stats: any) => stats.savedTotal >= 2000 },
    { id: 'b8', icon: '🏖️', key_en: 'Weekend Hero', key_cs: 'Víkendový hrdina', desc_en: 'Clean weekend', desc_cs: 'Čistý víkend', condition: (settings: any, history: any[], stats: any) => stats.cleanWeekend },
    { id: 'b9', icon: '📉', key_en: 'Tapering', key_cs: 'Snižování', desc_en: 'Avg < 5', desc_cs: 'Průměr < 5', condition: (settings: any, history: any[], stats: any) => stats.dailyAvg > 0 && stats.dailyAvg < 5 },
    { id: 'b10', icon: '🎯', key_en: 'Discipline', key_cs: 'Disciplína', desc_en: 'Success yesterday', desc_cs: 'Úspěch včera', condition: (settings: any, history: any[], stats: any) => stats.yesterdaySuccess },
    { id: 'b11', icon: '🎩', key_en: 'Tycoon', key_cs: 'Magnát', desc_en: 'Save 5000', desc_cs: 'Ušetři 5000', condition: (settings: any, history: any[], stats: any) => stats.savedTotal >= 5000 },
    { id: 'b12', icon: '🗿', key_en: 'Titan', key_cs: 'Titán', desc_en: '60 day streak', desc_cs: '60 dní v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 60 },
    { id: 'b13', icon: '👑', key_en: 'Legend', key_cs: 'Legenda', desc_en: '90 day streak', desc_cs: '90 dní v řadě', condition: (settings: any, history: any[], stats: any) => stats.streak >= 90 },
    { id: 'b14', icon: '🪶', key_en: 'Lightweight', key_cs: 'Muší váha', desc_en: 'Avg < 3', desc_cs: 'Průměr < 3', condition: (settings: any, history: any[], stats: any) => stats.dailyAvg > 0 && stats.dailyAvg < 3 },
    { id: 'b15', icon: '📅', key_en: 'Dedicated', key_cs: 'Odhodlaný', desc_en: '50 entries', desc_cs: '50 záznamů', condition: (settings: any, history: any[], stats: any) => history.length >= 50 },
    { id: 'b16', icon: '🎖️', key_en: 'Veteran', key_cs: 'Veterán', desc_en: '100 entries', desc_cs: '100 záznamů', condition: (settings: any, history: any[], stats: any) => history.length >= 100 }
];

export const HEALTH_TIMELINE = [
    { minutes: 20, en: "Pulse & BP return to normal", cs: "Tep a tlak v normálu" },
    { minutes: 120, en: "Nicotine levels drop by 50%", cs: "Nikotin klesá o 50%" },
    { minutes: 480, en: "Oxygen levels normalize", cs: "Kyslík v normálu" },
    { minutes: 1440, en: "Nicotine out of system", cs: "Nikotin je z těla pryč" },
    { minutes: 2880, en: "Taste & smell improve", cs: "Chuť a čich se zlepšuje" },
    { minutes: 4320, en: "Breathing সুবিধálier", cs: "Dýchání je snazší" }
];
