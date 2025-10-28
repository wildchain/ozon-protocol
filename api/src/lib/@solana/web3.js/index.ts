import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { clusterApiUrl, Connection } from '@solana/web3.js';

const ozonProgramIdl = {
  "address": "2Wvo8b4oF63csMU45z6qHCN9EZ1qV2ifBb3dwnWow6Ub",
  "metadata": {
    "name": "restaking_programs",
    "version": "0.1.3",
    "spec": "0.1.0",
    "description": "Ozon Restaking Solana Program that is responsible for restaking user tokens to Ozon protocol. It also comes up with onchain instructions to manage and register operators and AVSs with the Ozon protocol.",
    "repository": "https://github.com/wildchain/ozon_contract"
  },
  "instructions": [
    {
      "name": "claim_rewards",
      "discriminator": [
        4,
        144,
        132,
        71,
        116,
        23,
        151,
        80
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_restaking_account",
          "writable": true
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "claim_unstake",
      "discriminator": [
        172,
        113,
        117,
        178,
        223,
        245,
        247,
        118
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_base_token",
          "writable": true
        },
        {
          "name": "user_restaking_account",
          "writable": true
        },
        {
          "name": "vault_account",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "mint_account",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "de_register_avs",
      "discriminator": [
        66,
        46,
        2,
        27,
        164,
        91,
        157,
        114
      ],
      "accounts": [
        {
          "name": "avs_owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "avs_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  118,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "avs_owner"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "de_register_operator",
      "discriminator": [
        86,
        78,
        46,
        26,
        160,
        122,
        219,
        51
      ],
      "accounts": [
        {
          "name": "operator_key",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              }
            ]
          }
        },
        {
          "name": "vault",
          "docs": [
            "Add the vault here too"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize_mint_account",
      "discriminator": [
        151,
        211,
        156,
        193,
        234,
        128,
        159,
        249
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "mint_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "base_mint"
              }
            ]
          }
        },
        {
          "name": "vault_account",
          "writable": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "base_mint",
          "type": "pubkey"
        },
        {
          "name": "restaked_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initialize_operator",
      "discriminator": [
        155,
        33,
        216,
        254,
        233,
        227,
        175,
        212
      ],
      "accounts": [
        {
          "name": "operator_key",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bond_amount",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "initialize_reward_treasury",
      "discriminator": [
        62,
        56,
        64,
        187,
        191,
        172,
        209,
        133
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize_state_account",
      "discriminator": [
        39,
        2,
        117,
        168,
        59,
        208,
        51,
        145
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "msol_mint",
          "type": "pubkey"
        },
        {
          "name": "jitoSol_mint",
          "type": "pubkey"
        },
        {
          "name": "rm_sol_mint",
          "type": "pubkey"
        },
        {
          "name": "rjito_sol_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initialize_vault_account",
      "discriminator": [
        189,
        142,
        99,
        76,
        44,
        159,
        107,
        65
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "vault_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "token_mint"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "token_mint"
              }
            ]
          }
        },
        {
          "name": "token_mint"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "token_mint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "operator_opt_in_avs",
      "discriminator": [
        132,
        104,
        38,
        116,
        242,
        188,
        2,
        74
      ],
      "accounts": [
        {
          "name": "operator_key",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              }
            ]
          }
        },
        {
          "name": "avs_account",
          "docs": [
            "The AVS account - derived using AVS owner pubkey (same as RegisterAvs)"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  118,
                  115
                ]
              },
              {
                "kind": "arg",
                "path": "avs_owner"
              }
            ]
          }
        },
        {
          "name": "operator_avs_registration",
          "docs": [
            "The registration account linking operator to AVS"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114,
                  95,
                  97,
                  118,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "operator_key"
              },
              {
                "kind": "arg",
                "path": "avs_owner"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "avs_owner",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "register_avs",
      "discriminator": [
        179,
        11,
        72,
        30,
        12,
        126,
        249,
        240
      ],
      "accounts": [
        {
          "name": "avs_owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "avs_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  118,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "avs_owner"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "metadata",
          "type": "string"
        },
        {
          "name": "registration_fee",
          "type": "u64"
        }
      ]
    },
    {
      "name": "request_unstake",
      "discriminator": [
        44,
        154,
        110,
        253,
        160,
        202,
        54,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_restaked_token",
          "writable": true
        },
        {
          "name": "user_restaking_account",
          "writable": true
        },
        {
          "name": "restaked_mint",
          "writable": true
        },
        {
          "name": "mint_account",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "restaked_amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "restake",
      "discriminator": [
        97,
        161,
        241,
        167,
        6,
        32,
        213,
        53
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "user_base_token",
          "writable": true
        },
        {
          "name": "vault_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint_account.base_mint",
                "account": "MintAccount"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "mint_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "mint_account.base_mint",
                "account": "MintAccount"
              }
            ]
          }
        },
        {
          "name": "restaked_mint",
          "writable": true
        },
        {
          "name": "user_restaked_token",
          "writable": true
        },
        {
          "name": "user_restaking_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  101,
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "mint_account.restaked_mint",
                "account": "MintAccount"
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "slash_operator",
      "discriminator": [
        93,
        188,
        89,
        82,
        93,
        198,
        107,
        167
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "operator_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "operator_owner"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "operator_owner"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  95,
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "operator_owner",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update_avs_metadata",
      "discriminator": [
        113,
        205,
        171,
        107,
        244,
        19,
        1,
        186
      ],
      "accounts": [
        {
          "name": "avs_owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "avs_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  118,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "avs_owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    },
    {
      "name": "update_operator_metadata",
      "discriminator": [
        249,
        101,
        52,
        140,
        228,
        189,
        42,
        231
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "operator_account"
          ]
        },
        {
          "name": "operator_account",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  112,
                  101,
                  114,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "metadata",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "AvsAccount",
      "discriminator": [
        3,
        199,
        179,
        211,
        27,
        129,
        134,
        219
      ]
    },
    {
      "name": "MintAccount",
      "discriminator": [
        74,
        195,
        197,
        21,
        59,
        188,
        119,
        96
      ]
    },
    {
      "name": "OperatorAccount",
      "discriminator": [
        65,
        8,
        134,
        32,
        87,
        254,
        91,
        212
      ]
    },
    {
      "name": "OperatorAvsRegistration",
      "discriminator": [
        165,
        45,
        197,
        186,
        92,
        40,
        60,
        117
      ]
    },
    {
      "name": "OperatorVault",
      "discriminator": [
        128,
        158,
        81,
        27,
        170,
        26,
        218,
        31
      ]
    },
    {
      "name": "RewardTreasury",
      "discriminator": [
        255,
        22,
        223,
        151,
        7,
        100,
        82,
        243
      ]
    },
    {
      "name": "StateAccount",
      "discriminator": [
        142,
        247,
        54,
        95,
        85,
        133,
        249,
        103
      ]
    },
    {
      "name": "UserRestakingAccount",
      "discriminator": [
        201,
        68,
        191,
        163,
        116,
        39,
        138,
        71
      ]
    },
    {
      "name": "VaultAccount",
      "discriminator": [
        230,
        251,
        241,
        83,
        139,
        202,
        93,
        28
      ]
    }
  ],
  "events": [
    {
      "name": "AvsDeRegisterEvent",
      "discriminator": [
        211,
        121,
        41,
        246,
        172,
        213,
        34,
        32
      ]
    },
    {
      "name": "AvsMetadatUpdatedEvent",
      "discriminator": [
        182,
        144,
        48,
        60,
        7,
        255,
        76,
        64
      ]
    },
    {
      "name": "AvsRegisteredEvent",
      "discriminator": [
        18,
        230,
        199,
        41,
        200,
        119,
        148,
        103
      ]
    },
    {
      "name": "OperatorDeRegisteredEvent",
      "discriminator": [
        193,
        144,
        186,
        44,
        168,
        254,
        230,
        40
      ]
    },
    {
      "name": "OperatorMetadataUpdatedEvent",
      "discriminator": [
        168,
        253,
        3,
        186,
        44,
        50,
        252,
        8
      ]
    },
    {
      "name": "OperatorOptedInEvent",
      "discriminator": [
        165,
        230,
        210,
        115,
        254,
        88,
        10,
        202
      ]
    },
    {
      "name": "OperatorRegisteredEvent",
      "discriminator": [
        211,
        30,
        52,
        2,
        38,
        83,
        154,
        208
      ]
    },
    {
      "name": "OperatorSlashedEvent",
      "discriminator": [
        240,
        42,
        200,
        139,
        43,
        207,
        221,
        95
      ]
    },
    {
      "name": "RestakeEvent",
      "discriminator": [
        238,
        20,
        234,
        164,
        240,
        231,
        189,
        182
      ]
    },
    {
      "name": "RewardsClaimedEvent",
      "discriminator": [
        22,
        1,
        42,
        183,
        250,
        8,
        157,
        146
      ]
    },
    {
      "name": "UnstakeClaimedEvent",
      "discriminator": [
        199,
        180,
        239,
        202,
        146,
        236,
        127,
        186
      ]
    },
    {
      "name": "UnstakeRequestedEvent",
      "discriminator": [
        168,
        232,
        211,
        86,
        207,
        240,
        252,
        16
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "CooldownNotFinished",
      "msg": "Cooldown not finished yet"
    },
    {
      "code": 6001,
      "name": "NothingToClaim",
      "msg": "No pending unstake to claim"
    },
    {
      "code": 6002,
      "name": "NotEnoughToken",
      "msg": "Not enough tokens supplied"
    },
    {
      "code": 6003,
      "name": "Unauthorized",
      "msg": "Unauthorized action"
    },
    {
      "code": 6004,
      "name": "InsufficientBond",
      "msg": "Insufficient bond to slash"
    },
    {
      "code": 6005,
      "name": "InsufficientTreasuryBalance",
      "msg": "Not enough lamports in treasury"
    },
    {
      "code": 6006,
      "name": "AvsNotActive",
      "msg": "Avs not active to opt"
    },
    {
      "code": 6007,
      "name": "OperatorNotActive",
      "msg": "Operator not active to run nodes"
    },
    {
      "code": 6008,
      "name": "OperatorNotOptedIn",
      "msg": "Operator not opted into this AVS"
    },
    {
      "code": 6009,
      "name": "TaskNotCompleted",
      "msg": "Task not completed"
    },
    {
      "code": 6010,
      "name": "ChallengeAlreadyResolved",
      "msg": "Challenge already resolved"
    },
    {
      "code": 6011,
      "name": "InvalidAmount",
      "msg": "Amount must be greater than 0"
    },
    {
      "code": 6012,
      "name": "InsufficientRestakeBalance",
      "msg": "Insufficient restaked balance in account"
    }
  ],
  "types": [
    {
      "name": "AvsAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "registration_fee",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "slashing_policy",
            "type": "pubkey"
          },
          {
            "name": "registered_slot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "AvsDeRegisterEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "AvsMetadatUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "AvsRegisteredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "registration_fee",
            "type": "u64"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "registered_slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "MintAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "restaked_mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "total_minted",
            "type": "u64"
          },
          {
            "name": "exchange_rate",
            "type": "u64"
          },
          {
            "name": "last_update_slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OperatorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bond_amount",
            "type": "u64"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "avs_count",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vault_bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OperatorAvsRegistration",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "avs",
            "type": "pubkey"
          },
          {
            "name": "opted_in_slot",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "tasks_completed",
            "type": "u64"
          },
          {
            "name": "tasks_failed",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "OperatorDeRegisteredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bond_returned",
            "type": "u64"
          },
          {
            "name": "active",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "OperatorMetadataUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "OperatorOptedInEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator",
            "type": "pubkey"
          },
          {
            "name": "avs",
            "type": "pubkey"
          },
          {
            "name": "avs_owner",
            "type": "pubkey"
          },
          {
            "name": "opted_in_slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OperatorRegisteredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bond_amount",
            "type": "u64"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "avs_count",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "OperatorSlashedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "operator_owner",
            "type": "pubkey"
          },
          {
            "name": "slashed_amount",
            "type": "u64"
          },
          {
            "name": "remaining_bond",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "OperatorVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RestakeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "restaked_mint",
            "type": "pubkey"
          },
          {
            "name": "amount_deposited",
            "type": "u64"
          },
          {
            "name": "restaked_amount",
            "type": "u64"
          },
          {
            "name": "exchange_rate",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RewardTreasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "total_rewards_distributed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "RewardsClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "rewards",
            "type": "u64"
          },
          {
            "name": "elapsed_slots",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "StateAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "msol_mint",
            "type": "pubkey"
          },
          {
            "name": "jitosol_mint",
            "type": "pubkey"
          },
          {
            "name": "rm_sol_mint",
            "type": "pubkey"
          },
          {
            "name": "rjito_sol_mint",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "UnstakeClaimedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "base_mint",
            "type": "pubkey"
          },
          {
            "name": "base_amount",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "withdraw_amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UnstakeRequestedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "restaked_mint",
            "type": "pubkey"
          },
          {
            "name": "restaked_amount",
            "type": "u64"
          },
          {
            "name": "cooldown_end_timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "UserRestakingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "deposited_mint",
            "type": "pubkey"
          },
          {
            "name": "restaked_mint",
            "type": "pubkey"
          },
          {
            "name": "deposited_amount",
            "type": "u64"
          },
          {
            "name": "restaked_amount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "cooldown_end_timestamp",
            "type": "i64"
          },
          {
            "name": "pending_unstake",
            "type": "u64"
          },
          {
            "name": "reward_debt",
            "type": "u64"
          },
          {
            "name": "last_claimed_slot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "VaultAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token_mint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "total_deposited",
            "type": "u64"
          }
        ]
      }
    }
  ]
}

export const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export function getOzonProgram(wallet: Wallet) {
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  return new Program(ozonProgramIdl, provider);
}
