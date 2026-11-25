// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EncryptedBlackjack {
    address public owner;
    uint256 public gameId;
    
    struct Game {
        address player;
        bytes encryptedHoleCard;
        uint8 playerScore;
        uint8 dealerUpcard;
        bool isActive;
        bool isRevealed;
        uint8 dealerFinalScore;
        bool playerWon;
    }
    
    mapping(uint256 => Game) public games;
    mapping(address => uint256) public activeGame;
    
    event GameStarted(uint256 indexed gameId, address indexed player, uint8 dealerUpcard);
    event CardDrawn(uint256 indexed gameId, uint8 newScore);
    event GameRevealed(uint256 indexed gameId, uint8 dealerFinalScore, bool playerWon);
    
    constructor() {
        owner = msg.sender;
    }
    
    function startGame(bytes calldata _encryptedHoleCard, uint8 _dealerUpcard, uint8 _playerInitialScore) external {
        require(activeGame[msg.sender] == 0, "Game already active");
        gameId++;
        games[gameId] = Game({
            player: msg.sender,
            encryptedHoleCard: _encryptedHoleCard,
            playerScore: _playerInitialScore,
            dealerUpcard: _dealerUpcard,
            isActive: true,
            isRevealed: false,
            dealerFinalScore: 0,
            playerWon: false
        });
        activeGame[msg.sender] = gameId;
        emit GameStarted(gameId, msg.sender, _dealerUpcard);
    }
    
    function updatePlayerScore(uint256 _gameId, uint8 _newScore) external {
        require(games[_gameId].player == msg.sender, "Not your game");
        require(games[_gameId].isActive, "Game not active");
        games[_gameId].playerScore = _newScore;
        emit CardDrawn(_gameId, _newScore);
        if (_newScore > 21) {
            games[_gameId].isActive = false;
            games[_gameId].isRevealed = true;
            games[_gameId].playerWon = false;
            activeGame[msg.sender] = 0;
        }
    }
    
    // In real zkFHE, this would trigger homomorphic decryption of the hole card
    // For this demo, the decrypted score is computed off-chain and submitted
    function revealAndSettle(uint256 _gameId, uint8 _dealerFinalScore) external {
        require(games[_gameId].player == msg.sender, "Not your game");
        require(games[_gameId].isActive, "Game not active");
        games[_gameId].isActive = false;
        games[_gameId].isRevealed = true;
        games[_gameId].dealerFinalScore = _dealerFinalScore;
        games[_gameId].playerWon = (_dealerFinalScore > 21 || games[_gameId].playerScore > _dealerFinalScore);
        activeGame[msg.sender] = 0;
        emit GameRevealed(_gameId, _dealerFinalScore, games[_gameId].playerWon);
    }
    
    function getGame(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }
}
