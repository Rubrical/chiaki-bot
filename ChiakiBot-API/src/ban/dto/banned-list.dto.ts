import { Ban } from '../entities/ban.entity';

export class BannedListDto {
  bannedUsersFromGroup: Ban[];
  bannedQuantity: number;
}
