import { useState } from 'react';
import { WagmiProvider, useConnect, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from './lib/wagmiConfig';
import { useEncryptedBlackjack } from './hooks/useEncryptedBlackjack';
import { ProtocolStepper } from './components/ProtocolStepper';
import { BlackjackTable } from './components/BlackjackTable';
import { InspectorPanel } from './components/InspectorPanel';
import { ArchitectureSection } from './components/ArchitectureSection';

const queryClient = new QueryClient();

function BlackjackWorkbench() {
  const { connect, connectors, isPending: isConnecting, error: connectError } =
    useConnect();
  const { disconnect } = useDisconnect();
  const [walletNotice, setWalletNotice] = useState<string | null>(null);

  const game = useEncryptedBlackjack();

  const handleWalletClick = () => {
    setWalletNotice(null);
    if (game.isConnected) {
      disconnect();
      return;
    }

    const injectedConnector = connectors[0];
    if (!injectedConnector) {
      setWalletNotice('No injected wallet found. Install MetaMask or use Local Sandbox.');
      return;
    }

    if (typeof window !== 'undefined' && !(window as unknown as { ethereum?: unknown }).ethereum) {
      setWalletNotice('MetaMask extension not detected. You can continue using Local Sandbox mode.');
      return;
    }

    connect({ connector: injectedConnector });
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-[#E0DCD6] bg-[#FAF8F5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            className="text-base sm:text-lg font-bold tracking-tight text-[#1A1A1A] whitespace-nowrap shrink-0"
          >
            Primus Encrypted Blackjack
          </a>

          {/* Zone 2: Clean single-line text nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#8A8580]">
            <a
              href="#table"
              className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0"
            >
              Game Table
            </a>
            <a
              href="#protocol"
              className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0"
            >
              zkFHE Protocol
            </a>
            <a
              href="#contract"
              className="hover:text-[#1A1A1A] transition-colors whitespace-nowrap shrink-0"
            >
              Smart Contract
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleWalletClick}
              disabled={isConnecting}
              className={`px-4 py-2 text-xs font-semibold rounded-[4px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B2C] ${
                game.isConnected
                  ? 'bg-[#2D2D2D] text-[#FAF8F5] hover:bg-[#1A1A1A] font-mono'
                  : 'bg-[#FF6B2C] text-white hover:bg-[#E85D20]'
              }`}
            >
              {isConnecting
                ? 'Connecting...'
                : game.isConnected && game.address
                  ? `${formatAddress(game.address)} · Disconnect`
                  : 'Connect MetaMask'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        id="top"
        className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        {/* Wallet connection notice if MetaMask unavailable */}
        {(walletNotice || connectError) && (
          <div className="flex items-center justify-between gap-4 border border-[#E0DCD6] bg-white px-4 py-2.5 rounded-[4px] text-xs text-[#1A1A1A]">
            <span>{walletNotice || connectError?.message}</span>
            <button
              type="button"
              onClick={() => setWalletNotice(null)}
              className="font-mono text-[#8A8580] hover:text-[#1A1A1A] cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Editorial Protocol Intro */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8A8580]">
              <span className="font-semibold text-[#FF6B2C]">Primus Labs Architecture</span>
              <span aria-hidden="true">·</span>
              <span>Ethereum Sepolia</span>
              <span aria-hidden="true">·</span>
              <span>Simulated zkFHE TypeScript Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] text-balance">
              Encrypted Hole-Card On-Chain Blackjack
            </h1>
            <p className="text-sm text-[#8A8580] leading-relaxed">
              Demonstrates Primus&apos;s threshold zkFHE game flow: the dealer&apos;s hole card is
              encrypted under a shared working-group public key <code className="font-mono text-[#1A1A1A]">PK</code>,
              committed on-chain as <code className="font-mono text-[#1A1A1A]">bytes</code>, and
              threshold-decrypted only during the final reveal phase.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#8A8580] shrink-0">
            <span>
              Mode:{' '}
              <strong className="text-[#1A1A1A]">
                {game.isSepoliaReady ? 'Sepolia' : 'Sandbox'}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Chain:{' '}
              <strong className="text-[#1A1A1A]">
                {game.isConnected ? (game.isOnSepolia ? '11155111' : String(game.chainId)) : 'Local'}
              </strong>
            </span>
          </div>
        </div>

        {/* 4-Stage Live Protocol Stepper */}
        <ProtocolStepper
          phase={game.phase}
          hasPk={Boolean(game.pkBundle)}
          isHoleRevealed={game.isHoleRevealed}
        />

        {/* Primary 2-Column Workbench */}
        <div
          id="table"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          <div className="lg:col-span-7 flex flex-col">
            <BlackjackTable
              phase={game.phase}
              outcome={game.outcome}
              isSepoliaReady={game.isSepoliaReady}
              deckRemaining={game.deckRemaining}
              playerHand={game.playerHand}
              playerScore={game.playerScore}
              playerIsSoft={game.playerIsSoft}
              dealerUpcard={game.dealerUpcard}
              dealerHoleCard={game.dealerHoleCard}
              dealerExtraCards={game.dealerExtraCards}
              isHoleRevealed={game.isHoleRevealed}
              dealerVisibleScore={game.dealerVisibleScore}
              encryptedHole={game.encryptedHole}
              contractGameStruct={game.contractGameStruct}
              pendingTxLabel={game.pendingTxLabel}
              errorMessage={game.errorMessage}
              clearError={game.clearError}
              onDeal={game.dealHand}
              onHit={game.hit}
              onStand={game.standAndReveal}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <InspectorPanel
              isConnected={game.isConnected}
              isOnSepolia={game.isOnSepolia}
              isSwitchingChain={game.isSwitchingChain}
              switchToSepolia={game.switchToSepolia}
              contractAddress={game.contractAddress}
              setContractAddress={game.setContractAddress}
              hasValidContract={game.hasValidContract}
              preferSepolia={game.preferSepolia}
              setPreferSepolia={game.setPreferSepolia}
              isSepoliaReady={game.isSepoliaReady}
              isDeploying={game.isDeploying}
              deployContractToSepolia={game.deployContractToSepolia}
              onChainActiveGameId={game.onChainActiveGameId}
              settleOrphanedOnChainGame={game.settleOrphanedOnChainGame}
              pkBundle={game.pkBundle}
              encryptedHole={game.encryptedHole}
              decryptionResult={game.decryptionResult}
              contractGameStruct={game.contractGameStruct}
              protocolLogs={game.protocolLogs}
            />
          </div>
        </div>

        {/* Protocol Architecture & Solidity Source */}
        <ArchitectureSection />
      </main>

      {/* Minimal Institutional Footer */}
      <footer className="border-t border-[#E0DCD6] bg-[#FAF8F5] py-5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A8580]">
          <span>
            Primus Encrypted Blackjack · Simulated zkFHE Research Demo + Ethereum Sepolia
          </span>
          <span className="font-mono">
            Solidity ^0.8.20 · wagmi + viem
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BlackjackWorkbench />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
