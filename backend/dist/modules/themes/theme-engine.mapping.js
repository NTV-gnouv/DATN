"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THEME_ENGINE_MAPPING = void 0;
exports.THEME_ENGINE_MAPPING = {
    palettes: {
        clean: {
            primary: '#1d4ed8',
            secondary: '#2563eb',
            accent: '#22c55e',
            background: '#f8fafc',
            text: '#0f172a',
            textLight: '#475569',
            border: '#cbd5e1',
        },
        vibrant: {
            primary: '#7c3aed',
            secondary: '#ec4899',
            accent: '#f59e0b',
            background: '#faf5ff',
            text: '#1f2937',
            textLight: '#6b7280',
            border: '#ddd6fe',
        },
        dark: {
            primary: '#60a5fa',
            secondary: '#38bdf8',
            accent: '#f472b6',
            background: '#0f172a',
            text: '#f8fafc',
            textLight: '#cbd5e1',
            border: '#334155',
        },
        warm: {
            primary: '#ea580c',
            secondary: '#f97316',
            accent: '#eab308',
            background: '#fff7ed',
            text: '#7c2d12',
            textLight: '#9a3412',
            border: '#fdba74',
        },
        pastel: {
            primary: '#6366f1',
            secondary: '#22d3ee',
            accent: '#f472b6',
            background: '#fdf4ff',
            text: '#312e81',
            textLight: '#6366f1',
            border: '#ddd6fe',
        },
    },
    background: {
        solid: { mode: 'solid', solid: null },
        gradient: { mode: 'gradient' },
        image: { mode: 'image' },
    },
    typography: {
        modern: { fontFamily: 'Inter', headingWeight: 700, bodyWeight: 400, headingSize: 34, bodySize: 16, lineHeight: 1.5 },
        editorial: { fontFamily: 'Playfair Display', headingWeight: 700, bodyWeight: 400, headingSize: 38, bodySize: 17, lineHeight: 1.6 },
        friendly: { fontFamily: 'Poppins', headingWeight: 700, bodyWeight: 500, headingSize: 34, bodySize: 16, lineHeight: 1.55 },
        minimal: { fontFamily: 'Noto Sans', headingWeight: 600, bodyWeight: 400, headingSize: 32, bodySize: 16, lineHeight: 1.6 },
        bold: { fontFamily: 'Montserrat', headingWeight: 800, bodyWeight: 500, headingSize: 40, bodySize: 17, lineHeight: 1.45 },
    },
    borders: {
        none: { width: 0, style: 'none', radius: 0 },
        soft: { width: 1, style: 'solid', radius: 14 },
        sharp: { width: 2, style: 'solid', radius: 4 },
    },
    shadows: {
        none: { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: 'rgba(15, 23, 42, 0)' },
        soft: { enabled: true, x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(15, 23, 42, 0.14)' },
        strong: { enabled: true, x: 0, y: 14, blur: 34, spread: 0, color: 'rgba(15, 23, 42, 0.28)' },
    },
    layout: {
        centered: { widthPercent: 100, alignment: 'center' },
        compact: { widthPercent: 92, alignment: 'center' },
        split: { widthPercent: 84, alignment: 'left' },
    },
};
