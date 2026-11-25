// Auto-compiled from contracts/EncryptedBlackjack.sol using solc

export const ENCRYPTED_BLACKJACK_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "newScore",
        "type": "uint8"
      }
    ],
    "name": "CardDrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "dealerFinalScore",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "playerWon",
        "type": "bool"
      }
    ],
    "name": "GameRevealed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "dealerUpcard",
        "type": "uint8"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "activeGame",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gameId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "games",
    "outputs": [
      {
        "internalType": "address",
        "name": "player",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "encryptedHoleCard",
        "type": "bytes"
      },
      {
        "internalType": "uint8",
        "name": "playerScore",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "dealerUpcard",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "isRevealed",
        "type": "bool"
      },
      {
        "internalType": "uint8",
        "name": "dealerFinalScore",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "playerWon",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      }
    ],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "player",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "encryptedHoleCard",
            "type": "bytes"
          },
          {
            "internalType": "uint8",
            "name": "playerScore",
            "type": "uint8"
          },
          {
            "internalType": "uint8",
            "name": "dealerUpcard",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isActive",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isRevealed",
            "type": "bool"
          },
          {
            "internalType": "uint8",
            "name": "dealerFinalScore",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "playerWon",
            "type": "bool"
          }
        ],
        "internalType": "struct EncryptedBlackjack.Game",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_dealerFinalScore",
        "type": "uint8"
      }
    ],
    "name": "revealAndSettle",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_encryptedHoleCard",
        "type": "bytes"
      },
      {
        "internalType": "uint8",
        "name": "_dealerUpcard",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "_playerInitialScore",
        "type": "uint8"
      }
    ],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "_newScore",
        "type": "uint8"
      }
    ],
    "name": "updatePlayerScore",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const ENCRYPTED_BLACKJACK_BYTECODE = "0x6080604052348015600e575f5ffd5b505f80546001600160a01b03191633179055610cab8061002d5f395ff3fe608060405234801561000f575f5ffd5b5060043610610085575f3560e01c8063a83d3e8d11610058578063a83d3e8d14610118578063d7ae78b014610145578063d7c81b5514610158578063f764ef3d14610161575f5ffd5b8063117a5b90146100895780633717e8ce146100b95780638da5cb5b146100ce578063a2f77bcc146100f8575b5f5ffd5b61009c6100973660046108bc565b610174565b6040516100b0989796959493929190610901565b60405180910390f35b6100cc6100c7366004610977565b61025a565b005b5f546100e0906001600160a01b031681565b6040516001600160a01b0390911681526020016100b0565b61010b6101063660046108bc565b610486565b6040516100b09190610a04565b610137610126366004610a98565b60036020525f908152604090205481565b6040519081526020016100b0565b6100cc610153366004610ac5565b6105e4565b61013760015481565b6100cc61016f366004610ac5565b610777565b60026020525f9081526040902080546001820180546001600160a01b03909216929161019f90610aef565b80601f01602080910402602001604051908101604052809291908181526020018280546101cb90610aef565b80156102165780601f106101ed57610100808354040283529160200191610216565b820191905f5260205f20905b8154815290600101906020018083116101f957829003601f168201915b5050506002909301549192505060ff808216916101008104821691620100008204811691630100000081048216916401000000008204811691600160281b90041688565b335f90815260036020526040902054156102b15760405162461bcd60e51b815260206004820152601360248201527247616d6520616c72656164792061637469766560681b60448201526064015b60405180910390fd5b60018054905f6102c083610b27565b9190505550604051806101000160405280336001600160a01b0316815260200185858080601f0160208091040260200160405190810160405280939291908181526020018383808284375f92018290525093855250505060ff8481166020808501919091529086166040808501919091526001606085018190526080850184905260a0850184905260c09094018390528354835260028252909120835181546001600160a01b0319166001600160a01b0390911617815590830151909182019061038a9082610bb6565b50604082810151600290920180546060850151608086015160a087015160c088015160e0909801511515600160281b0265ff00000000001960ff998a16640100000000021665ffff000000001992151563010000000263ff0000001994151562010000029490941663ffff000019958b166101000261ffff199097169a9099169990991794909417929092169590951794909417939093169390931791909117909155600154335f818152600360205283902082905591517fe2d101f66b6ec6d14c197cf84489e89b515d0e6d4a77a448425f5025a63d18379061047890869060ff91909116815260200190565b60405180910390a350505050565b60408051610100810182525f8082526060602083018190529282018190529181018290526080810182905260a0810182905260c0810182905260e08101919091525f828152600260209081526040918290208251610100810190935280546001600160a01b03168352600181018054919284019161050390610aef565b80601f016020809104026020016040519081016040528092919081815260200182805461052f90610aef565b801561057a5780601f106105515761010080835404028352916020019161057a565b820191905f5260205f20905b81548152906001019060200180831161055d57829003601f168201915b50505091835250506002919091015460ff8082166020840152610100820481166040840152620100008204811615156060840152630100000082048116151560808401526401000000008204811660a0840152600160281b90910416151560c09091015292915050565b5f828152600260205260409020546001600160a01b031633146106395760405162461bcd60e51b815260206004820152600d60248201526c4e6f7420796f75722067616d6560981b60448201526064016102a8565b5f828152600260208190526040909120015462010000900460ff166106925760405162461bcd60e51b815260206004820152600f60248201526e47616d65206e6f742061637469766560881b60448201526064016102a8565b5f82815260026020819052604090912001805460ff8316640100000000810264ffffff00001990921691909117630100000017909155601510806106ec57505f828152600260208190526040909120015460ff8083169116115b5f8381526002602081815260408084208301805465ff00000000001916600160281b961515870217815533855260038352818520859055938790529181529154815160ff8087168252949091049390931615159183019190915283917f1b8e2ba8610c7d4b163bd56a60d623cf8f33a9036046cab0e9ffacee351d3b48910160405180910390a25050565b5f828152600260205260409020546001600160a01b031633146107cc5760405162461bcd60e51b815260206004820152600d60248201526c4e6f7420796f75722067616d6560981b60448201526064016102a8565b5f828152600260208190526040909120015462010000900460ff166108255760405162461bcd60e51b815260206004820152600f60248201526e47616d65206e6f742061637469766560881b60448201526064016102a8565b5f82815260026020818152604092839020909101805460ff191660ff8516908117909155915191825283917fb001f3cadc96ce7cc0042c3d114c6f225c736ac1ed7fac1eb08d4ba0917eaa5b910160405180910390a260158160ff1611156108b8575f828152600260208181526040808420909201805465ff00ffff000019166301000000179055338352600390528120555b5050565b5f602082840312156108cc575f5ffd5b5035919050565b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b6001600160a01b0389168152610100602082018190525f906109259083018a6108d3565b60ff9889166040840152968816606083015250931515608085015291151560a084015290931660c082015291151560e09092019190915292915050565b803560ff81168114610972575f5ffd5b919050565b5f5f5f5f6060858703121561098a575f5ffd5b843567ffffffffffffffff8111156109a0575f5ffd5b8501601f810187136109b0575f5ffd5b803567ffffffffffffffff8111156109c6575f5ffd5b8760208284010111156109d7575f5ffd5b6020918201955093506109eb908601610962565b91506109f960408601610962565b905092959194509250565b602080825282516001600160a01b03168282015282015161010060408301525f90610a336101208401826108d3565b905060ff60408501511660608401526060840151610a56608085018260ff169052565b50608084015180151560a08501525060a084015180151560c08501525060c084015160ff811660e08501525060e0840151801515610100850152509392505050565b5f60208284031215610aa8575f5ffd5b81356001600160a01b0381168114610abe575f5ffd5b9392505050565b5f5f60408385031215610ad6575f5ffd5b82359150610ae660208401610962565b90509250929050565b600181811c90821680610b0357607f821691505b602082108103610b2157634e487b7160e01b5f52602260045260245ffd5b50919050565b5f60018201610b4457634e487b7160e01b5f52601160045260245ffd5b5060010190565b634e487b7160e01b5f52604160045260245ffd5b601f821115610bb15782821115610bb157805f5260205f20601f840160051c6020851015610b8a57505f5b90810190601f840160051c035f5b81811015610bad575f83820155600101610b98565b5050505b505050565b815167ffffffffffffffff811115610bd057610bd0610b4b565b610be481610bde8454610aef565b84610b5f565b6020601f821160018114610c16575f8315610bff5750848201515b5f19600385901b1c1916600184901b178455610c6e565b5f84815260208120601f198516915b82811015610c455787850151825560209485019460019092019101610c25565b5084821015610c6257868401515f19600387901b60f8161c191681555b505060018360011b0184555b505050505056fea2646970667358221220e748086e703aa1c90880eafee1baf60c74172d611f51784c3e7d97bca50251fe64736f6c63430008270033" as const;

export const ENCRYPTED_BLACKJACK_SOURCE = "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\ncontract EncryptedBlackjack {\n    address public owner;\n    uint256 public gameId;\n    \n    struct Game {\n        address player;\n        bytes encryptedHoleCard;\n        uint8 playerScore;\n        uint8 dealerUpcard;\n        bool isActive;\n        bool isRevealed;\n        uint8 dealerFinalScore;\n        bool playerWon;\n    }\n    \n    mapping(uint256 => Game) public games;\n    mapping(address => uint256) public activeGame;\n    \n    event GameStarted(uint256 indexed gameId, address indexed player, uint8 dealerUpcard);\n    event CardDrawn(uint256 indexed gameId, uint8 newScore);\n    event GameRevealed(uint256 indexed gameId, uint8 dealerFinalScore, bool playerWon);\n    \n    constructor() {\n        owner = msg.sender;\n    }\n    \n    function startGame(bytes calldata _encryptedHoleCard, uint8 _dealerUpcard, uint8 _playerInitialScore) external {\n        require(activeGame[msg.sender] == 0, \"Game already active\");\n        gameId++;\n        games[gameId] = Game({\n            player: msg.sender,\n            encryptedHoleCard: _encryptedHoleCard,\n            playerScore: _playerInitialScore,\n            dealerUpcard: _dealerUpcard,\n            isActive: true,\n            isRevealed: false,\n            dealerFinalScore: 0,\n            playerWon: false\n        });\n        activeGame[msg.sender] = gameId;\n        emit GameStarted(gameId, msg.sender, _dealerUpcard);\n    }\n    \n    function updatePlayerScore(uint256 _gameId, uint8 _newScore) external {\n        require(games[_gameId].player == msg.sender, \"Not your game\");\n        require(games[_gameId].isActive, \"Game not active\");\n        games[_gameId].playerScore = _newScore;\n        emit CardDrawn(_gameId, _newScore);\n        if (_newScore > 21) {\n            games[_gameId].isActive = false;\n            games[_gameId].isRevealed = true;\n            games[_gameId].playerWon = false;\n            activeGame[msg.sender] = 0;\n        }\n    }\n    \n    // In real zkFHE, this would trigger homomorphic decryption of the hole card\n    // For this demo, the decrypted score is computed off-chain and submitted\n    function revealAndSettle(uint256 _gameId, uint8 _dealerFinalScore) external {\n        require(games[_gameId].player == msg.sender, \"Not your game\");\n        require(games[_gameId].isActive, \"Game not active\");\n        games[_gameId].isActive = false;\n        games[_gameId].isRevealed = true;\n        games[_gameId].dealerFinalScore = _dealerFinalScore;\n        games[_gameId].playerWon = (_dealerFinalScore > 21 || games[_gameId].playerScore > _dealerFinalScore);\n        activeGame[msg.sender] = 0;\n        emit GameRevealed(_gameId, _dealerFinalScore, games[_gameId].playerWon);\n    }\n    \n    function getGame(uint256 _gameId) external view returns (Game memory) {\n        return games[_gameId];\n    }\n}\n";
