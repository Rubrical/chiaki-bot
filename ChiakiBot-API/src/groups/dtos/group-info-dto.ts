export class GroupInfoDto {
  groupName: string;
  whatsappGroupId: string;
  dateEntry: Date;
  status: boolean;
  ownerName: string;
  totalActiveMembers: number;
  totalMembers: number;
  moderatorsQuantity: number;
  totalMessagesNumber: number;
  totalCommandsExecuted: number;
  isWelcomeMessageActive: boolean;
  isGoodByeMessageActive: boolean;
}
