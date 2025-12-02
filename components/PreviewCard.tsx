import React from 'react';
import { InvitationData, ThemeType, ThemeConfig } from '../types';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

// Theme Configurations
const THEMES: Record<ThemeType, ThemeConfig> = {
    [ThemeType.MODERN]: {
        id: ThemeType.MODERN,
        label: 'Moderno',
        bgClass: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500',
        textClass: 'text-white',
        accentClass: 'bg-white/20 backdrop-blur-md border border-white/30',
        fontTitle: 'font-sans font-bold uppercase tracking-widest',
        fontBody: 'font-sans font-light',
    },
    [ThemeType.ELEGANT]: {
        id: ThemeType.ELEGANT,
        label: 'Elegante',
        bgClass: 'bg-[#FDFBF7]',
        textClass: 'text-slate-800',
        accentClass: 'border-2 border-slate-800',
        fontTitle: 'font-serif italic',
        fontBody: 'font-serif',
    },
    [ThemeType.FUN]: {
        id: ThemeType.FUN,
        label: 'Divertido',
        bgClass: 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-500',
        textClass: 'text-white drop-shadow-md',
        accentClass: 'bg-white text-orange-600 shadow-xl rounded-xl skew-y-1',
        fontTitle: 'font-sans font-black text-5xl',
        fontBody: 'font-sans font-bold',
    },
    [ThemeType.DARK]: {
        id: ThemeType.DARK,
        label: 'Dark Mode',
        bgClass: 'bg-slate-900',
        textClass: 'text-emerald-400',
        accentClass: 'border border-emerald-500/30 bg-emerald-900/10',
        fontTitle: 'font-sans tracking-tighter',
        fontBody: 'font-mono text-emerald-200',
    },
    [ThemeType.NATURE]: {
        id: ThemeType.NATURE,
        label: 'Natureza',
        bgClass: 'bg-[#E7F0DC]',
        textClass: 'text-[#557153]',
        accentClass: 'bg-white/60 shadow-sm rounded-tr-3xl rounded-bl-3xl',
        fontTitle: 'font-cursive text-5xl',
        fontBody: 'font-serif',
    }
};

interface PreviewCardProps {
    data: InvitationData;
    className?: string;
    cardRef?: React.RefObject<HTMLDivElement>;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ data, className = '', cardRef }) => {
    const theme = THEMES[data.theme];
    
    // Fallback for empty fields to maintain visual structure during editing
    const displayTitle = data.title || "Nome do Evento";
    const displayHost = data.host || "Anfitrião";
    const displayDate = data.date || "Data a definir";
    const displayTime = data.time || "Horário";
    const displayLocation = data.location || "Local do evento";
    const displayDesc = data.description || "Uma mensagem especial para seus convidados aparecerá aqui.";
    const displayGuest = data.guestName;

    // Resolve styles (custom overrides theme)
    const containerStyle: React.CSSProperties = {
        ...(data.backgroundImage ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
        ...(data.customBackgroundColor ? { background: data.customBackgroundColor } : {}),
        ...(data.customTextColor ? { color: data.customTextColor } : {}),
    };

    const titleStyle: React.CSSProperties = {
        ...(data.customTitleFont ? { fontFamily: data.customTitleFont } : {}),
    };

    const bodyStyle: React.CSSProperties = {
        ...(data.customBodyFont ? { fontFamily: data.customBodyFont } : {}),
    };

    // If custom colors are set, disable theme classes that would conflict
    const bgClass = data.customBackgroundColor ? '' : theme.bgClass;
    const textClass = data.customTextColor ? '' : theme.textClass;
    
    // For fonts, if custom is set, we still keep base classes for size/weight unless we want full reset.
    // Usually replacing just the font-family is enough, keeping the utility classes for layout.
    // However, theme.fontTitle includes 'font-sans' or 'font-serif'. 
    // If we set custom fontFamily, it overrides the Tailwind class font-family.
    
    return (
        <div 
            ref={cardRef}
            className={`relative w-full aspect-[4/5] max-w-md mx-auto overflow-hidden shadow-2xl transition-all duration-500 ease-in-out flex flex-col items-center justify-center p-8 ${bgClass} ${textClass} ${className}`}
            style={containerStyle}
        >
            {/* Optional Overlay for readability if bg image exists */}
            {data.backgroundImage && (
                <div className="absolute inset-0 bg-black/40 z-0"></div>
            )}

            <div className={`relative z-10 w-full h-full flex flex-col justify-between p-6 ${theme.accentClass}`}>
                
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <p className={`opacity-80 uppercase text-sm tracking-widest ${theme.fontBody}`} style={bodyStyle}>
                      Venha Celebrar 
                    </p>
                    <h1 className={`text-4xl md:text-5xl leading-tight mb-2 ${theme.fontTitle}`} style={titleStyle}>
                        {displayTitle}
                    </h1>
                    <div className="w-16 h-1 mx-auto bg-current opacity-40 rounded-full"></div>
                    <p className={`text-lg mt-2 ${theme.fontBody}`} style={bodyStyle}>
                         {displayHost}
                    </p>
                </div>

                {/* Body/Message Section */}
                <div className="flex-grow flex flex-col items-center justify-center py-6">
                    {displayGuest && (
                         <div className={`mb-4 text-center opacity-90 ${theme.fontTitle} text-2xl`} style={titleStyle}>
                            Olá, {displayGuest}
                        </div>
                    )}
                    <p className={`text-center text-lg md:text-xl leading-relaxed opacity-90 ${theme.fontBody}`} style={bodyStyle}>
                        "{displayDesc}"
                    </p>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2 opacity-90">
                        <Calendar size={18} />
                        <span className={`text-lg ${theme.fontBody}`} style={bodyStyle}>{displayDate}</span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 opacity-90">
                        <Clock size={18} />
                        <span className={`text-lg ${theme.fontBody}`} style={bodyStyle}>{displayTime}</span>
                    </div>

                    <div className="flex items-center justify-center space-x-2 opacity-90 text-center">
                        <MapPin size={18} className="flex-shrink-0" />
                        <span className={`text-lg ${theme.fontBody}`} style={bodyStyle}>{displayLocation}</span>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute top-2 right-2 opacity-20">
                    <Sparkles size={32} />
                </div>
                <div className="absolute bottom-2 left-2 opacity-20">
                    <Sparkles size={24} />
                </div>
            </div>
        </div>
    );
};