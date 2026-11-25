import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import {
  ENCRYPTED_BLACKJACK_ABI,
  ENCRYPTED_BLACKJACK_SOURCE,
} from '../contracts/encryptedBlackjackArtifact';

export function ArchitectureSection() {
  const [copiedSource, setCopiedSource] = useState(false);
  const [copiedAbi, setCopiedAbi] = useState(false);

  const handleCopySource = async () => {
    await navigator.clipboard.writeText(ENCRYPTED_BLACKJACK_SOURCE);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 1500);
  };

  const handleCopyAbi = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(ENCRYPTED_BLACKJACK_ABI, null, 2)
    );
    setCopiedAbi(true);
    setTimeout(() => setCopiedAbi(false), 1500);
  };

  return (
    <section className="space-y-10 pt-8 border-t border-[#E0DCD6]">
      {/* Protocol Flow Breakdown */}
      <div id="protocol" className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
              Primus zkFHE On-Chain Blackjack Architecture
            </h2>
            <p className="text-sm text-[#8A8580] leading-relaxed">
              Standard blockchains are completely transparent, making hidden-information card games
              impossible without trusted servers. Primus zkFHE solves this by keeping the dealer&apos;s
              hole card encrypted on-chain until settlement.
            </p>
          </div>
          <span className="font-mono text-xs text-[#8A8580] shrink-0">
            Simulation Boundary · TypeScript + Sepolia
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#E0DCD6] bg-white p-4 rounded-[4px] space-y-2">
            <span className="font-mono text-xs font-semibold text-[#FF6B2C]">01. Key Setup</span>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Working Group Public Key
            </h3>
            <p className="text-xs text-[#8A8580] leading-relaxed">
              The dApp requests a shared public key <code className="font-mono text-[#1A1A1A]">PK</code>{' '}
              from the Primus zkFHE committee. Secret key shares remain distributed across MPC nodes.
            </p>
          </div>

          <div className="border border-[#E0DCD6] bg-white p-4 rounded-[4px] space-y-2">
            <span className="font-mono text-xs font-semibold text-[#FF6B2C]">02. Deal Phase</span>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Encrypted Hole Card Deal
            </h3>
            <p className="text-xs text-[#8A8580] leading-relaxed">
              The dealer&apos;s hole card is encrypted under <code className="font-mono text-[#1A1A1A]">PK</code>{' '}
              with a zero-knowledge range proof and committed to Sepolia via{' '}
              <code className="font-mono text-[#1A1A1A]">startGame(bytes)</code>.
            </p>
          </div>

          <div className="border border-[#E0DCD6] bg-white p-4 rounded-[4px] space-y-2">
            <span className="font-mono text-xs font-semibold text-[#FF6B2C]">03. Play Phase</span>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Zero-Leakage Player Turns
            </h3>
            <p className="text-xs text-[#8A8580] leading-relaxed">
              Players draw cards via <code className="font-mono text-[#1A1A1A]">updatePlayerScore()</code>{' '}
              while viewing only the dealer&apos;s upcard. Neither contract storage nor calldata leaks
              the hole card.
            </p>
          </div>

          <div className="border border-[#E0DCD6] bg-white p-4 rounded-[4px] space-y-2">
            <span className="font-mono text-xs font-semibold text-[#FF6B2C]">04. Reveal Phase</span>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Threshold Decryption
            </h3>
            <p className="text-xs text-[#8A8580] leading-relaxed">
              Once the player stands, committee nodes produce partial decryption shares to reveal
              the hole card and settle the hand via{' '}
              <code className="font-mono text-[#1A1A1A]">revealAndSettle()</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Solidity Contract Source Viewer */}
      <div id="contract" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">
              Solidity Contract: EncryptedBlackjack.sol
            </h2>
            <p className="text-sm text-[#8A8580]">
              Stores the FHE-encrypted hole card as <code className="font-mono text-[#1A1A1A]">bytes</code>{' '}
              on Ethereum Sepolia (Solidity ^0.8.20).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyAbi}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-[#E0DCD6] bg-white text-[#1A1A1A] rounded-[4px] hover:bg-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedAbi ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#3D8C5C]" />
                  ABI Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy ABI
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopySource}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#2D2D2D] text-white rounded-[4px] hover:bg-[#1A1A1A] transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedSource ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#FF6B2C]" />
                  Source Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Solidity
                </>
              )}
            </button>
          </div>
        </div>

        <div className="border border-[#E0DCD6] bg-[#1A1A1A] text-[#F5F2ED] rounded-[4px] overflow-x-auto">
          <pre className="p-4 font-mono text-xs leading-relaxed">
            <code>{ENCRYPTED_BLACKJACK_SOURCE}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
