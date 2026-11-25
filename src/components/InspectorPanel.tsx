import { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Rocket,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { isAddress } from 'viem';
import { SEPOLIA_EXPLORER_BASE } from '../lib/wagmiConfig';
import type {
  ZkFHEPublicKeyBundle,
  EncryptedHoleCardPayload,
  ThresholdDecryptionResult,
} from '../lib/zkfheSimulation';
import type {
  OnChainGameStruct,
  ProtocolLogEntry,
} from '../hooks/useEncryptedBlackjack';

interface InspectorPanelProps {
  isConnected: boolean;
  isOnSepolia: boolean;
  isSwitchingChain: boolean;
  switchToSepolia: () => Promise<void>;
  contractAddress: string;
  setContractAddress: (addr: string) => void;
  hasValidContract: boolean;
  preferSepolia: boolean;
  setPreferSepolia: (val: boolean) => void;
  isSepoliaReady: boolean;
  isDeploying: boolean;
  deployContractToSepolia: () => Promise<void>;
  onChainActiveGameId: bigint;
  settleOrphanedOnChainGame: () => Promise<void>;
  pkBundle: ZkFHEPublicKeyBundle | null;
  encryptedHole: EncryptedHoleCardPayload | null;
  decryptionResult: ThresholdDecryptionResult | null;
  contractGameStruct: OnChainGameStruct | null;
  protocolLogs: ProtocolLogEntry[];
}

type InspectorTab = 'zkfhe' | 'contract' | 'sepolia';

export function InspectorPanel({
  isConnected,
  isOnSepolia,
  isSwitchingChain,
  switchToSepolia,
  contractAddress,
  setContractAddress,
  hasValidContract,
  preferSepolia,
  setPreferSepolia,
  isSepoliaReady,
  isDeploying,
  deployContractToSepolia,
  onChainActiveGameId,
  settleOrphanedOnChainGame,
  pkBundle,
  encryptedHole,
  decryptionResult,
  contractGameStruct,
  protocolLogs,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('zkfhe');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [addressDraft, setAddressDraft] = useState(contractAddress);

  const handleCopy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(label);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const applyManualAddress = () => {
    setContractAddress(addressDraft.trim());
  };

  return (
    <aside className="flex flex-col border border-[#E0DCD6] bg-white rounded-[4px] h-full">
      {/* Segmented Control Header */}
      <div className="border-b border-[#E0DCD6] p-3 bg-[#FAF8F5]">
        <div
          role="tablist"
          aria-label="Protocol and Contract Inspector"
          className="grid grid-cols-3 gap-1 bg-[#E0DCD6]/50 p-1 rounded-[4px]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'zkfhe'}
            onClick={() => setActiveTab('zkfhe')}
            className={`px-2.5 py-2 text-xs font-semibold rounded-[3px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF6B2C] ${
              activeTab === 'zkfhe'
                ? 'bg-white text-[#1A1A1A] border border-[#E0DCD6]'
                : 'text-[#8A8580] hover:text-[#1A1A1A]'
            }`}
          >
            zkFHE State
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'contract'}
            onClick={() => setActiveTab('contract')}
            className={`px-2.5 py-2 text-xs font-semibold rounded-[3px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF6B2C] ${
              activeTab === 'contract'
                ? 'bg-white text-[#1A1A1A] border border-[#E0DCD6]'
                : 'text-[#8A8580] hover:text-[#1A1A1A]'
            }`}
          >
            Contract Struct
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sepolia'}
            onClick={() => setActiveTab('sepolia')}
            className={`px-2.5 py-2 text-xs font-semibold rounded-[3px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FF6B2C] ${
              activeTab === 'sepolia'
                ? 'bg-white text-[#1A1A1A] border border-[#E0DCD6]'
                : 'text-[#8A8580] hover:text-[#1A1A1A]'
            }`}
          >
            Sepolia Setup
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto max-h-[640px]">
        {activeTab === 'zkfhe' && (
          <>
            {/* Simulation Notice */}
            <div className="border border-[#E0DCD6] bg-[#FAF8F5] p-3 rounded-[4px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Local zkFHE Simulation Active
                </span>
                <span className="font-mono text-[11px] text-[#FF6B2C] font-medium">
                  Research Preview
                </span>
              </div>
              <p className="mt-1 text-xs text-[#8A8580] leading-relaxed">
                Primus zkFHE currently exists as a Rust library without a public browser JS SDK.
                Encryption, PK generation, and threshold shares below are simulated in TypeScript
                and persisted on-chain as EVM <code className="font-mono text-[#1A1A1A]">bytes</code>.
              </p>
            </div>

            {/* Working Group Public Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  01. Working Group Public Key (PK)
                </span>
                {pkBundle && (
                  <button
                    type="button"
                    onClick={() => handleCopy('pk', pkBundle.publicKeyHex)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A8580] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {copiedKey === 'pk' ? (
                      <>
                        <Check className="h-3 w-3 text-[#3D8C5C]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              {pkBundle ? (
                <div className="border border-[#E0DCD6] bg-[#FAF8F5] p-2.5 rounded-[4px] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#8A8580]">
                    <span>{pkBundle.thresholdConfig}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Epoch #{pkBundle.epoch}</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#1A1A1A] break-all leading-relaxed">
                    {pkBundle.publicKeyHex}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#E0DCD6] p-3 rounded-[4px] text-xs text-[#8A8580]">
                  Deal a hand to request PK from the simulated zkFHE working group.
                </div>
              )}
            </div>

            {/* Encrypted Hole Card Bytes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  02. Encrypted Hole Card Bytes
                </span>
                {encryptedHole && (
                  <button
                    type="button"
                    onClick={() => handleCopy('cipher', encryptedHole.ciphertextBytes)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A8580] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    {copiedKey === 'cipher' ? (
                      <>
                        <Check className="h-3 w-3 text-[#3D8C5C]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              {encryptedHole ? (
                <div className="border border-[#E0DCD6] bg-[#FAF8F5] p-2.5 rounded-[4px] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#8A8580]">
                    <span>Ciphertext + ZK Range Proof</span>
                    <span className="font-mono tabular-nums">64 bytes</span>
                  </div>
                  <div className="font-mono text-[11px] text-[#1A1A1A] break-all leading-relaxed">
                    {encryptedHole.ciphertextBytes}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#E0DCD6] p-3 rounded-[4px] text-xs text-[#8A8580]">
                  Waiting for deal. Hole card ciphertext will appear here once encrypted.
                </div>
              )}
            </div>

            {/* Threshold Decryption Shares */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1A1A1A] block">
                03. Threshold Decryption Shares (Reveal Phase)
              </span>
              {decryptionResult ? (
                <div className="border border-[#E0DCD6] bg-[#FAF8F5] p-2.5 rounded-[4px] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#3D8C5C] font-medium">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      3-of-5 Quorum Verified
                    </span>
                    <span className="font-mono tabular-nums">
                      {decryptionResult.decryptionDurationMs} ms
                    </span>
                  </div>
                  <div className="divide-y divide-[#E0DCD6] border-t border-[#E0DCD6] pt-1">
                    {decryptionResult.decryptionShares.map((share) => (
                      <div
                        key={share.nodeId}
                        className="py-1.5 flex items-center justify-between gap-2 text-[11px] font-mono"
                      >
                        <span className="text-[#1A1A1A] shrink-0">{share.nodeId}</span>
                        <span className="text-[#8A8580] truncate">{share.shareHex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#E0DCD6] p-3 rounded-[4px] text-xs text-[#8A8580]">
                  Threshold shares remain sealed until the player stands or busts.
                </div>
              )}
            </div>

            {/* Protocol Calldata / Tx Ledger */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1A1A1A] block">
                04. Calldata & Transaction Ledger
              </span>
              {protocolLogs.length > 0 ? (
                <div className="border border-[#E0DCD6] rounded-[4px] divide-y divide-[#E0DCD6]">
                  {protocolLogs.map((log) => (
                    <div key={log.id} className="p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-[#1A1A1A]">
                          {log.method}
                        </span>
                        <span className="font-mono text-[11px] text-[#8A8580] tabular-nums">
                          {log.mode} · {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8A8580]">{log.summary}</p>
                      <div className="flex items-center justify-between gap-2 pt-0.5">
                        <span className="font-mono text-[10px] text-[#8A8580] truncate">
                          data: {log.calldataPreview}
                        </span>
                        {log.txHash && (
                          <a
                            href={`${SEPOLIA_EXPLORER_BASE}/tx/${log.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-[11px] text-[#FF6B2C] hover:underline shrink-0"
                          >
                            Etherscan
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#E0DCD6] p-3 rounded-[4px] text-xs text-[#8A8580]">
                  No contract invocations recorded yet.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'contract' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#1A1A1A]">
                EncryptedBlackjack.Game Struct
              </span>
              <span className="font-mono text-[11px] text-[#8A8580]">
                {isSepoliaReady ? 'Sepolia Storage' : 'Sandbox Mirror'}
              </span>
            </div>

            {contractGameStruct ? (
              <div className="border border-[#E0DCD6] rounded-[4px] divide-y divide-[#E0DCD6] font-mono text-xs">
                <StructRow label="gameId" value={`#${contractGameStruct.gameId.toString()}`} />
                <StructRow label="player" value={contractGameStruct.player} truncate />
                <StructRow
                  label="encryptedHoleCard"
                  value={contractGameStruct.encryptedHoleCard}
                  truncate
                />
                <StructRow
                  label="playerScore"
                  value={String(contractGameStruct.playerScore)}
                />
                <StructRow
                  label="dealerUpcard"
                  value={String(contractGameStruct.dealerUpcard)}
                />
                <StructRow
                  label="isActive"
                  value={String(contractGameStruct.isActive)}
                  highlight={contractGameStruct.isActive ? 'orange' : 'muted'}
                />
                <StructRow
                  label="isRevealed"
                  value={String(contractGameStruct.isRevealed)}
                  highlight={contractGameStruct.isRevealed ? 'green' : 'muted'}
                />
                <StructRow
                  label="dealerFinalScore"
                  value={
                    contractGameStruct.isRevealed
                      ? String(contractGameStruct.dealerFinalScore)
                      : '0 (pending reveal)'
                  }
                />
                <StructRow
                  label="playerWon"
                  value={
                    contractGameStruct.isRevealed
                      ? String(contractGameStruct.playerWon)
                      : 'false (unsettled)'
                  }
                  highlight={
                    contractGameStruct.isRevealed
                      ? contractGameStruct.playerWon
                        ? 'green'
                        : 'red'
                      : 'muted'
                  }
                />
              </div>
            ) : (
              <div className="border border-dashed border-[#E0DCD6] p-4 rounded-[4px] text-xs text-[#8A8580]">
                No active or completed game struct yet. Click Deal Encrypted Hand on the table to
                invoke <code className="font-mono text-[#1A1A1A]">startGame()</code>.
              </div>
            )}
          </div>
        )}

        {activeTab === 'sepolia' && (
          <div className="space-y-4">
            {/* Execution Mode Toggle */}
            <div className="border border-[#E0DCD6] bg-[#FAF8F5] p-3 rounded-[4px] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Execution Mode
                </span>
                <span className="font-mono text-[11px] font-medium text-[#FF6B2C]">
                  {isSepoliaReady ? 'Sepolia On-Chain' : 'Local Sandbox'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreferSepolia(false)}
                  className={`py-2 px-3 text-xs font-semibold rounded-[4px] border transition-colors cursor-pointer whitespace-nowrap ${
                    !isSepoliaReady
                      ? 'bg-[#2D2D2D] text-[#FAF8F5] border-[#2D2D2D]'
                      : 'bg-white text-[#1A1A1A] border-[#E0DCD6] hover:bg-[#FAF8F5]'
                  }`}
                >
                  Local Sandbox
                </button>
                <button
                  type="button"
                  disabled={!isOnSepolia || !hasValidContract}
                  onClick={() => setPreferSepolia(true)}
                  className={`py-2 px-3 text-xs font-semibold rounded-[4px] border transition-colors whitespace-nowrap ${
                    isSepoliaReady
                      ? 'bg-[#FF6B2C] text-white border-[#FF6B2C]'
                      : 'bg-white text-[#1A1A1A] border-[#E0DCD6] hover:bg-[#FAF8F5] disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer'
                  }`}
                >
                  Sepolia On-Chain
                </button>
              </div>
              <p className="text-[11px] text-[#8A8580] leading-relaxed">
                Local Sandbox runs instant zero-gas contract simulations. Switch to Sepolia
                On-Chain after connecting MetaMask and configuring a contract address below.
              </p>
            </div>

            {/* Network & Wallet Check */}
            <div className="border border-[#E0DCD6] p-3 rounded-[4px] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#1A1A1A]">Sepolia Network (11155111)</span>
                <span
                  className={`font-mono text-[11px] font-medium ${
                    isOnSepolia ? 'text-[#3D8C5C]' : 'text-[#8A8580]'
                  }`}
                >
                  {!isConnected
                    ? 'Wallet Disconnected'
                    : isOnSepolia
                      ? 'Connected to Sepolia'
                      : 'Wrong Network'}
                </span>
              </div>
              {isConnected && !isOnSepolia && (
                <button
                  type="button"
                  onClick={switchToSepolia}
                  disabled={isSwitchingChain}
                  className="w-full py-2 px-3 text-xs font-semibold bg-[#2D2D2D] text-white rounded-[4px] hover:bg-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSwitchingChain ? 'Switching...' : 'Switch MetaMask to Sepolia'}
                </button>
              )}
            </div>

            {/* 1-Click Contract Deploy */}
            <div className="border border-[#E0DCD6] p-3 rounded-[4px] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1A1A1A]">
                  Deploy EncryptedBlackjack.sol
                </span>
                <span className="font-mono text-[11px] text-[#8A8580]">solc 0.8.20</span>
              </div>
              <p className="text-[11px] text-[#8A8580] leading-relaxed">
                Deploy a fresh instance of the <code className="font-mono text-[#1A1A1A]">EncryptedBlackjack</code> contract directly to Sepolia using your connected MetaMask wallet.
              </p>
              <button
                type="button"
                onClick={deployContractToSepolia}
                disabled={!isOnSepolia || isDeploying}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold bg-[#FF6B2C] text-white rounded-[4px] hover:bg-[#E85D20] transition-colors disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
                {isDeploying ? 'Deploying to Sepolia...' : 'Deploy Contract to Sepolia'}
              </button>
            </div>

            {/* Existing Contract Address Input */}
            <div className="border border-[#E0DCD6] p-3 rounded-[4px] space-y-2.5">
              <label
                htmlFor="sepolia-contract-address"
                className="block text-xs font-semibold text-[#1A1A1A]"
              >
                Or Use Existing Sepolia Contract Address
              </label>
              <div className="flex gap-2">
                <input
                  id="sepolia-contract-address"
                  type="text"
                  value={addressDraft}
                  onChange={(e) => setAddressDraft(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 min-w-0 px-2.5 py-2 text-xs font-mono border border-[#E0DCD6] rounded-[4px] bg-[#FAF8F5] text-[#1A1A1A] focus:outline-none focus:border-[#FF6B2C]"
                />
                <button
                  type="button"
                  onClick={applyManualAddress}
                  className="px-3 py-2 text-xs font-semibold bg-[#2D2D2D] text-white rounded-[4px] hover:bg-[#1A1A1A] transition-colors shrink-0 cursor-pointer"
                >
                  Save
                </button>
              </div>
              {contractAddress && !isAddress(contractAddress) && (
                <p className="text-[11px] text-[#C44B3C]">
                  Invalid Ethereum address format.
                </p>
              )}
              {hasValidContract && (
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="font-mono text-[#3D8C5C] truncate">
                    Active: {contractAddress}
                  </span>
                  <a
                    href={`${SEPOLIA_EXPLORER_BASE}/address/${contractAddress}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[#FF6B2C] hover:underline shrink-0 ml-2"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Active Game Recovery */}
            {isOnSepolia && hasValidContract && onChainActiveGameId !== 0n && (
              <div className="border border-[#C44B3C]/40 bg-[#C44B3C]/5 p-3 rounded-[4px] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C44B3C]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  Unsettled On-Chain Game #{onChainActiveGameId.toString()}
                </div>
                <p className="text-[11px] text-[#8A8580] leading-relaxed">
                  The contract restricts each wallet to one active game at a time. Settle this
                  previous session before dealing a new on-chain hand.
                </p>
                <button
                  type="button"
                  onClick={settleOrphanedOnChainGame}
                  className="w-full py-2 px-3 text-xs font-semibold bg-[#C44B3C] text-white rounded-[4px] hover:bg-[#A93E30] transition-colors cursor-pointer"
                >
                  Settle Game #{onChainActiveGameId.toString()} on Sepolia
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

function StructRow({
  label,
  value,
  truncate = false,
  highlight,
}: {
  label: string;
  value: string;
  truncate?: boolean;
  highlight?: 'orange' | 'green' | 'red' | 'muted';
}) {
  const valueColor =
    highlight === 'orange'
      ? 'text-[#FF6B2C] font-semibold'
      : highlight === 'green'
        ? 'text-[#3D8C5C] font-semibold'
        : highlight === 'red'
          ? 'text-[#C44B3C] font-semibold'
          : highlight === 'muted'
            ? 'text-[#8A8580]'
            : 'text-[#1A1A1A]';

  return (
    <div className="px-3 py-2 flex items-center justify-between gap-3">
      <span className="text-[#8A8580] shrink-0">{label}</span>
      <span
        className={`tabular-nums text-right ${valueColor} ${
          truncate ? 'truncate max-w-[200px]' : ''
        }`}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}
