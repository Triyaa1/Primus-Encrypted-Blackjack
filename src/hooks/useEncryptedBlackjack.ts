import { useState, useCallback, useEffect } from 'react';
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWalletClient,
  useSwitchChain,
} from 'wagmi';
import { sepolia } from 'wagmi/chains';
import {
  encodeFunctionData,
  isAddress,
  decodeEventLog,
  type Address,
  type Hex,
} from 'viem';
import {
  ENCRYPTED_BLACKJACK_ABI,
  ENCRYPTED_BLACKJACK_BYTECODE,
} from '../contracts/encryptedBlackjackArtifact';
import {
  createShuffledDeck,
  calculateHandScore,
  resolveDealerDraws,
  type PlayingCard,
} from '../lib/blackjack';
import {
  requestWorkingGroupPublicKey,
  encryptHoleCardWithFHE,
  thresholdDecryptHoleCard,
  type ZkFHEPublicKeyBundle,
  type EncryptedHoleCardPayload,
  type ThresholdDecryptionResult,
} from '../lib/zkfheSimulation';

export type GamePhase =
  | 'IDLE'
  | 'ENCRYPTING'
  | 'PLAYER_TURN'
  | 'DEALER_REVEAL'
  | 'SETTLED';

export type HandOutcome =
  | 'PLAYER_WON'
  | 'DEALER_WON'
  | 'PLAYER_BUST'
  | 'DEALER_BUST'
  | 'PUSH'
  | null;

export interface OnChainGameStruct {
  gameId: bigint;
  player: Address;
  encryptedHoleCard: Hex;
  playerScore: number;
  dealerUpcard: number;
  isActive: boolean;
  isRevealed: boolean;
  dealerFinalScore: number;
  playerWon: boolean;
}

export interface ProtocolLogEntry {
  id: string;
  timestamp: string;
  phase: string;
  method: string;
  mode: 'SEPOLIA' | 'SANDBOX';
  txHash?: Hex;
  calldataPreview: Hex;
  summary: string;
}

const STORAGE_CONTRACT_KEY = 'primus_encrypted_blackjack_sepolia_address';
const SANDBOX_ZERO_PLAYER = '0x000000000000000000000000000000000000dEaD' as Address;

export function useEncryptedBlackjack() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  // Sepolia contract address persisted in localStorage
  const [contractAddress, setContractAddressState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(STORAGE_CONTRACT_KEY) || '';
  });

  // Execution mode: user can toggle between Sandbox & Sepolia when contract is configured
  const [preferSepolia, setPreferSepolia] = useState<boolean>(true);

  const isOnSepolia = isConnected && chainId === sepolia.id;
  const hasValidContract = isAddress(contractAddress);
  const isSepoliaReady = isOnSepolia && hasValidContract && preferSepolia;

  // Deployment & tx status
  const [isDeploying, setIsDeploying] = useState(false);
  const [pendingTxLabel, setPendingTxLabel] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onChainActiveGameId, setOnChainActiveGameId] = useState<bigint>(0n);

  // Blackjack game state
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  const [outcome, setOutcome] = useState<HandOutcome>(null);
  const [deck, setDeck] = useState<PlayingCard[]>(() => createShuffledDeck());
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerUpcard, setDealerUpcard] = useState<PlayingCard | null>(null);
  const [dealerHoleCard, setDealerHoleCard] = useState<PlayingCard | null>(null);
  const [dealerExtraCards, setDealerExtraCards] = useState<PlayingCard[]>([]);
  const [isHoleRevealed, setIsHoleRevealed] = useState(false);

  // zkFHE Simulation state
  const [pkBundle, setPkBundle] = useState<ZkFHEPublicKeyBundle | null>(null);
  const [encryptedHole, setEncryptedHole] =
    useState<EncryptedHoleCardPayload | null>(null);
  const [decryptionResult, setDecryptionResult] =
    useState<ThresholdDecryptionResult | null>(null);

  // Contract struct mirror + transaction ledger
  const [sandboxGameCounter, setSandboxGameCounter] = useState<bigint>(0n);
  const [contractGameStruct, setContractGameStruct] =
    useState<OnChainGameStruct | null>(null);
  const [protocolLogs, setProtocolLogs] = useState<ProtocolLogEntry[]>([]);

  const setContractAddress = useCallback((addr: string) => {
    const trimmed = addr.trim();
    setContractAddressState(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_CONTRACT_KEY, trimmed);
      } else {
        window.localStorage.removeItem(STORAGE_CONTRACT_KEY);
      }
    }
  }, []);

  const appendLog = useCallback((entry: Omit<ProtocolLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = now.toTimeString().slice(0, 8);
    setProtocolLogs((prev) => [
      {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp,
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  // Poll / refresh activeGame on Sepolia when connected + contract configured
  const refreshOnChainActiveGame = useCallback(async () => {
    if (!publicClient || !address || !isOnSepolia || !isAddress(contractAddress)) {
      setOnChainActiveGameId(0n);
      return;
    }
    try {
      const activeId = (await publicClient.readContract({
        address: contractAddress as Address,
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'activeGame',
        args: [address],
      })) as bigint;
      setOnChainActiveGameId(activeId);
    } catch {
      setOnChainActiveGameId(0n);
    }
  }, [publicClient, address, isOnSepolia, contractAddress]);

  useEffect(() => {
    refreshOnChainActiveGame();
  }, [refreshOnChainActiveGame]);

  const fetchOnChainGameStruct = useCallback(
    async (id: bigint): Promise<OnChainGameStruct | null> => {
      if (!publicClient || !isAddress(contractAddress) || id === 0n) return null;
      const result = (await publicClient.readContract({
        address: contractAddress as Address,
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'getGame',
        args: [id],
      })) as {
        player: Address;
        encryptedHoleCard: Hex;
        playerScore: number;
        dealerUpcard: number;
        isActive: boolean;
        isRevealed: boolean;
        dealerFinalScore: number;
        playerWon: boolean;
      };

      const struct: OnChainGameStruct = {
        gameId: id,
        player: result.player,
        encryptedHoleCard: result.encryptedHoleCard,
        playerScore: Number(result.playerScore),
        dealerUpcard: Number(result.dealerUpcard),
        isActive: result.isActive,
        isRevealed: result.isRevealed,
        dealerFinalScore: Number(result.dealerFinalScore),
        playerWon: result.playerWon,
      };
      setContractGameStruct(struct);
      return struct;
    },
    [publicClient, contractAddress]
  );

  /**
   * Switch MetaMask to Ethereum Sepolia
   */
  const switchToSepolia = useCallback(async () => {
    setErrorMessage(null);
    try {
      await switchChainAsync({ chainId: sepolia.id });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to switch network to Sepolia.'
      );
    }
  }, [switchChainAsync]);

  /**
   * Deploy EncryptedBlackjack.sol directly to Sepolia from connected MetaMask wallet
   */
  const deployContractToSepolia = useCallback(async () => {
    setErrorMessage(null);
    if (!walletClient || !publicClient || !address) {
      setErrorMessage('Connect MetaMask on Sepolia before deploying.');
      return;
    }
    if (chainId !== sepolia.id) {
      setErrorMessage('Switch MetaMask network to Sepolia (11155111) first.');
      return;
    }

    setIsDeploying(true);
    setPendingTxLabel('Confirm deployment in MetaMask...');
    try {
      const txHash = await walletClient.deployContract({
        abi: ENCRYPTED_BLACKJACK_ABI,
        bytecode: ENCRYPTED_BLACKJACK_BYTECODE,
        account: address,
        chain: sepolia,
      });

      setPendingTxLabel('Waiting for Sepolia block confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (receipt.contractAddress) {
        setContractAddress(receipt.contractAddress);
        setPreferSepolia(true);
        appendLog({
          phase: 'Deploy',
          method: 'constructor()',
          mode: 'SEPOLIA',
          txHash,
          calldataPreview: `0x${ENCRYPTED_BLACKJACK_BYTECODE.slice(2, 26)}...` as Hex,
          summary: `Deployed EncryptedBlackjack at ${receipt.contractAddress}`,
        });
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Contract deployment cancelled or failed.'
      );
    } finally {
      setIsDeploying(false);
      setPendingTxLabel(null);
    }
  }, [walletClient, publicClient, address, chainId, setContractAddress, appendLog]);

  /**
   * Clear an orphaned active game on-chain (if user refreshed mid-hand on Sepolia)
   */
  const settleOrphanedOnChainGame = useCallback(async () => {
    if (!walletClient || !publicClient || !address || !isAddress(contractAddress)) return;
    if (onChainActiveGameId === 0n) return;

    setErrorMessage(null);
    setPendingTxLabel('Settling previous on-chain game...');
    try {
      const txHash = await walletClient.writeContract({
        address: contractAddress as Address,
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'revealAndSettle',
        args: [onChainActiveGameId, 21],
        account: address,
        chain: sepolia,
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      setOnChainActiveGameId(0n);
      appendLog({
        phase: 'Reset',
        method: 'revealAndSettle',
        mode: 'SEPOLIA',
        txHash,
        calldataPreview: encodeFunctionData({
          abi: ENCRYPTED_BLACKJACK_ABI,
          functionName: 'revealAndSettle',
          args: [onChainActiveGameId, 21],
        }),
        summary: `Closed previous active game #${onChainActiveGameId.toString()}`,
      });
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to close active on-chain game.'
      );
    } finally {
      setPendingTxLabel(null);
    }
  }, [
    walletClient,
    publicClient,
    address,
    contractAddress,
    onChainActiveGameId,
    appendLog,
  ]);

  /**
   * STEP 1 & 2: Request Working Group PK, Encrypt Hole Card, and Start Game
   */
  const dealHand = useCallback(async () => {
    setErrorMessage(null);
    setOutcome(null);
    setDecryptionResult(null);
    setIsHoleRevealed(false);
    setDealerExtraCards([]);
    setPhase('ENCRYPTING');

    try {
      // 1. Ensure fresh deck if < 15 cards remain
      let currentDeck = deck.length < 15 ? createShuffledDeck() : [...deck];

      // Deal initial cards: Player 1, Dealer Hole (encrypted), Player 2, Dealer Upcard
      const pCard1 = currentDeck.shift()!;
      const dHole = currentDeck.shift()!;
      const pCard2 = currentDeck.shift()!;
      const dUp = currentDeck.shift()!;

      const initialPlayerHand = [pCard1, pCard2];
      const { score: playerInitialScore } = calculateHandScore(initialPlayerHand);

      // Step 1 (zkFHE): Request shared Public Key PK from working group
      const fetchedPk = await requestWorkingGroupPublicKey();
      setPkBundle(fetchedPk);

      // Step 2 (zkFHE): Encrypt dealer's hole card under PK
      const encryptedPayload = await encryptHoleCardWithFHE(dHole, fetchedPk);
      setEncryptedHole(encryptedPayload);

      const calldata = encodeFunctionData({
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'startGame',
        args: [
          encryptedPayload.ciphertextBytes,
          dUp.baseValue,
          playerInitialScore,
        ],
      });

      if (isSepoliaReady && walletClient && publicClient && address) {
        if (onChainActiveGameId !== 0n) {
          throw new Error(
            `Active game #${onChainActiveGameId.toString()} exists on-chain. Close it in Sepolia Setup first.`
          );
        }

        setPendingTxLabel('Confirm startGame() in MetaMask...');
        const txHash = await walletClient.writeContract({
          address: contractAddress as Address,
          abi: ENCRYPTED_BLACKJACK_ABI,
          functionName: 'startGame',
          args: [
            encryptedPayload.ciphertextBytes,
            dUp.baseValue,
            playerInitialScore,
          ],
          account: address,
          chain: sepolia,
        });

        setPendingTxLabel('Confirming startGame() on Sepolia...');
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        let newGameId = 0n;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ENCRYPTED_BLACKJACK_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === 'GameStarted') {
              newGameId = decoded.args.gameId;
              break;
            }
          } catch {
            // Ignore non-matching logs
          }
        }
        if (newGameId === 0n) {
          newGameId = (await publicClient.readContract({
            address: contractAddress as Address,
            abi: ENCRYPTED_BLACKJACK_ABI,
            functionName: 'activeGame',
            args: [address],
          })) as bigint;
        }

        setOnChainActiveGameId(newGameId);
        await fetchOnChainGameStruct(newGameId);

        appendLog({
          phase: '02. Encrypted Deal',
          method: 'startGame',
          mode: 'SEPOLIA',
          txHash,
          calldataPreview: calldata,
          summary: `Game #${newGameId.toString()} · Stored 64-byte encryptedHoleCard · Upcard ${dUp.rank}`,
        });
      } else {
        // Local Contract Sandbox execution
        const nextGameId = sandboxGameCounter + 1n;
        setSandboxGameCounter(nextGameId);
        setContractGameStruct({
          gameId: nextGameId,
          player: address ?? SANDBOX_ZERO_PLAYER,
          encryptedHoleCard: encryptedPayload.ciphertextBytes,
          playerScore: playerInitialScore,
          dealerUpcard: dUp.baseValue,
          isActive: true,
          isRevealed: false,
          dealerFinalScore: 0,
          playerWon: false,
        });

        appendLog({
          phase: '02. Encrypted Deal',
          method: 'startGame',
          mode: 'SANDBOX',
          calldataPreview: calldata,
          summary: `Sandbox Game #${nextGameId.toString()} · Stored 64-byte encryptedHoleCard · Upcard ${dUp.rank}`,
        });
      }

      setDeck(currentDeck);
      setPlayerHand(initialPlayerHand);
      setDealerHoleCard(dHole);
      setDealerUpcard(dUp);
      setPhase('PLAYER_TURN');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start game.');
      setPhase('IDLE');
    } finally {
      setPendingTxLabel(null);
    }
  }, [
    deck,
    isSepoliaReady,
    walletClient,
    publicClient,
    address,
    contractAddress,
    onChainActiveGameId,
    sandboxGameCounter,
    fetchOnChainGameStruct,
    appendLog,
  ]);

  /**
   * STEP 3: Player Hit — Draw card and updatePlayerScore on-chain
   */
  const hit = useCallback(async () => {
    if (phase !== 'PLAYER_TURN' || !contractGameStruct) return;
    setErrorMessage(null);

    try {
      const currentDeck = [...deck];
      if (currentDeck.length === 0) {
        throw new Error('Deck exhausted.');
      }

      const drawnCard = currentDeck.shift()!;
      const nextPlayerHand = [...playerHand, drawnCard];
      const { score: newScore } = calculateHandScore(nextPlayerHand);
      const isBust = newScore > 21;

      const calldata = encodeFunctionData({
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'updatePlayerScore',
        args: [contractGameStruct.gameId, newScore],
      });

      if (isSepoliaReady && walletClient && publicClient && address) {
        setPendingTxLabel('Confirm updatePlayerScore() in MetaMask...');
        const txHash = await walletClient.writeContract({
          address: contractAddress as Address,
          abi: ENCRYPTED_BLACKJACK_ABI,
          functionName: 'updatePlayerScore',
          args: [contractGameStruct.gameId, newScore],
          account: address,
          chain: sepolia,
        });

        setPendingTxLabel('Confirming draw on Sepolia...');
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        await fetchOnChainGameStruct(contractGameStruct.gameId);
        if (isBust) {
          setOnChainActiveGameId(0n);
        }

        appendLog({
          phase: '03. Player Turn',
          method: 'updatePlayerScore',
          mode: 'SEPOLIA',
          txHash,
          calldataPreview: calldata,
          summary: `Drew ${drawnCard.rank}${drawnCard.suit[0].toUpperCase()} · Score ${newScore}${isBust ? ' (BUST)' : ''}`,
        });
      } else {
        setContractGameStruct((prev) =>
          prev
            ? {
                ...prev,
                playerScore: newScore,
                isActive: !isBust,
                isRevealed: isBust,
                playerWon: false,
              }
            : null
        );
        appendLog({
          phase: '03. Player Turn',
          method: 'updatePlayerScore',
          mode: 'SANDBOX',
          calldataPreview: calldata,
          summary: `Drew ${drawnCard.rank} · Score ${newScore}${isBust ? ' (BUST)' : ''}`,
        });
      }

      setDeck(currentDeck);
      setPlayerHand(nextPlayerHand);

      if (isBust) {
        // Reveal hole card locally after bust so user can inspect the dealer's hand
        if (dealerHoleCard && encryptedHole) {
          const decrypted = await thresholdDecryptHoleCard(
            dealerHoleCard,
            encryptedHole
          );
          setDecryptionResult(decrypted);
        }
        setIsHoleRevealed(true);
        setOutcome('PLAYER_BUST');
        setPhase('SETTLED');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Hit transaction failed.');
    } finally {
      setPendingTxLabel(null);
    }
  }, [
    phase,
    contractGameStruct,
    deck,
    playerHand,
    isSepoliaReady,
    walletClient,
    publicClient,
    address,
    contractAddress,
    dealerHoleCard,
    encryptedHole,
    fetchOnChainGameStruct,
    appendLog,
  ]);

  /**
   * STEP 4: Stand & Threshold Decrypt Hole Card -> revealAndSettle on-chain
   */
  const standAndReveal = useCallback(async () => {
    if (
      phase !== 'PLAYER_TURN' ||
      !contractGameStruct ||
      !dealerHoleCard ||
      !dealerUpcard ||
      !encryptedHole
    ) {
      return;
    }

    setErrorMessage(null);
    setPhase('DEALER_REVEAL');

    try {
      // 1. Simulate Primus zkFHE Threshold Decryption by working group
      const decrypted = await thresholdDecryptHoleCard(dealerHoleCard, encryptedHole);
      setDecryptionResult(decrypted);
      setIsHoleRevealed(true);

      // 2. Compute dealer draws starting from [Upcard, Decrypted Hole Card]
      const { finalDealerHand, nextDeck, finalScore: dealerFinalScore } =
        resolveDealerDraws([dealerUpcard, decrypted.revealedCard], deck);

      const extraCards = finalDealerHand.slice(2);
      setDealerExtraCards(extraCards);
      setDeck(nextDeck);

      const { score: playerScore } = calculateHandScore(playerHand);

      const calldata = encodeFunctionData({
        abi: ENCRYPTED_BLACKJACK_ABI,
        functionName: 'revealAndSettle',
        args: [contractGameStruct.gameId, dealerFinalScore],
      });

      if (isSepoliaReady && walletClient && publicClient && address) {
        setPendingTxLabel('Confirm revealAndSettle() in MetaMask...');
        const txHash = await walletClient.writeContract({
          address: contractAddress as Address,
          abi: ENCRYPTED_BLACKJACK_ABI,
          functionName: 'revealAndSettle',
          args: [contractGameStruct.gameId, dealerFinalScore],
          account: address,
          chain: sepolia,
        });

        setPendingTxLabel('Confirming settlement on Sepolia...');
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        await fetchOnChainGameStruct(contractGameStruct.gameId);
        setOnChainActiveGameId(0n);

        appendLog({
          phase: '04. Threshold Reveal',
          method: 'revealAndSettle',
          mode: 'SEPOLIA',
          txHash,
          calldataPreview: calldata,
          summary: `Revealed ${decrypted.revealedCard.rank} · Dealer ${dealerFinalScore} vs Player ${playerScore}`,
        });
      } else {
        const contractPlayerWon =
          dealerFinalScore > 21 || playerScore > dealerFinalScore;
        setContractGameStruct((prev) =>
          prev
            ? {
                ...prev,
                isActive: false,
                isRevealed: true,
                dealerFinalScore,
                playerWon: contractPlayerWon,
              }
            : null
        );
        appendLog({
          phase: '04. Threshold Reveal',
          method: 'revealAndSettle',
          mode: 'SANDBOX',
          calldataPreview: calldata,
          summary: `Revealed ${decrypted.revealedCard.rank} · Dealer ${dealerFinalScore} vs Player ${playerScore}`,
        });
      }

      if (dealerFinalScore > 21) {
        setOutcome('DEALER_BUST');
      } else if (playerScore > dealerFinalScore) {
        setOutcome('PLAYER_WON');
      } else if (playerScore === dealerFinalScore) {
        setOutcome('PUSH');
      } else {
        setOutcome('DEALER_WON');
      }

      setPhase('SETTLED');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Reveal & settle transaction failed.'
      );
      setPhase('PLAYER_TURN');
    } finally {
      setPendingTxLabel(null);
    }
  }, [
    phase,
    contractGameStruct,
    dealerHoleCard,
    dealerUpcard,
    encryptedHole,
    deck,
    playerHand,
    isSepoliaReady,
    walletClient,
    publicClient,
    address,
    contractAddress,
    fetchOnChainGameStruct,
    appendLog,
  ]);

  const playerScoreInfo = calculateHandScore(playerHand);
  const revealedDealerCards =
    dealerUpcard && dealerHoleCard
      ? isHoleRevealed
        ? [dealerUpcard, dealerHoleCard, ...dealerExtraCards]
        : [dealerUpcard]
      : [];
  const dealerVisibleScoreInfo = calculateHandScore(revealedDealerCards);

  return {
    // Wallet & Network
    address,
    isConnected,
    chainId,
    isOnSepolia,
    isSwitchingChain,
    switchToSepolia,

    // Contract setup
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

    // Game State
    phase,
    outcome,
    deckRemaining: deck.length,
    playerHand,
    playerScore: playerScoreInfo.score,
    playerIsSoft: playerScoreInfo.isSoft,
    dealerUpcard,
    dealerHoleCard,
    dealerExtraCards,
    isHoleRevealed,
    dealerVisibleScore: dealerVisibleScoreInfo.score,

    // zkFHE & Contract Inspector
    pkBundle,
    encryptedHole,
    decryptionResult,
    contractGameStruct,
    protocolLogs,

    // UI Status
    pendingTxLabel,
    errorMessage,
    clearError: () => setErrorMessage(null),

    // Actions
    dealHand,
    hit,
    standAndReveal,
  };
}
