const DAY_MS = 1000 * 60 * 60 * 24;

export const getLocalISODate = (dateObj: Date | number | string = new Date()) => {
    const date = new Date(dateObj);
    if (Number.isNaN(date.getTime())) return '';
    const offset = date.getTimezoneOffset();
    const dateWithOffset = new Date(date.getTime() - (offset * 60 * 1000));
    return dateWithOffset.toISOString().split('T')[0];
};

export function getDynamicLimitForDate(settings: any, dateInput: Date | number | string = new Date()) {
    const baseLimit = Number(settings.dailyLimit) || 0;
    if (settings.goal !== 'quit') return baseLimit;

    const date = new Date(dateInput);
    const start = new Date(settings.createdAt || Date.now());
    const end = new Date(settings.targetDate || start);
    const strategy = settings.strategy || 'smooth';

    if (!isFinite(end.getTime())) return baseLimit;

    const totalDays = (end.getTime() - start.getTime()) / DAY_MS;
    const daysPassed = (date.getTime() - start.getTime()) / DAY_MS;

    if (!isFinite(totalDays) || totalDays <= 0) return baseLimit;
    if (daysPassed >= totalDays) return 0;
    if (daysPassed <= 0) return baseLimit;

    let calculated = baseLimit;
    if (strategy === 'smooth') {
        calculated = baseLimit - (daysPassed * (baseLimit / totalDays));
    } else if (strategy === 'weekly') {
        const weeksPassed = Math.floor(daysPassed / 7);
        calculated = baseLimit - weeksPassed;
    } else if (strategy === 'cutoff') {
        calculated = baseLimit;
    }

    return Math.max(0, Math.floor(calculated));
}

import { USER_BENCHMARKS as DEFAULT_BENCHMARKS } from '../constants/pouchDb';

export function calculateStats(history: any[], settings: any, benchmarks: any[] = DEFAULT_BENCHMARKS) {
    const USER_BENCHMARKS = benchmarks || DEFAULT_BENCHMARKS;

    const days: { [key: string]: number } = {};
    history.forEach(h => {
        const d = h.localDate || getLocalISODate(h.date);
        if (!d) return;
        days[d] = (days[d] || 0) + 1;
    });

    const limit = getDynamicLimitForDate(settings);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sunday = new Date(today);
    sunday.setDate(sunday.getDate() - sunday.getDay());
    const saturday = new Date(sunday);
    saturday.setDate(saturday.getDate() - 1);
    const saturdayLimit = getDynamicLimitForDate(settings, saturday);
    const sundayLimit = getDynamicLimitForDate(settings, sunday);
    const cleanWeekend = (days[getLocalISODate(saturday)] || 0) <= saturdayLimit && (days[getLocalISODate(sunday)] || 0) <= sundayLimit && history.length > 0;

    let streak = 0;
    let checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1);
    const firstLogDay = history.length ? (history[history.length - 1].localDate || getLocalISODate(history[history.length - 1].date)) : null;

    while (true) {
        const dStr = getLocalISODate(checkDate);
        if (history.length === 0) break;
        if (firstLogDay && dStr < firstLogDay && streak > 0) break;
        const dayLimit = getDynamicLimitForDate(settings, checkDate);
        if ((days[dStr] || 0) <= dayLimit) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    let savedTotal = 0;
    const unitPrice = settings.pouchesPerPack ? settings.packPrice / settings.pouchesPerPack : 0;
    const toDateFromLocalISO = (isoStr: string) => {
        const [year, month, day] = (isoStr || '').split('-').map(Number);
        return new Date(year || 0, (month || 1) - 1, day || 1);
    };

    Object.keys(days).forEach(d => {
        const dayLimit = getDynamicLimitForDate(settings, toDateFromLocalISO(d));
        if (days[d] < dayLimit) savedTotal += (dayLimit - days[d]) * unitPrice;
    });

    const yDate = new Date(today);
    yDate.setDate(yDate.getDate() - 1);
    const yesterdaySuccess = (days[getLocalISODate(yDate)] || 0) <= getDynamicLimitForDate(settings, yDate);
    const dailyAvg = history.length / (Object.keys(days).length || 1);
    const benchmark = USER_BENCHMARKS.find(b => dailyAvg <= b.max) || USER_BENCHMARKS[USER_BENCHMARKS.length - 1];

    return {
        streak,
        moneySaved: savedTotal,
        yesterdaySuccess,
        avgPerDay: dailyAvg,
        cleanWeekend,
        benchmark,
        dailyLimit: limit
    };
}
