import React, { useState, useRef, useEffect } from 'react';
import { Download, Share2, Image as ImageIcon, Layout, Type, MapPin, Calendar, User, Clock, PartyPopper, Users, List, ChevronLeft, ChevronRight, Palette, RotateCcw, Link as LinkIcon, Loader2 } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';
import { InvitationData, ThemeType } from './types';
import { PreviewCard } from './components/PreviewCard';
import { ShareModal } from './components/ShareModal';

const INITIAL_DATA: InvitationData = {
  title: "",
  host: "",
  date: "",
  time: "",
  location: "",
  description: "",
  theme: ThemeType.MODERN,
  guestName: "",
};

const FONT_OPTIONS = [
  { label: 'Padrão do Tema', value: '' },
  { label: 'Outfit (Moderno)', value: "'Outfit', sans-serif" },
  { label: 'Montserrat (Neutro)', value: "'Montserrat', sans-serif" },
  { label: 'Playfair (Elegante)', value: "'Playfair Display', serif" },
  { label: 'Lora (Clássico)', value: "'Lora', serif" },
  { label: 'Dancing Script (Manuscrito)', value: "'Dancing Script', cursive" },
  { label: 'Great Vibes (Romântico)', value: "'Great Vibes', cursive" },
  { label: 'Pacifico (Divertido)', value: "'Pacifico', cursive" },
];

function App() {
  const [data, setData] = useState<InvitationData>(INITIAL_DATA);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Guest List Management
  const [guestMode, setGuestMode] = useState<'single' | 'list'>('single');
  const [guestListRaw, setGuestListRaw] = useState("");
  const [currentGuestIdx, setCurrentGuestIdx] = useState(0);

  // Load state from URL on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      try {
        // Safe decode for unicode characters
        const jsonString = decodeURIComponent(escape(window.atob(sharedData)));
        const decoded = JSON.parse(jsonString);
        setData(prev => ({ ...prev, ...decoded }));
      } catch (e) {
        console.error("Failed to parse shared data", e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guest List Logic
  const getGuests = () => guestListRaw.split('\n').filter(n => n.trim().length > 0);

  const handleGuestListChange = (val: string) => {
    setGuestListRaw(val);
    const newGuests = val.split('\n').filter(n => n.trim().length > 0);
    
    // If we have guests in the list, update the current view immediately to the current index or 0
    if (newGuests.length > 0) {
        const safeIndex = Math.min(currentGuestIdx, newGuests.length - 1);
        setCurrentGuestIdx(safeIndex);
        setData(prev => ({ ...prev, guestName: newGuests[safeIndex] }));
    } else {
        setData(prev => ({ ...prev, guestName: "" }));
    }
  };

  const navigateGuest = (direction: 'prev' | 'next') => {
    const guests = getGuests();
    if (guests.length === 0) return;
    
    let newIdx = direction === 'next' ? currentGuestIdx + 1 : currentGuestIdx - 1;
    // Loop around
    if (newIdx < 0) newIdx = guests.length - 1;
    if (newIdx >= guests.length) newIdx = 0;
    
    setCurrentGuestIdx(newIdx);
    setData(prev => ({ ...prev, guestName: guests[newIdx] }));
  };

  const generateShareUrl = (customSlug?: string) => {
    // Clone data to avoid mutating state
    const shareableData = { ...data };
    
    // 1. Handle backgroundImage: Remove if it's a large Data URL (Base64) or empty
    // We allow short external URLs if implemented in the future, but block base64 to prevent broken links
    if (!shareableData.backgroundImage || shareableData.backgroundImage.startsWith('data:')) {
      delete shareableData.backgroundImage;
    }

    // 2. Optimization: Remove all keys with empty strings or undefined values to reduce URL size
    Object.keys(shareableData).forEach(key => {
      const k = key as keyof InvitationData;
      if (shareableData[k] === "" || shareableData[k] === undefined || shareableData[k] === null) {
        delete shareableData[k];
      }
    });
    
    // Encode with support for unicode (emojis, accents)
    const jsonString = JSON.stringify(shareableData);
    const encoded = window.btoa(unescape(encodeURIComponent(jsonString)));
    
    const url = new URL(window.location.href);
    url.searchParams.set('data', encoded);
    
    // Add custom slug as a vanity parameter
    if (customSlug) {
        url.searchParams.set('slug', customSlug);
    } else {
        url.searchParams.delete('slug');
    }

    return url.toString();
  };

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    
    setIsDownloading(true);

    try {
        // Wait a moment for any potential font loading or render settlement
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(cardRef.current, {
            scale: 2, // High resolution (Retina)
            useCORS: true, // Attempt to handle external images
            backgroundColor: null, // Transparent bg where possible
            logging: false,
            // ignoreElements: (element) => element.classList.contains('no-print') // If we had elements to hide
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const filename = data.guestName 
            ? `convite-${data.guestName.toLowerCase().replace(/\s+/g, '-')}.png` 
            : `convite-${data.title.toLowerCase().replace(/\s+/g, '-') || 'evento'}.png`;
        
        link.href = image;
        link.download = filename;
        link.click();

    } catch (error) {
        console.error("Erro ao gerar imagem:", error);
        alert("Não foi possível gerar a imagem. Se você estiver usando uma imagem externa, ela pode ter restrições de segurança (CORS). Tente fazer upload do arquivo.");
    } finally {
        setIsDownloading(false);
    }
  };

  const resetCustomStyles = () => {
    setData(prev => ({
        ...prev,
        customTitleFont: undefined,
        customBodyFont: undefined,
        customTextColor: undefined,
        customBackgroundColor: undefined
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <PartyPopper size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Convite Digital</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
               onClick={() => setIsShareModalOpen(true)}
               className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
            >
              <Share2 size={16} />
              <span className="hidden md:inline">Compartilhar</span>
            </button>
            
            <button 
               onClick={handleDownloadImage}
               disabled={isDownloading}
               className="hidden md:flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isDownloading ? 'Gerando...' : 'Baixar Imagem'}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 lg:p-8 grid lg:grid-cols-12 gap-8 lg:h-[calc(100vh-4rem)]">
        
        {/* LEFT COLUMN: Editor */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Section: Manual Details */}
          <div className="space-y-4">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">Detalhes do Evento</h3>
            
            <div className="bg-slate-800/30 rounded-xl p-4 space-y-4 border border-white/5">
              <div className="flex gap-3 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                <Type size={18} className="text-slate-500" />
                <input
                  name="title"
                  placeholder="Título (ex: Festa do João)"
                  value={data.title}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600"
                />
              </div>

              <div className="flex gap-3 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                <User size={18} className="text-slate-500" />
                <input
                  name="host"
                  placeholder="Quem está convidando?"
                  value={data.host}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-2 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                  <Calendar size={18} className="text-slate-500" />
                  <input
                    type="date"
                    name="date"
                    value={data.date}
                    onChange={handleInputChange}
                    className="bg-transparent w-full outline-none text-sm text-slate-400 focus:text-white"
                  />
                </div>
                <div className="flex gap-2 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                  <Clock size={18} className="text-slate-500" />
                  <input
                    type="time"
                    name="time"
                    value={data.time}
                    onChange={handleInputChange}
                    className="bg-transparent w-full outline-none text-sm text-slate-400 focus:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                <MapPin size={18} className="text-slate-500" />
                <input
                  name="location"
                  placeholder="Local / Endereço"
                  value={data.location}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600"
                />
              </div>

               <div className="flex gap-3 items-start bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                <div className="pt-1"><Type size={18} className="text-slate-500" /></div>
                <textarea
                  name="description"
                  placeholder="Mensagem do convite"
                  value={data.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600 resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section: Guest Manager */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Convidados</h3>
                 <div className="flex bg-slate-800 rounded-lg p-0.5 border border-white/5">
                     <button 
                       onClick={() => { setGuestMode('single'); setData(prev => ({...prev, guestName: ""})) }}
                       className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${guestMode === 'single' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                     >
                        Individual
                     </button>
                     <button 
                       onClick={() => setGuestMode('list')}
                       className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${guestMode === 'list' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                     >
                        Lista
                     </button>
                 </div>
             </div>
             
             <div className="bg-slate-800/30 rounded-xl p-4 space-y-4 border border-white/5">
                {guestMode === 'single' ? (
                    <div className="flex gap-3 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                        <Users size={18} className="text-slate-500" />
                        <input
                        name="guestName"
                        placeholder="Nome do Convidado (Opcional)"
                        value={data.guestName}
                        onChange={handleInputChange}
                        className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600"
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex gap-3 items-start bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                            <div className="pt-1"><List size={18} className="text-slate-500" /></div>
                            <textarea
                                placeholder="Cole a lista de convidados aqui (um nome por linha)"
                                value={guestListRaw}
                                onChange={(e) => handleGuestListChange(e.target.value)}
                                rows={4}
                                className="bg-transparent w-full outline-none text-sm placeholder:text-slate-600 resize-none leading-relaxed"
                            />
                        </div>
                        
                        {getGuests().length > 0 && (
                            <div className="flex items-center justify-between bg-slate-900 rounded-lg p-2 border border-white/10">
                                <button 
                                  onClick={() => navigateGuest('prev')}
                                  className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-xs font-medium text-slate-300">
                                    Convidado {currentGuestIdx + 1} de {getGuests().length}
                                </span>
                                <button 
                                  onClick={() => navigateGuest('next')}
                                  className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-slate-500 text-center">
                           Navegue pela lista para baixar cada convite individualmente.
                        </p>
                    </div>
                )}
             </div>
          </div>

          {/* Section: Visuals */}
          <div className="space-y-4 pb-8">
             <div className="flex items-center justify-between px-1">
                 <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Estilo & Tema</h3>
                 {(data.customBackgroundColor || data.customTextColor || data.customTitleFont || data.customBodyFont) && (
                    <button 
                        onClick={resetCustomStyles}
                        className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 uppercase font-bold"
                    >
                        <RotateCcw size={10} /> Resetar
                    </button>
                 )}
             </div>
             
             <div className="bg-slate-800/30 rounded-xl p-4 border border-white/5 space-y-4">
                
                {/* Theme Buttons */}
                <div className="grid grid-cols-2 gap-3">
                   {Object.values(ThemeType).map((theme) => (
                     <button
                        key={theme}
                        onClick={() => setData(prev => ({ ...prev, theme }))}
                        className={`text-xs font-medium py-3 rounded-lg border transition-all duration-200 ${
                          data.theme === theme 
                          ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40' 
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/30'
                        }`}
                     >
                       {theme.charAt(0) + theme.slice(1).toLowerCase()}
                     </button>
                   ))}
                </div>

                {/* Customization Controls */}
                <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                        <Palette size={14} />
                        <span>PERSONALIZAÇÃO</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Cor do Fundo</label>
                            <div className="flex gap-2 items-center bg-slate-900/50 rounded-lg p-2 border border-white/5">
                                <input 
                                    type="color" 
                                    value={data.customBackgroundColor || "#ffffff"}
                                    onChange={(e) => setData(prev => ({...prev, customBackgroundColor: e.target.value}))}
                                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-xs text-slate-400 font-mono">{data.customBackgroundColor || 'Auto'}</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Cor do Texto</label>
                            <div className="flex gap-2 items-center bg-slate-900/50 rounded-lg p-2 border border-white/5">
                                <input 
                                    type="color" 
                                    value={data.customTextColor || "#000000"}
                                    onChange={(e) => setData(prev => ({...prev, customTextColor: e.target.value}))}
                                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                />
                                <span className="text-xs text-slate-400 font-mono">{data.customTextColor || 'Auto'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Fonte do Título</label>
                            <select 
                                value={data.customTitleFont || ''} 
                                onChange={(e) => setData(prev => ({...prev, customTitleFont: e.target.value}))}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                {FONT_OPTIONS.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] text-slate-400 uppercase font-bold">Fonte do Texto</label>
                            <select 
                                value={data.customBodyFont || ''} 
                                onChange={(e) => setData(prev => ({...prev, customBodyFont: e.target.value}))}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                {FONT_OPTIONS.map(opt => <option key={opt.label} value={opt.value}>{opt.label}</option>)}
                            </select>
                         </div>
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                  <div className="space-y-1">
                     <label className="text-[10px] text-slate-400 uppercase font-bold">Imagem de Fundo</label>
                     <div className="flex gap-2">
                        <label className="flex-1 flex items-center justify-center h-10 border border-dashed border-slate-700 bg-slate-800/50 rounded-lg hover:border-purple-500/50 hover:bg-slate-800 transition-all cursor-pointer group">
                            <div className="flex items-center gap-2 text-slate-400 group-hover:text-purple-400 text-xs font-medium">
                            <ImageIcon size={14} />
                            <span>Upload Arquivo</span>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                     </div>
                  </div>

                  <div className="flex gap-2 items-center bg-slate-900/50 rounded-lg px-3 py-2 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                     <LinkIcon size={14} className="text-slate-500 flex-shrink-0" />
                     <input 
                        type="text"
                        placeholder="Ou cole o link de uma imagem (https://...)"
                        value={data.backgroundImage?.startsWith('data:') ? '' : data.backgroundImage || ''}
                        onChange={(e) => setData(prev => ({...prev, backgroundImage: e.target.value}))}
                        className="bg-transparent w-full outline-none text-xs placeholder:text-slate-600"
                     />
                  </div>
                  
                  {data.backgroundImage && (
                    <button 
                      onClick={() => setData(prev => ({...prev, backgroundImage: undefined}))}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline w-full text-center flex items-center justify-center gap-1"
                    >
                      Remover imagem
                    </button>
                  )}
                </div>

             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-4 lg:p-12 flex items-center justify-center relative border border-white/5 shadow-2xl shadow-black/50 overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -right-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-[20%] -left-[20%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full transform transition-all duration-300 print:scale-100 scale-100 lg:scale-105">
                <PreviewCard data={data} cardRef={cardRef} />
            </div>

            <div className="absolute bottom-6 right-6 lg:hidden flex flex-col gap-3">
                 <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-slate-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-20 border border-white/10 active:scale-95 transition-transform"
                >
                  <Share2 size={24} />
                </button>
                 <button 
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  className="bg-white text-slate-900 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-20 active:scale-95 transition-transform disabled:opacity-70"
                >
                  {isDownloading ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                </button>
            </div>
        </div>
      </main>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        generateUrl={generateShareUrl} 
      />
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          main {
            display: block;
            height: auto;
            margin: 0;
            padding: 0;
          }
          .lg\\:col-span-7, .lg\\:col-span-7 * {
            visibility: visible;
          }
          .lg\\:col-span-7 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          /* Hide decorative background blobs in print */
          .pointer-events-none {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default App;