import { Lock, Unlock } from 'lucide-react';
import { isRedSuit, SUIT_SYMBOLS, type PlayingCard } from '../lib/blackjack';

interface PlayingCardViewProps {
  card: PlayingCard | null;
  encrypted?: boolean;
  ciphertextPreview?: string;
  justDecrypted?: boolean;
}

export function PlayingCardView({
  card,
  encrypted = false,
  ciphertextPreview,
  justDecrypted = false,
}: PlayingCardViewProps) {
  if (encrypted) {
    const shortCipher = ciphertextPreview
      ? `${ciphertextPreview.slice(0, 8)}...${ciphertextPreview.slice(-4)}`
      : '0x0000...0000';

    return (
      <div
        aria-label="Encrypted Dealer Hole Card"
        className="relative flex h-36 w-24 sm:h-40 sm:w-28 flex-col justify-between rounded-[4px] border border-[#FF6B2C]/60 bg-[#2D2D2D] p-2.5 text-[#F5F2ED] transition-transform duration-200 select-none"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-medium tracking-tight text-[#FF6B2C]">
            zkFHE
          </span>
          <Lock className="h-3.5 w-3.5 text-[#FF6B2C]" strokeWidth={1.75} />
        </div>

        {/* Geometric lattice pattern */}
        <div className="my-auto flex flex-col items-center justify-center border border-[#44403C] bg-[#1F1F1F] py-3 px-1.5 rounded-[2px]">
          <span className="font-mono text-[11px] font-semibold tracking-tight text-[#F5F2ED]">
            HOLE CARD
          </span>
          <span className="mt-1 font-mono text-[10px] text-[#8A8580] tabular-nums">
            E_PK(val)
          </span>
        </div>

        <div className="truncate font-mono text-[10px] text-[#8A8580] tabular-nums">
          {shortCipher}
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex h-36 w-24 sm:h-40 sm:w-28 items-center justify-center rounded-[4px] border border-dashed border-[#F5F2ED]/25 bg-[#1E3A2F]/40">
        <span className="font-mono text-xs text-[#F5F2ED]/40">EMPTY</span>
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = SUIT_SYMBOLS[card.suit];
  const colorClass = red ? 'text-[#C44B3C]' : 'text-[#1A1A1A]';

  return (
    <div
      className={`relative flex h-36 w-24 sm:h-40 sm:w-28 flex-col justify-between rounded-[4px] border bg-[#F5F2ED] p-2.5 transition-transform duration-200 select-none ${
        justDecrypted ? 'border-[#FF6B2C]' : 'border-[#E0DCD6]'
      }`}
    >
      <div className={`flex items-start justify-between leading-none ${colorClass}`}>
        <div className="flex flex-col items-center">
          <span className="font-mono text-base sm:text-lg font-semibold tabular-nums">
            {card.rank}
          </span>
          <span className="text-sm leading-none mt-0.5">{symbol}</span>
        </div>
        {justDecrypted && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] font-medium text-[#FF6B2C]">
            <Unlock className="h-2.5 w-2.5" strokeWidth={1.75} />
            DEC
          </span>
        )}
      </div>

      <div className={`my-auto text-center text-3xl sm:text-4xl leading-none ${colorClass}`}>
        {symbol}
      </div>

      <div className={`flex items-end justify-between leading-none ${colorClass}`}>
        <span className="font-mono text-[10px] text-[#8A8580] tabular-nums">
          val:{card.baseValue}
        </span>
        <div className="flex flex-col items-center rotate-180">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {card.rank}
          </span>
        </div>
      </div>
    </div>
  );
}
