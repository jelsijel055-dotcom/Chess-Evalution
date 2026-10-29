import React, { useState } from 'react';
import { PlayerStats, SkinItem } from '../types/chess';
import { BOARD_SKINS, PIECE_SKINS, BATTLE_PASS_TIERS } from '../data/shopData';
import { soundManager } from '../utils/audio';
import {
  Coins,
  Gem,
  Crown,
  Tv,
  Check,
  Sparkles,
  ShoppingBag,
  Gift,
  Flame,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

interface ShopModalProps {
  stats: PlayerStats;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStats: (newStats: Partial<PlayerStats>) => void;
  onShowRewardedAd: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  stats,
  isOpen,
  onClose,
  onUpdateStats,
  onShowRewardedAd,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'pieces' | 'pass'>('boards');
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleBuySkin = (skin: SkinItem) => {
    if (stats.ownedSkins.includes(skin.id)) {
      // Equip directly
      if (skin.type === 'board') {
        onUpdateStats({ equippedBoardSkin: skin.id });
      } else {
        onUpdateStats({ equippedPieceSkin: skin.id });
      }
      soundManager.playClick();
      setPurchaseNotice(`Berhasil memasang ${skin.name}!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
      return;
    }

    // Purchase check
    if (skin.priceGold && stats.gold >= skin.priceGold) {
      soundManager.playCoinDing();
      const updatedSkins = [...stats.ownedSkins, skin.id];
      const newStats: Partial<PlayerStats> = {
        gold: stats.gold - skin.priceGold,
        ownedSkins: updatedSkins,
        ...(skin.type === 'board'
          ? { equippedBoardSkin: skin.id }
          : { equippedPieceSkin: skin.id }),
      };
      onUpdateStats(newStats);
      setPurchaseNotice(`Berhasil membeli dan memasang ${skin.name}!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
    } else if (skin.priceGems && stats.gems >= skin.priceGems) {
      soundManager.playCoinDing();
      const updatedSkins = [...stats.ownedSkins, skin.id];
      const newStats: Partial<PlayerStats> = {
        gems: stats.gems - skin.priceGems,
        ownedSkins: updatedSkins,
        ...(skin.type === 'board'
          ? { equippedBoardSkin: skin.id }
          : { equippedPieceSkin: skin.id }),
      };
      onUpdateStats(newStats);
      setPurchaseNotice(`Berhasil membuka item eksklusif ${skin.name}!`);
      setTimeout(() => setPurchaseNotice(null), 2500);
    } else {
      setPurchaseNotice('Koin Emas atau Permata tidak mencukupi!');
      setTimeout(() => setPurchaseNotice(null), 2500);
    }
  };

  const handleBuyVIPPass = () => {
    if (stats.isVipPass) return;
    if (stats.gems >= 300) {
      soundManager.playVictory();
      onUpdateStats({
        gems: stats.gems - 300,
        isVipPass: true,
        gold: stats.gold + 1000,
      });
      setPurchaseNotice('Selamat! Evolution Pass VIP Aktif! +1000 Emas Bonus!');
      setTimeout(() => setPurchaseNotice(null), 3000);
    } else {
      setPurchaseNotice('Butuh 300 Permata untuk membuka VIP Pass!');
      setTimeout(() => setPurchaseNotice(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-display">
                Armory & Toko Skin
              </h2>
              <p className="text-xs text-slate-400">
                Kustomisasi arena pertempuran dan tingkatkan prestisemu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Displays */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 font-mono tabular-nums">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {stats.gold.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-bold text-purple-300 font-mono tabular-nums">
                <Gem className="w-3.5 h-3.5 text-purple-400" />
                {stats.gems}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Rewarded Ad Banner (Iklan Opsional) */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-b border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-200 font-medium">
              Tonton Video Iklan Singkat untuk <strong className="text-amber-400">+250 Koin Emas</strong> & Putaran Bonus!
            </span>
          </div>
          <button
            onClick={onShowRewardedAd}
            className="px-3 py-1 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tonton Iklan
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-4 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('boards')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'boards'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Papan Catur ({BOARD_SKINS.length})
          </button>
          <button
            onClick={() => setActiveTab('pieces')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'pieces'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Set Bidak Robotik ({PIECE_SKINS.length})
          </button>
          <button
            onClick={() => setActiveTab('pass')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pass'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            Evolution Battle Pass
          </button>
        </div>

        {/* Notification Toast */}
        {purchaseNotice && (
          <div className="mx-4 mt-3 py-2 px-3 rounded-xl bg-cyan-950/80 border border-cyan-800 text-xs font-semibold text-cyan-300 text-center animate-fade-in">
            {purchaseNotice}
          </div>
        )}

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'boards' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BOARD_SKINS.map((skin) => {
                const isOwned = stats.ownedSkins.includes(skin.id);
                const isEquipped = stats.equippedBoardSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                      isEquipped
                        ? 'bg-slate-800/90 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    {/* Mini board preview */}
                    <div
                      className="w-full h-24 rounded-xl grid grid-cols-4 grid-rows-2 overflow-hidden mb-3 border"
                      style={{ borderColor: skin.colors?.border }}
                    >
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            backgroundColor:
                              i % 2 === 0 ? skin.colors?.light : skin.colors?.dark,
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {skin.name}
                        {skin.isPremium && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            VIP
                          </span>
                        )}
                      </h4>
                      {isEquipped && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                          Dipasang
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {skin.description}
                    </p>

                    <button
                      onClick={() => handleBuySkin(skin)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isEquipped
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : isOwned
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : skin.priceGold
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Sedang Aktif
                        </>
                      ) : isOwned ? (
                        'Pasang Skin'
                      ) : skin.priceGold ? (
                        <>
                          <Coins className="w-3.5 h-3.5" /> Beli {skin.priceGold.toLocaleString()} Koin
                        </>
                      ) : (
                        <>
                          <Gem className="w-3.5 h-3.5" /> Buka {skin.priceGems} Permata
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'pieces' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PIECE_SKINS.map((skin) => {
                const isOwned = stats.ownedSkins.includes(skin.id);
                const isEquipped = stats.equippedPieceSkin === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 ${
                      isEquipped
                        ? 'bg-slate-800/90 border-amber-400 ring-1 ring-amber-400/40 shadow-lg'
                        : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        {skin.name}
                        {skin.isPremium && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            VIP
                          </span>
                        )}
                      </h4>
                      {isEquipped && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                          Dipasang
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {skin.description}
                    </p>

                    <button
                      onClick={() => handleBuySkin(skin)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isEquipped
                          ? 'bg-slate-700 text-slate-400 cursor-default'
                          : isOwned
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : skin.priceGold
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Sedang Aktif
                        </>
                      ) : isOwned ? (
                        'Pasang Skin'
                      ) : skin.priceGold ? (
                        <>
                          <Coins className="w-3.5 h-3.5" /> Beli {skin.priceGold.toLocaleString()} Koin
                        </>
                      ) : (
                        <>
                          <Gem className="w-3.5 h-3.5" /> Buka {skin.priceGems} Permata
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'pass' && (
            <div className="space-y-4">
              {/* VIP Promotion Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-slate-100 text-sm">
                      Evolution Pass Musim 1: Cyber Genesis
                    </span>
                    {stats.isVipPass && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                        VIP AKTIF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Buka hadiah 2x lipat, skin eksklusif Ratu Mythic, dan +1000 Koin Emas instan!
                  </p>
                </div>

                {!stats.isVipPass ? (
                  <button
                    onClick={handleBuyVIPPass}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Gem className="w-4 h-4" /> Buka VIP Pass (300 Permata)
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" /> Akses Penuh Aktif
                  </div>
                )}
              </div>

              {/* Tier Track */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tingkat Perkembangan (Tingkat Saat Ini: {stats.passTier} · {stats.passXp} XP)
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {BATTLE_PASS_TIERS.map((tier) => {
                    const isUnlocked = stats.passTier >= tier.tier;

                    return (
                      <div
                        key={tier.tier}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isUnlocked
                            ? 'bg-slate-800/80 border-slate-700'
                            : 'bg-slate-900/40 border-slate-800/60 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                              isUnlocked
                                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            T{tier.tier}
                          </div>
                          <div>
                            <div className="text-xs text-slate-300">
                              Gratis: <span className="font-semibold">{tier.freeReward}</span>
                            </div>
                            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" />
                              VIP: {tier.vipReward}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isUnlocked ? (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Terklaim
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Butuh {tier.xpRequired} XP
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
