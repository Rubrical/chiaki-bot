import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { UpdateGroupDto } from './dtos/update-group-dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NewGroupDto } from './dtos/new-group-dto';
import { GroupDataDto } from './dtos/group-data-dto';

describe('GroupsController', () => {
  let controller: GroupsController;

  const mockGroupService = {
    newGroup: jest.fn(),
    editGroup: jest.fn(),
    inactivateGroup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [
        {
          provide: GroupsService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('newGroup', () => {
    it('should create a new group', async () => {
      const newGroupDto: NewGroupDto = {
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
      };
      const groupDataDto: GroupDataDto = {
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição de teste',
        msgEntrada: 'Bem-vindo!',
      };
      const createdGroup = {
        id: 1,
        ...newGroupDto,
        ...groupDataDto,
        dataCadastro: new Date(),
      };

      mockGroupService.newGroup.mockResolvedValue(createdGroup);

      const result = await controller.newGroup(newGroupDto, groupDataDto);

      expect(result).toEqual(createdGroup);
      expect(mockGroupService.newGroup).toHaveBeenCalledWith(newGroupDto, groupDataDto);
    });

    it("should throw BadRequestException if group don't already exists", async () => {
      const newGroupDto: NewGroupDto = {
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
      };

      mockGroupService.newGroup.mockRejectedValue(new BadRequestException('Grupo já cadastrado!'));

      await expect(controller.newGroup(newGroupDto)).rejects.toThrow(BadRequestException);
      expect(mockGroupService.newGroup).toHaveBeenCalledWith(newGroupDto, undefined);
    });
  });

  describe('updateGroup', () => {
    it('should update a group', async () => {
      const groupId = '12345';
      const updateGroupDto: UpdateGroupDto = {
        nomeGrupo: 'Group test atualizado',
        donoGrupoId: 'admin_novo',
        descricaoGrupo: 'Descrição atualizada',
        msgEntrada: 'Bem-vindo de volta!',
      };
      const updatedGroup = {
        id: 1,
        whatsappGroupId: groupId,
        ...updateGroupDto,
      };

      mockGroupService.editGroup.mockResolvedValue(updatedGroup);

      const result = await controller.updateGroup(groupId, updateGroupDto);

      expect(result).toEqual(updatedGroup);
      expect(mockGroupService.editGroup).toHaveBeenCalledWith(groupId, updateGroupDto);
    });

    it('should throw NotFoundException if group not found', async () => {
      const groupId = '12345';
      const updateGroupDto: UpdateGroupDto = {
        nomeGrupo: 'Group test atualizado',
      };

      mockGroupService.editGroup.mockRejectedValue(new NotFoundException('Grupo não encontrado!'));

      await expect(controller.updateGroup(groupId, updateGroupDto)).rejects.toThrow(NotFoundException);
      expect(mockGroupService.editGroup).toHaveBeenCalledWith(groupId, updateGroupDto);
    });
  });

  describe('inactivateGroup', () => {
    it('should inactivate group', async () => {
      const groupId = '12345';
      const inactivatedGroup = {
        id: 1,
        whatsappGroupId: groupId,
        dataInativo: new Date(),
      };

      mockGroupService.inactivateGroup.mockResolvedValue(inactivatedGroup);

      const result = await controller.inactivateGroup(groupId);

      expect(result).toEqual(inactivatedGroup);
      expect(mockGroupService.inactivateGroup).toHaveBeenCalledWith(groupId);
    });

    it('should throw NotFoundException if not found', async () => {
      const groupId = '12345';

      mockGroupService.inactivateGroup.mockRejectedValue(new NotFoundException('Grupo não encontrado!'));

      await expect(controller.inactivateGroup(groupId)).rejects.toThrow(NotFoundException);
      expect(mockGroupService.inactivateGroup).toHaveBeenCalledWith(groupId);
    });
  });
});
