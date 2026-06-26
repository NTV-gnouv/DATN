"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_FONTS = exports.THEME_TEMPLATES = exports.INDUSTRY_COLOR_PALETTES = void 0;
exports.getDefaultPaletteForIndustry = getDefaultPaletteForIndustry;
exports.getAlternativePalettes = getAlternativePalettes;
exports.INDUSTRY_COLOR_PALETTES = {
    technology: [
        {
            id: 'tech-modern',
            name: 'Modern Tech',
            industry: 'technology',
            colors: {
                primary: '#0066cc',
                secondary: '#00cc99',
                accent: '#ff6633',
                background: '#f0f4f8',
                text: '#1a202c',
                textLight: '#718096',
                border: '#cbd5e0',
            },
        },
        {
            id: 'tech-dark',
            name: 'Dark Tech',
            industry: 'technology',
            colors: {
                primary: '#4299e1',
                secondary: '#48bb78',
                accent: '#ed8936',
                background: '#1a202c',
                text: '#f7fafc',
                textLight: '#cbd5e0',
                border: '#4a5568',
            },
        },
    ],
    creative: [
        {
            id: 'creative-vibrant',
            name: 'Vibrant Creative',
            industry: 'creative',
            colors: {
                primary: '#d946ef',
                secondary: '#06b6d4',
                accent: '#f59e0b',
                background: '#fafafa',
                text: '#1f2937',
                textLight: '#6b7280',
                border: '#e5e7eb',
            },
        },
        {
            id: 'creative-minimal',
            name: 'Minimal Creative',
            industry: 'creative',
            colors: {
                primary: '#000000',
                secondary: '#666666',
                accent: '#ff0000',
                background: '#ffffff',
                text: '#000000',
                textLight: '#999999',
                border: '#e0e0e0',
            },
        },
    ],
    business: [
        {
            id: 'business-professional',
            name: 'Professional Business',
            industry: 'business',
            colors: {
                primary: '#003366',
                secondary: '#336699',
                accent: '#ffcc00',
                background: '#f5f5f5',
                text: '#333333',
                textLight: '#666666',
                border: '#cccccc',
            },
        },
        {
            id: 'business-modern',
            name: 'Modern Business',
            industry: 'business',
            colors: {
                primary: '#1e40af',
                secondary: '#7c3aed',
                accent: '#dc2626',
                background: '#f9fafb',
                text: '#111827',
                textLight: '#6b7280',
                border: '#e5e7eb',
            },
        },
    ],
    lifestyle: [
        {
            id: 'lifestyle-warm',
            name: 'Warm Lifestyle',
            industry: 'lifestyle',
            colors: {
                primary: '#ea580c',
                secondary: '#f97316',
                accent: '#fbbf24',
                background: '#fffbeb',
                text: '#78350f',
                textLight: '#b45309',
                border: '#fed7aa',
            },
        },
        {
            id: 'lifestyle-cool',
            name: 'Cool Lifestyle',
            industry: 'lifestyle',
            colors: {
                primary: '#0891b2',
                secondary: '#06b6d4',
                accent: '#14b8a6',
                background: '#ecf0f1',
                text: '#164e63',
                textLight: '#5eead4',
                border: '#cffafe',
            },
        },
    ],
    health: [
        {
            id: 'health-medical',
            name: 'Medical Health',
            industry: 'health',
            colors: {
                primary: '#dc2626',
                secondary: '#7c3aed',
                accent: '#f59e0b',
                background: '#f9fafb',
                text: '#1f2937',
                textLight: '#6b7280',
                border: '#e5e7eb',
            },
        },
        {
            id: 'health-wellness',
            name: 'Wellness Health',
            industry: 'health',
            colors: {
                primary: '#16a34a',
                secondary: '#10b981',
                accent: '#84cc16',
                background: '#f0fdf4',
                text: '#166534',
                textLight: '#4b5563',
                border: '#bbf7d0',
            },
        },
    ],
};
exports.THEME_TEMPLATES = [
    {
        id: 'template-professional',
        name: 'Professional',
        category: 'professional',
        description: 'Clean and professional design for business and corporate use',
        config: {
            name: 'Professional Theme',
            version: '1.0.0',
            isDefault: false,
            isActive: true,
            profileData: {
                username: '',
                displayName: '',
                description: '',
                industry: 'business',
                socialLinks: [],
            },
            theme: {
                colors: {
                    primary: '#003366',
                    secondary: '#336699',
                    accent: '#ffcc00',
                    background: '#ffffff',
                    text: '#333333',
                    textLight: '#666666',
                    border: '#cccccc',
                },
                typography: {
                    fontFamily: 'Inter, Segoe UI, sans-serif',
                    headingSize: 32,
                    bodySize: 16,
                    headingWeight: 700,
                    bodyWeight: 400,
                    lineHeight: 1.6,
                },
                layout: {
                    maxWidth: 1200,
                    padding: 24,
                    gap: 16,
                    alignment: 'center',
                },
                borders: {
                    radius: 8,
                    width: 1,
                    style: 'solid',
                    color: '#e0e0e0',
                },
                effects: {
                    shadowEnabled: true,
                    shadowIntensity: 'light',
                    transitionDuration: 300,
                    hoverScale: 1.02,
                },
                components: {
                    cardStyle: 'elevated',
                    buttonStyle: 'elevated',
                    avatarShape: 'circle',
                },
            },
        },
    },
    {
        id: 'template-creative',
        name: 'Creative',
        category: 'creative',
        description: 'Bold and vibrant design for creative professionals',
        config: {
            name: 'Creative Theme',
            version: '1.0.0',
            isDefault: false,
            isActive: true,
            profileData: {
                username: '',
                displayName: '',
                description: '',
                industry: 'creative',
                socialLinks: [],
            },
            theme: {
                colors: {
                    primary: '#d946ef',
                    secondary: '#06b6d4',
                    accent: '#f59e0b',
                    background: '#fafafa',
                    text: '#1f2937',
                    textLight: '#6b7280',
                    border: '#e5e7eb',
                },
                typography: {
                    fontFamily: 'Poppins, Inter, sans-serif',
                    headingSize: 40,
                    bodySize: 16,
                    headingWeight: 700,
                    bodyWeight: 500,
                    lineHeight: 1.5,
                },
                layout: {
                    maxWidth: 1000,
                    padding: 32,
                    gap: 20,
                    alignment: 'center',
                },
                borders: {
                    radius: 16,
                    width: 2,
                    style: 'solid',
                    color: '#d946ef',
                },
                effects: {
                    shadowEnabled: true,
                    shadowIntensity: 'medium',
                    transitionDuration: 400,
                    hoverScale: 1.05,
                    fadeInOnLoad: true,
                },
                components: {
                    cardStyle: 'outlined',
                    buttonStyle: 'outlined',
                    avatarShape: 'rounded',
                },
            },
        },
    },
    {
        id: 'template-minimal',
        name: 'Minimal',
        category: 'minimal',
        description: 'Simple and elegant minimalist design',
        config: {
            name: 'Minimal Theme',
            version: '1.0.0',
            isDefault: false,
            isActive: true,
            profileData: {
                username: '',
                displayName: '',
                description: '',
                industry: 'business',
                socialLinks: [],
            },
            theme: {
                colors: {
                    primary: '#000000',
                    secondary: '#666666',
                    accent: '#000000',
                    background: '#ffffff',
                    text: '#000000',
                    textLight: '#999999',
                    border: '#e0e0e0',
                },
                typography: {
                    fontFamily: 'Georgia, serif',
                    headingSize: 36,
                    bodySize: 16,
                    headingWeight: 400,
                    bodyWeight: 400,
                    lineHeight: 1.8,
                },
                layout: {
                    maxWidth: 800,
                    padding: 48,
                    gap: 24,
                    alignment: 'center',
                },
                borders: {
                    radius: 0,
                    width: 1,
                    style: 'solid',
                    color: '#000000',
                },
                effects: {
                    shadowEnabled: false,
                    shadowIntensity: 'light',
                    transitionDuration: 200,
                    hoverScale: 1,
                },
                components: {
                    cardStyle: 'flat',
                    buttonStyle: 'flat',
                    avatarShape: 'circle',
                },
            },
        },
    },
    {
        id: 'template-bold',
        name: 'Bold',
        category: 'bold',
        description: 'Strong and impactful design',
        config: {
            name: 'Bold Theme',
            version: '1.0.0',
            isDefault: false,
            isActive: true,
            profileData: {
                username: '',
                displayName: '',
                description: '',
                industry: 'creative',
                socialLinks: [],
            },
            theme: {
                colors: {
                    primary: '#ff0000',
                    secondary: '#000000',
                    accent: '#ffff00',
                    background: '#ffffff',
                    text: '#000000',
                    textLight: '#333333',
                    border: '#000000',
                },
                typography: {
                    fontFamily: 'Impact, sans-serif',
                    headingSize: 48,
                    bodySize: 18,
                    headingWeight: 900,
                    bodyWeight: 700,
                    lineHeight: 1.4,
                },
                layout: {
                    maxWidth: 1100,
                    padding: 32,
                    gap: 24,
                    alignment: 'center',
                },
                borders: {
                    radius: 4,
                    width: 3,
                    style: 'solid',
                    color: '#000000',
                },
                effects: {
                    shadowEnabled: true,
                    shadowIntensity: 'heavy',
                    transitionDuration: 500,
                    hoverScale: 1.1,
                },
                components: {
                    cardStyle: 'elevated',
                    buttonStyle: 'elevated',
                    avatarShape: 'square',
                },
            },
        },
    },
];
exports.AVAILABLE_FONTS = [
    { id: 'inter', name: 'Inter', family: 'Inter, sans-serif' },
    { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif' },
    { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif' },
    { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { id: 'lora', name: 'Lora', family: 'Lora, serif' },
    { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif' },
    { id: 'georgia', name: 'Georgia', family: 'Georgia, serif' },
    { id: 'times', name: 'Times New Roman', family: 'Times New Roman, serif' },
];
function getDefaultPaletteForIndustry(industry) {
    const palettes = exports.INDUSTRY_COLOR_PALETTES[industry.toLowerCase()] || exports.INDUSTRY_COLOR_PALETTES.business;
    return palettes[0];
}
function getAlternativePalettes(industry, exclude) {
    const palettes = exports.INDUSTRY_COLOR_PALETTES[industry.toLowerCase()] || exports.INDUSTRY_COLOR_PALETTES.business;
    return palettes.filter((p) => p.id !== exclude);
}
