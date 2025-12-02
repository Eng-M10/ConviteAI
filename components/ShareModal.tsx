import React, { useState } from 'react';
import { X, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = "Confira este convite especial que criei!";
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-4 text-white">Compartilhar Convite</h2>
        <p className="text-slate-400 text-sm mb-6">
          Copie o link abaixo ou compartilhe diretamente nas redes sociais. 
          <span className="block text-xs mt-2 text-yellow-500/80 bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            Nota: Imagens personalizadas carregadas do seu dispositivo não são salvas no link.
          </span>
        </p>

        {/* Copy Link Section */}
        <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-lg p-2 mb-6 focus-within:border-purple-500/50 transition-colors">
          <input 
            type="text" 
            readOnly 
            value={url} 
            className="bg-transparent flex-1 text-sm text-slate-300 outline-none px-2 font-mono"
            onClick={(e) => e.currentTarget.select()}
          />
          <button 
            onClick={handleCopy}
            className={`p-2 rounded-md transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            title="Copiar Link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
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