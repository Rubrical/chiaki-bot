import { Injectable } from '@nestjs/common';
import { genSalt, hash, compare } from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly salt = genSalt(12);

  async createNewPassword(password: string): Promise<string> {
    return await hash(password, await this.salt);
  }

  async checkIfPasswordAreEqual(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }
}
