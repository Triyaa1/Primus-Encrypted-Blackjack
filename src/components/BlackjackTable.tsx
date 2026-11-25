import { Lock, ShieldAlert, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';
import { PlayingCardView } from './PlayingCardView';
import type { PlayingCard } from '../lib/blackjack';
import type {
  GamePhase,
  HandOutcome,
  OnChainGameStruct,
} from '../hooks/useEncryptedBlackjack';
import type { EncryptedHoleCardPayload } from '../lib/zkfheSimulation';

interface BlackjackTableProps {
  phase: GamePhase;
  outcome: HandOutcome;
  isSepoliaReady: boolean;
  deckRemaining: number;
  playerHand: PlayingCard[];
  playerScore: number;
  playerIsSoft: boolean;
  dealerUpcard: PlayingCard | null;
  dealerHoleCard: PlayingCard | null;
  dealerExtraCards: PlayingCard[];
  isHoleRevealed: boolean;
  dealerVisibleScore: number;
  encryptedHole: EncryptedHoleCardPayload | null;
  contractGameStruct: OnChainGameStruct | null;
  pendingTxLabel: string | null;
  errorMessage: string | null;
  clearError: () => void;
  onDeal: () => void;
  onHit: () => void;
  onStand: () => void;
}

export function BlackjackTable({
  phase,
  outcome,
  isSepoliaReady,
  deckRemaining,
  playerHand,
  playerScore,
  playerIsSoft,
  dealerUpcard,
  dealerHoleCard,
  dealerExtraCards,
  isHoleRevealed,
  dealerVisibleScore,
  encryptedHole,
  contractGameStruct,
  pendingTxLabel,
  errorMessage,
  clearError,
  onDeal,
  onHit,
  onStand,
}: BlackjackTableProps) {
  const isBusy =
    phase === 'ENCRYPTING' ||
    phase === 'DEALER_REVEAL' ||
    Boolean(pendingTxLabel);

  const renderOutcomeBanner = () => {
    if (!outcome || phase !== 'SETTLED') return null;

    if (outcome === 'PLAYER_WON' || outcome === 'DEALER_BUST') {
      return (
        <div className="flex items-center justify-between gap-3 bg-[#3D8C5C] text-[#F5F2ED] px-4 py-2.5 rounded-[4px]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">
              {outcome === 'DEALER_BUST'
                ? 'Dealer Busts — Player Wins'
                : 'Player Wins Hand'}
            </span>
          </div>
          <span className="font-mono text-xs tabular-nums">
            {playerScore} vs {dealerVisibleScore}
          </span>
        </div>
      );
    }

    if (outcome === 'PLAYER_BUST' || outcome === 'DEALER_WON') {
      return (
        <div className="flex items-center justify-between gap-3 bg-[#C44B3C] text-[#F5F2ED] px-4 py-2.5 rounded-[4px]">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="text-xs sm:text-sm font-semibold tracking-tight">
              {outcome === 'PLAYER_BUST'
                ? 'Player Bust — Score Exceeded 21'
                : 'Dealer Wins Hand'}
            </span>
          </div>
          <span className="font-mono text-xs tabular-nums">
            {playerScore} vs {dealerVisibleScore}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between gap-3 bg-[#2D2D2D] text-[#F5F2ED] px-4 py-2.5 rounded-[4px]">
        <div className="flex items-center gap-2">
          <MinusCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="text-xs sm:text-sm font-semibold tracking-tight">
            Push (Tie) — Contract evaluates playerWon = false
          </span>
        </div>
        <span className="font-mono text-xs tabular-nums">
          {playerScore} vs {dealerVisibleScore}
        </span>
      </div>
    );
  };

  return (
    <section
      aria-label="Blackjack Game Table"
      className="flex flex-col border border-[#E0DCD6] bg-white rounded-[4px] overflow-hidden"
    >
      {/* Top Table Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-[#E0DCD6] bg-[#FAF8F5] text-xs">
        <div className="flex items-center gap-2 text-[#8A8580]">
          <span className="font-semibold text-[#1A1A1A]">
            {isSepoliaReady ? 'Sepolia On-Chain' : 'Local Contract Sandbox'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {contractGameStruct
              ? `Game #${contractGameStruct.gameId.toString()}`
              : 'No Active Hand'}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">Deck: {deckRemaining}/52</span>
        </div>
        <span className="font-mono text-[11px] text-[#8A8580]">
          Dealer stands on 17
        </span>
      </div>

      {/* Deep Green Felt Surface */}
      <div className="flex-1 bg-[#1E3A2F] p-5 sm:p-7 flex flex-col justify-between gap-6 min-h-[480px]">
        {/* Dealer Hand Zone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#F5F2ED]">Dealer Hand</span>
              {!isHoleRevealed && dealerHoleCard && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF6B2C]">
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  Hole Card Encrypted
                </span>
              )}
            </div>
            <span className="font-mono text-sm font-semibold text-[#F5F2ED] tabular-nums">
              {dealerUpcard
                ? isHoleRevealed
                  ? `Score: ${dealerVisibleScore}`
                  : `Showing: ${dealerVisibleScore} + ?`
                : 'Score: —'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 min-h-[160px]">
            {dealerUpcard ? (
              <>
                <PlayingCardView card={dealerUpcard} />
                <PlayingCardView
                  card={dealerHoleCard}
                  encrypted={!isHoleRevealed}
                  ciphertextPreview={encryptedHole?.ciphertextBytes}
                  justDecrypted={isHoleRevealed}
                />
                {dealerExtraCards.map((card) => (
                  <PlayingCardView key={card.id} card={card} />
                ))}
              </>
            ) : (
              <>
                <PlayingCardView card={null} />
                <PlayingCardView card={null} />
              </>
            )}
          </div>
        </div>

        {/* Middle Divider & Status / Outcome Bar */}
        <div className="space-y-3">
          <div className="border-t border-[#F5F2ED]/15" />

          {errorMessage && (
            <div className="flex items-center justify-between gap-3 bg-[#C44B3C] text-[#F5F2ED] px-4 py-2.5 rounded-[4px] text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="font-mono underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {pendingTxLabel && (
            <div className="flex items-center justify-between gap-3 bg-[#2D2D2D] border border-[#FF6B2C]/50 text-[#F5F2ED] px-4 py-2.5 rounded-[4px] text-xs font-mono">
              <span>{pendingTxLabel}</span>
              <span className="text-[#FF6B2C]">Pending</span>
            </div>
          )}

          {renderOutcomeBanner()}

          {phase === 'IDLE' && !pendingTxLabel && !errorMessage && (
            <div className="text-xs text-[#F5F2ED]/75 font-mono">
              Ready: Deal a hand to generate working group PK and encrypt the dealer&apos;s hole card.
            </div>
          )}
        </div>

        {/* Player Hand Zone */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#F5F2ED]">Player Hand</span>
            <span className="font-mono text-sm font-semibold text-[#F5F2ED] tabular-nums">
              {playerHand.length > 0
                ? `Score: ${playerScore}${playerIsSoft ? ' (Soft)' : ''}`
                : 'Score: —'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 min-h-[160px]">
            {playerHand.length > 0 ? (
              playerHand.map((card) => <PlayingCardView key={card.id} card={card} />)
            ) : (
              <>
                <PlayingCardView card={null} />
                <PlayingCardView card={null} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-[#E0DCD6] bg-[#FAF8F5]">
        <div className="text-xs text-[#8A8580] font-mono">
          {phase === 'IDLE' && 'Phase 01 · Awaiting deal'}
          {phase === 'ENCRYPTING' && 'Phase 02 · Encrypting hole card with PK'}
          {phase === 'PLAYER_TURN' && 'Phase 03 · Choose Hit or Stand'}
          {phase === 'DEALER_REVEAL' && 'Phase 04 · Threshold decrypting hole card'}
          {phase === 'SETTLED' && 'Phase 04 · Hand settled'}
        </div>

        <div className="flex items-center gap-2.5">
          {(phase === 'IDLE' || phase === 'SETTLED') && (
            <button
              type="button"
              onClick={onDeal}
              disabled={isBusy}
              className="min-h-[40px] px-5 py-2 text-sm font-semibold bg-[#FF6B2C] text-white rounded-[4px] hover:bg-[#E85D20] active:bg-[#D45118] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B2C]"
            >
              {phase === 'SETTLED' ? 'Deal Next Hand' : 'Deal Encrypted Hand'}
            </button>
          )}

          {phase === 'ENCRYPTING' && (
            <button
              type="button"
              disabled
              className="min-h-[40px] px-5 py-2 text-sm font-semibold bg-[#FF6B2C] text-white rounded-[4px] opacity-60 cursor-not-allowed whitespace-nowrap shrink-0"
            >
              Encrypting Hole Card...
            </button>
          )}

          {phase === 'PLAYER_TURN' && (
            <>
              <button
                type="button"
                onClick={onHit}
                disabled={isBusy || playerScore >= 21}
                className="min-h-[40px] px-5 py-2 text-sm font-semibold bg-[#FF6B2C] text-white rounded-[4px] hover:bg-[#E85D20] active:bg-[#D45118] transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B2C]"
              >
                Hit
              </button>
              <button
                type="button"
                onClick={onStand}
                disabled={isBusy}
                className="min-h-[40px] px-5 py-2 text-sm font-semibold bg-[#2D2D2D] text-[#FAF8F5] rounded-[4px] hover:bg-[#1A1A1A] transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D2D2D]"
              >
                Stand &amp; Reveal
              </button>
            </>
          )}

          {phase === 'DEALER_REVEAL' && (
            <button
              type="button"
              disabled
              className="min-h-[40px] px-5 py-2 text-sm font-semibold bg-[#2D2D2D] text-[#FAF8F5] rounded-[4px] opacity-65 cursor-not-allowed whitespace-nowrap shrink-0"
            >
              Threshold Decrypting...
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
