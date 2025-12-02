import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Facebook, Twitter, MessageCircle, Link as LinkIcon, Loader2, AlertCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  generateUrl: (slug?: string) => string;
}

// Simulated list of taken slugs for validation demonstration
const TAKEN_SLUGS = ['admin', 'teste', 'convite', 'festa', 'app', 'login', 'signup'];

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, generateUrl }) => {
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  
  // Validation States
  const [status, setStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCurrentUrl(generateUrl());
      setSlug('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]); // Intentionally omitting generateUrl to prevent resets if parent re-renders

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/\s+/g, '-');
    setSlug(val);
    setStatus('idle');
    setErrorMsg('');
    setCurrentUrl(generateUrl()); // Reset to default URL while editing

    if (val && !/^[a-z0-9-]+$/.test(val)) {
        setStatus('invalid');
        setErrorMsg('Use apenas letras, números e hífens.');
    }
  };

  const validateAndApplySlug = async () => {
    if (!slug) return;
    if (status === 'invalid') return;

    setStatus('checking');

    // Simulate Network Request to check availability
    await new Promise(resolve => setTimeout(resolve, 800));

    if (TAKEN_SLUGS.includes(slug)) {
        setStatus('invalid');
        setErrorMsg('Este link personalizado já está em uso.');
    } else {
        setStatus('valid');
        setCurrentUrl(generateUrl(slug));
    }
  };

  const shareText = "Confira este convite especial que criei!";
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-white">Compartilhar Convite</h2>
        <p className="text-slate-400 text-sm mb-6">
          Personalize seu link e envie para seus convidados.
        </p>

        {/* Custom Slug Section */}
        <div className="mb-6 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon size={12} />
                Link Personalizado (Opcional)
            </label>
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 text-sm font-mono">
                        /
                    </div>
                    <input 
                        type="text" 
                        value={slug}
                        onChange={handleSlugChange}
                        placeholder="seu-evento-especial"
                        maxLength={30}
                        className={`w-full bg-slate-950 border rounded-lg py-2.5 pl-6 pr-10 text-sm text-white outline-none transition-all font-mono
                            ${status === 'invalid' ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500'}
                        `}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {status === 'checking' && <Loader2 size={16} className="text-purple-500 animate-spin" />}
                        {status === 'valid' && <Check size={16} className="text-green-500" />}
                        {status === 'invalid' && <AlertCircle size={16} className="text-red-500" />}
                    </div>
                </div>
                <button 
                    onClick={validateAndApplySlug}
                    disabled={!slug || status === 'checking' || status === 'valid'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                        ${!slug || status === 'checking' || status === 'valid'
                            ? 'bg-slate-800 text-slate-500 border-transparent cursor-not-allowed'
                            : 'bg-purple-600 text-white border-purple-500 hover:bg-purple-500'
                        }
                    `}
                >
                    Aplicar
                </button>
            </div>
            {errorMsg && (
                <p className="text-xs text-red-400 animate-in slide-in-from-top-1">{errorMsg}</p>
            )}
            {status === 'valid' && (
                <p className="text-xs text-green-400 animate-in slide-in-from-top-1">Link personalizado disponível e aplicado!</p>
            )}
        </div>

        {/* Copy Link Section */}
        <div className="space-y-2 mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Link de Compartilhamento
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-lg p-2 focus-within:border-purple-500/50 transition-colors">
            <input 
                type="text" 
                readOnly 
                value={currentUrl} 
                className="bg-transparent flex-1 text-sm text-slate-300 outline-none px-2 font-mono truncate"
                onClick={(e) => e.currentTarget.select()}
            />
            <button 
                onClick={handleCopy}
                className={`p-2 rounded-md transition-all flex-shrink-0 ${copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                title="Copiar Link"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
            </div>
             <p className="text-[10px] text-slate-500 mt-1">
                Nota: Imagens carregadas localmente não são salvas no link. Use URLs de imagem para compartilhamento.
            </p>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <a 
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors group"
          >
            <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">WhatsApp</span>
          </a>
          
          <a 
            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors group"
          >
            <Twitter size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">X (Twitter)</span>
          </a>

          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors group"
          >
            <Facebook size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium">Facebook</span>
          </a>
        </div>
      </div>
    </div>
  );
};