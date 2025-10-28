import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PublicKey } from '@solana/web3.js';
import * as crypto from 'crypto';
import * as nacl from 'tweetnacl';
import { getRestakerByWalletAddress } from 'src/restaker/restaker.repository';
import { AccountType } from 'src/common/types';
import { RestakerService } from 'src/restaker/restaker.service';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async authenticateUser(
    address: string,
    accountType?: AccountType,
    signature?: string,
  ) {
    // Verify the signature first
    const isValidSignature = await this.verifySignature(address, signature);
    if (!isValidSignature) {
      throw new UnauthorizedException('Invalid signature');
    }
    // Authenticate based on account type
    let user;
    if (accountType === 'operator') {
      user = await this.authenticateOperator(address);
    } else if (accountType === 'restaker') {
      user = await this.authenticateRestaker(address);
    } else {
      throw new BadRequestException('Invalid account type');
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // Generate JWT token
    const payload = {
      address: user.wallet_address,
      accountType,
      userId: user.id,
    };
    return {
      user,
    };
  }

  private async authenticateOperator(address: string) {
    // TODO: Implement operator authentication
    // let user = await getOperatorByWalletAddress(address);
    return null;
  }

  private async authenticateRestaker(address: string) {
    const user = await getRestakerByWalletAddress(address);
    return user;
  }

  private async verifySignature(
    address: string,
    signature: string,
  ): Promise<boolean> {
    try {
      // Generate the expected message
      const message = this.generateSignatureMessage(address);

      // Convert signature from hex string to Uint8Array
      const signatureBytes = new Uint8Array(
        signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [],
      );

      // Convert address to PublicKey
      const publicKey = new PublicKey(address);

      // Create a message hash for verification
      const messageBytes = new TextEncoder().encode(message);

      // Use nacl for signature verification (Solana uses Ed25519)
      return nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes(),
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async requestSignatureMessage(address: string): Promise<{ message: string }> {
    if (!address) {
      throw new BadRequestException('Address is required');
    }

    // Validate that the address is a valid Solana public key
    try {
      new PublicKey(address);
    } catch (error) {
      throw new BadRequestException('Invalid Solana address');
    }

    const message = this.generateSignatureMessage(address);
    return { message };
  }

  private generateSignatureMessage(address: string): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');

    return `Welcome to Ozon API!

Please sign this message to authenticate with your wallet.

Address: ${address}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;
  }
}
