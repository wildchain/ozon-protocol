import { Injectable } from '@nestjs/common';
import {
  getTokenConfigFromAddress,
  OzonTokenAddressConfigModel,
  OzonTokenAddressConfigModelsMap,
  OzonTokenName,
  RECEIPT_TOKENS,
} from 'src/common/constants';
import { getAdminWallet } from 'src/common/util';
import { EnvironmentName } from 'src/config/env';
import { connection, getOzonProgram } from 'src/lib/@solana/web3.js';
import {
  TokenExchangeDto,
  TransactionStatus,
  TransactionType,
} from 'src/restaking/models';
import { PublicKey } from '@solana/web3.js';
import {
  saveRequestUnstakeTransaction,
  saveStakeTransaction,
  setAllUnclaimedRequestUnstakeTransactionsToClaimed,
} from 'src/restaking/repositories/transaction.repository';
import {
  RequestUnstakeTransactionModel,
  StakeTransactionModel,
} from 'src/restaking/models/transaction.model';

@Injectable()
export class TransactionListener {
  async listen() {
    console.log('TransactionListener listening...');
    try {
      const ozonProgram = getOzonProgram(getAdminWallet().anchorWallet);
      connection.onLogs(ozonProgram.programId, (logInfo) => {
        console.log('New Transaction Detected');
        console.log('logInfo:', JSON.stringify(logInfo, null, 2));
        if (logInfo.signature.includes('111111')) return;
        const isUnstakeTransaction = logInfo?.logs?.some((log: any) =>
          log.includes('RequestUnstake'),
        );
        if (isUnstakeTransaction) {
          console.log('Unstake transaction detected:', logInfo.signature);
          this.handleUnstakeTransaction(logInfo.signature);
          return;
        }
        const isClaimUnstakeTransaction = logInfo?.logs?.some((log: any) =>
          log.includes('ClaimUnstake'),
        );
        if (isClaimUnstakeTransaction) {
          console.log('Claim unstake transaction detected:', logInfo.signature);
          this.handleClaimUnstakeTransaction(logInfo.signature);
          return;
        }
        this.handleStakingTransaction(logInfo.signature);
      });
    } catch (error) {
      console.error('Error listening to transactions:', error);
    }
  }

  private async handleClaimUnstakeTransaction(signature: string) {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    const parsedTransactionData = await this._getParsedTransactionData(tx);
    console.log(
      'parsedTransactionData:',
      JSON.stringify(parsedTransactionData, null, 2),
    );
    const { tokenExchanges } = parsedTransactionData;
    const transferTokenExchange = tokenExchanges.find(
      (tokenExchange) => tokenExchange.type === 'transfer',
    );
    if (!transferTokenExchange) {
      return console.log('Transfer token exchange not found');
    }
    const ownerWalletAddress = tx.transaction.message.accountKeys[0]?.pubkey
      ?.toString()
      .toLowerCase();
    if (!ownerWalletAddress) {
      return console.log('Owner wallet address not found');
    }
    await setAllUnclaimedRequestUnstakeTransactionsToClaimed(
      ownerWalletAddress,
    );
  }

  private async handleUnstakeTransaction(signature: string) {
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    const parsedTransactionData = await this._getParsedTransactionData(tx);
    console.log(
      'parsedTransactionData:',
      JSON.stringify(parsedTransactionData, null, 2),
    );
    const { tokenExchanges } = parsedTransactionData;
    const burnTokenExchange = tokenExchanges.find(
      (tokenExchange) => tokenExchange.type === 'burn',
    );
    if (!burnTokenExchange) {
      return console.log('Burn token exchange not found');
    }
    let tokenConfig = getTokenConfigFromAddress(
      burnTokenExchange.tokenMintAddress,
    );
    if (!tokenConfig) {
      console.log(`Resorting to default for ${signature}`);
      tokenConfig =
        OzonTokenAddressConfigModelsMap[OzonTokenName.MSOL][
          process.env.APPLICATION_ENVIRONMENT || EnvironmentName.DEVELOPMENT
        ];
    }
    console.log(
      new RequestUnstakeTransactionModel({
        hash: signature.toLowerCase(),
        type: TransactionType.REQUEST_UNSTAKE,
        amount: burnTokenExchange.amount || '0',
        status: TransactionStatus.COMPLETED,
        wallet_address: burnTokenExchange.senderAddress.toLowerCase() || '',
        token_mint_address: burnTokenExchange.tokenMintAddress.toLowerCase(),
        token_name: tokenConfig.name,
      }),
    );
    saveRequestUnstakeTransaction(
      new RequestUnstakeTransactionModel({
        hash: signature.toLowerCase(),
        type: TransactionType.REQUEST_UNSTAKE,
        amount: burnTokenExchange.amount || '0',
        status: TransactionStatus.COMPLETED,
        wallet_address: burnTokenExchange.senderAddress.toLowerCase() || '',
        token_mint_address: burnTokenExchange.tokenMintAddress.toLowerCase(),
        token_name:
          burnTokenExchange.tokenMintAddress.toLowerCase() ===
          OzonTokenAddressConfigModelsMap[OzonTokenName.RMSOL][
            process.env.APPLICATION_ENVIRONMENT || EnvironmentName.DEVELOPMENT
          ].publicKey
            .toString()
            .toLowerCase()
            ? OzonTokenName.RMSOL
            : OzonTokenName.MSOL,
      }),
    );
  }

  private async handleStakingTransaction(signature: string) {
    console.log('Getting stake amount for signature:', signature);
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return console.log('Transaction not found');
    const parsedTransactionData = await this._getParsedTransactionData(tx);
    if (!parsedTransactionData.isStakeTransaction) {
      return console.log(`${signature} is not a valid stake transaction`);
    }
    console.log(
      'parsedTransactionData:',
      JSON.stringify(parsedTransactionData, null, 2),
    );
    if (!parsedTransactionData.isStakeTransaction) {
      return;
    }
    const transferTokenExchange = parsedTransactionData.tokenExchanges.find(
      (tokenExchange: TokenExchangeDto) => tokenExchange.type === 'transfer',
    );
    let tokenConfig = getTokenConfigFromAddress(
      transferTokenExchange.tokenMintAddress,
    );
    if (!tokenConfig) {
      console.log(`Resorting to default for ${signature}`);
      tokenConfig =
        OzonTokenAddressConfigModelsMap[OzonTokenName.MSOL][
          process.env.APPLICATION_ENVIRONMENT || EnvironmentName.DEVELOPMENT
        ];
    }
    saveStakeTransaction(
      new StakeTransactionModel({
        type: TransactionType.STAKE,
        amount: parsedTransactionData.tokenExchanges[0].amount,
        status: TransactionStatus.COMPLETED,
        hash: signature.toLowerCase(),
        wallet_address: transferTokenExchange.senderAddress.toLowerCase(),
        token_mint_address:
          transferTokenExchange?.tokenMintAddress?.toLowerCase(),
        token_name: tokenConfig.name,
      }),
    );
  }

  // Extract tokens from token balances
  private async _getParsedTransactionData(transaction: any) {
    console.log('transaction:', JSON.stringify(transaction, null, 2));
    const tokens = new Set<string>();
    const ownerAddresses = new Set<string>();
    const tokenExchanges: TokenExchangeDto[] = [];
    let containsMintInstruction = false;
    let containsTransferInstruction = false;
    let containsBurnInstruction = false;
    let hasReceiptToken = false;
    let transactionType: TransactionType | null = null;
    const receiptTokensAddresses = new Set<string>(
      RECEIPT_TOKENS.map((tokenName) => {
        const tokenConfig =
          OzonTokenAddressConfigModelsMap[tokenName][
            process.env.APPLICATION_ENVIRONMENT || EnvironmentName.DEVELOPMENT
          ];
        return tokenConfig.publicKey.toString().toLowerCase();
      }),
    );
    // Get tokens from pre-balances
    transaction.meta.preTokenBalances?.forEach((balance: any) => {
      tokens.add(balance.mint.toLowerCase());
      ownerAddresses.add(balance.owner.toLowerCase());
      if (receiptTokensAddresses.has(balance.mint.toLowerCase())) {
        hasReceiptToken = true;
      }
    });
    // Get tokens from post-balances
    transaction.meta.postTokenBalances?.forEach((balance: any) => {
      tokens.add(balance.mint.toLowerCase());
      ownerAddresses.add(balance.owner.toLowerCase());
      if (receiptTokensAddresses.has(balance.mint.toLowerCase())) {
        hasReceiptToken = true;
      }
    });

    for (const innerInstruction of transaction.meta?.innerInstructions || []) {
      for (const rawInstruction of innerInstruction.instructions) {
        const instruction = rawInstruction as any;
        if (
          instruction.program === 'spl-token' &&
          instruction.parsed?.type === 'mintTo'
        ) {
          containsMintInstruction = true;
          tokenExchanges.push({
            recipientAddress: instruction.parsed?.info?.destination,
            tokenMintAddress: instruction.parsed?.info?.mint?.toLowerCase?.(),
            amount: instruction.parsed?.info?.amount?.toString?.(),
            senderAddress: instruction.parsed?.info?.source?.toLowerCase?.(),
            type: 'mint',
          });
        }
        if (
          instruction.program === 'spl-token' &&
          instruction.parsed?.type === 'transfer'
        ) {
          containsTransferInstruction = true;
          // Get mint address from source token account on-chain
          const sourceTokenAccount = instruction.parsed?.info?.source;
          const mintAddress = await this._getMintFromTokenAccountOnChain(
            sourceTokenAccount,
          );

          tokenExchanges.push({
            recipientAddress: instruction.parsed?.info?.destination,
            tokenMintAddress: mintAddress?.toLowerCase(),
            amount: instruction.parsed?.info?.amount,
            senderAddress: instruction.parsed?.info?.source,
            type: 'transfer',
          });
        }
        if (
          instruction.program === 'spl-token' &&
          instruction.parsed?.type === 'burn'
        ) {
          containsBurnInstruction = true;
          tokenExchanges.push({
            recipientAddress: null,
            tokenMintAddress: instruction.parsed?.info?.mint?.toLowerCase?.(),
            amount: instruction.parsed?.info?.amount,
            senderAddress: instruction.parsed?.info?.authority,
            type: 'burn',
          });
        }
      }
    }

    const isStakeTransaction =
      containsMintInstruction && containsTransferInstruction && hasReceiptToken;
    if (isStakeTransaction) {
      transactionType = TransactionType.STAKE;
    }
    return {
      tokens: Array.from(tokens),
      ownerAddresses: Array.from(ownerAddresses),
      isStakeTransaction,
      tokenExchanges,
    };
  }

  // Simple on-chain method to get mint from token account
  private async _getMintFromTokenAccountOnChain(
    tokenAccountAddress: string,
  ): Promise<string | null> {
    if (!tokenAccountAddress) return null;
    try {
      const tokenAccountInfo = await connection.getParsedAccountInfo(
        new PublicKey(tokenAccountAddress),
      );
      const data = tokenAccountInfo.value?.data;

      if (data && 'parsed' in data && data.parsed?.info?.mint) {
        return data.parsed.info.mint;
      }
    } catch (error) {
      console.error('Error fetching token account info:', error);
    }

    return null;
  }
}
