export enum ThemeType {
    MODERN = 'MODERN',
    ELEGANT = 'ELEGANT',
    FUN = 'FUN',
    DARK = 'DARK',
    NATURE = 'NATURE'
}

export interface InvitationData {
    title: string;
    host: string;
    date: string;
    time: string;
    location: string;
    description: string;
    theme: ThemeType;
    guestName?: string;
    backgroundImage?: string; // Data URL
    
    // Customization
    customTitleFont?: string;
    customBodyFont?: string;
    customTextColor?: string;
    customBackgroundColor?: string;
}

export interface ThemeConfig {
    id: ThemeType;
    label: string;
    bgClass: string;
    textClass: string;
    accentClass: string;
    fontTitle: string;
    fontBody: string;
}