import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { Users, Globe, Copy, Check, Play, RefreshCw, X, Shield, Swords } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnlineMatch: (opponentName: string, opponentRating: number, roomCode?: string) => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  onStartOnlineMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'room'>('quick');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [roomCode, setRoomCode] = useState('EVO-7842');
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      interval = setInterval(() => {
        setSearchTimer((prev) => {
          if (prev >= 4) {
            // Found match!
            clearInterval(interval);
            setIsSearching(false);
            soundManager.playVictory();
            const opponents = [
              { name: 'KsatriaGaruda_ID', rating: 1540 },
              { name: 'CyberBishop99', rating: 1720 },
              { name: 'NovaQueen_Pro', rating: 1890 },
              { name: 'Vanguard_Jakarta', rating: 1480 },
            ];
            const chosen = opponents[Math.floor(Math.random() * opponents.length)];
            onStartOnlineMatch(chosen.name, chosen.rating);
            onClose();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching, onClose, onStartOnlineMatch]);

  if (!isOpen) return null;

  const handleStartSearch = () => {
    soundManager.playClick();
    setIsSearching(true);
    setSearchTimer(0);
  };

  const handleCancelSearch = () => {
    setIsSearching(false);
    setSearchTimer(0);
  };

  const handleCopyCode = () => {
    soundManager.playClick();
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = () => {
    if (inputCode.trim().length >= 4) {
      soundManager.playVictory();
      onStartOnlineMatch(`Pemain Room (${inputCode.toUpperCase()})`, 1600, inputCode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Multiplayer Online
              </h2>
              <p className="text-xs text-slate-400">
                Tantang pemain di seluruh dunia dalam pertempuran taktis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/60 p-2 gap-2">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'quick'
                ? 'bg-slate-800 text-cyan-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matchmaking Cepat (Ranked)
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'room'
                ? 'bg-slate-800 text-cyan-400 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Room Pribadi (Main Bareng Teman)
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {activeTab === 'quick' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto relative">
                <Swords className={`w-9 h-9 text-cyan-400 ${isSearching ? 'animate-bounce' : ''}`} />
                {isSearching && (
                  <div className="absolute inset-0 rounded-3xl border-2 border-cyan-400 animate-ping opacity-30" />
                )}
              </div>

              {isSearching ? (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-100 text-sm">
                    Mencari Lawan Seimbang... ({searchTimer}s)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mencari pemain dengan rating setara di server Asia Tenggara.
                  </p>
                  <button
                    onClick={handleCancelSearch}
                    className="mt-3 py-2 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Batalkan Pencarian
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">
                      Ranked Battle Evolution
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Waktu standar: 10 Menit per pemain. Menangkan game untuk meraih +25 Poin Ranking dan Koin Emas.
                    </p>
                  </div>

                  <button
                    onClick={handleStartSearch}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
                  >
                    <Swords className="w-4 h-4" /> Cari Lawan Sekarang
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'room' && (
            <div className="space-y-5">
              {/* Host Room Code */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-300">
                  Kode Room Anda (Host)
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 py-2 px-3 rounded-xl bg-slate-950 font-mono font-bold text-amber-400 text-center tracking-widest text-sm border border-slate-800">
                    {roomCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                    title="Salin Kode"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Bagikan kode ini kepada teman Anda untuk mulai bermain bersama.
                </p>
              </div>

              {/* Join Room */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <span className="text-xs font-bold text-slate-300">
                  Gabung ke Room Teman
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode (cth: EVO-1234)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-950 font-mono text-slate-100 text-sm border border-slate-800 focus:border-cyan-400 focus:outline-none uppercase"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={inputCode.trim().length < 4}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      inputCode.trim().length >= 4
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Masuk
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
