import { Check } from 'lucide-react';
import type { GamePhase } from '../hooks/useEncryptedBlackjack';

interface ProtocolStepperProps {
  phase: GamePhase;
  hasPk: boolean;
  isHoleRevealed: boolean;
}

interface StepDef {
  num: string;
  label: string;
  detail: string;
}

const STEPS: StepDef[] = [
  { num: '01', label: 'Working Group PK', detail: 'Request shared FHE key' },
  { num: '02', label: 'Encrypted Deal', detail: 'Encrypt hole card on-chain' },
  { num: '03', label: 'Player Turn', detail: 'Hit / Stand with hidden hole' },
  { num: '04', label: 'Threshold Reveal', detail: 'Decrypt & settle on Sepolia' },
];

export function ProtocolStepper({
  phase,
  hasPk,
  isHoleRevealed,
}: ProtocolStepperProps) {
  const getStepStatus = (index: number): 'completed' | 'active' | 'pending' => {
    if (phase === 'IDLE') {
      if (index === 0 && hasPk) return 'completed';
      return index === 0 ? 'active' : 'pending';
    }
    if (phase === 'ENCRYPTING') {
      if (index === 0) return hasPk ? 'completed' : 'active';
      if (index === 1) return hasPk ? 'active' : 'pending';
      return 'pending';
    }
    if (phase === 'PLAYER_TURN') {
      if (index <= 1) return 'completed';
      if (index === 2) return 'active';
      return 'pending';
    }
    if (phase === 'DEALER_REVEAL') {
      if (index <= 2) return 'completed';
      return 'active';
    }
    // SETTLED
    if (isHoleRevealed) return 'completed';
    return index <= 2 ? 'completed' : 'active';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E0DCD6] bg-white rounded-[4px] divide-y sm:divide-y-0 sm:divide-x divide-[#E0DCD6]">
      {STEPS.map((step, idx) => {
        const status = getStepStatus(idx);
        return (
          <div
            key={step.num}
            className={`px-4 py-3 transition-colors duration-200 ${
              status === 'active' ? 'bg-[#FAF8F5]' : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`font-mono text-xs font-semibold tabular-nums ${
                    status === 'active'
                      ? 'text-[#FF6B2C]'
                      : status === 'completed'
                        ? 'text-[#3D8C5C]'
                        : 'text-[#8A8580]'
                  }`}
                >
                  {step.num}
                </span>
                <span className="text-sm font-semibold text-[#1A1A1A] truncate">
                  {step.label}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[11px] font-medium">
                {status === 'completed' ? (
                  <span className="inline-flex items-center gap-1 text-[#3D8C5C]">
                    <Check className="h-3.5 w-3.5" strokeWidth={2} />
                    Done
                  </span>
                ) : status === 'active' ? (
                  <span className="text-[#FF6B2C]">Active</span>
                ) : (
                  <span className="text-[#8A8580]">Queued</span>
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8A8580]">{step.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
