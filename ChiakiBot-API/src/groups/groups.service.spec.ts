import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Group } from './entities/group.entity';
import { UpdateGroupDto } from './dtos/update-group-dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NewGroupDto } from './dtos/new-group-dto';
import { GroupDataDto } from './dtos/group-data-dto';
import { User } from '../users/entities/user.entity';
import { GroupUser } from '../shared/entities/group-user.entity';
import { UserTypeEnum } from '../shared/enums/user-type-enum';

describe('GroupsService', () => {
  let service: GroupsService;

  const mockDate = new Date();
  const mockUserRepository = {
    findOneBy: jest.fn(),
  };
  const mockGroupRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
  };
  const mockGroupUserRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: getRepositoryToken(Group),
          useValue: mockGroupRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(GroupUser),
          useValue: mockGroupUserRepository,
        },
      ],
    }).compile();

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    service = module.get<GroupsService>(GroupsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('new group', () => {
    it('should create a new group', async () => {
      const createdGroup = {
        id: 1,
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição Antiga',
        msgEntrada: 'Bem-vindo!',
        dataCadastro: mockDate,
      };

      const newGroup: NewGroupDto = {
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
      };

      const groupData: GroupDataDto = {
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição Antiga',
        msgEntrada: 'Bem-vindo!',
      };

      mockGroupRepository.findOneBy.mockResolvedValueOnce(null);
      mockGroupRepository.create.mockReturnValue(createdGroup);
      mockGroupRepository.save.mockResolvedValue(createdGroup);

      const result = await service.newGroup(newGroup, groupData);

      expect(result).toBeDefined();
      expect(result).toEqual(createdGroup);
      expect(mockGroupRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockGroupRepository.findOneBy).toHaveBeenCalledWith({
        whatsappGroupId: newGroup.whatsappGroupId,
      });
      expect(mockGroupRepository.create).toHaveBeenCalledWith({
        ...newGroup,
        ...groupData,
        dataCadastro: mockDate,
      });
      expect(mockGroupRepository.save).toHaveBeenCalledWith(createdGroup);
    });

    it('should throw an error if new group already exists', async () => {
      const existingGroup = {
        id: 1,
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição Antiga',
        msgEntrada: 'Bem-vindo!',
        dataCadastro: new Date(),
      };

      const newGroup: NewGroupDto = {
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
      };

      const groupData: GroupDataDto = {
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição Antiga',
        msgEntrada: 'Bem-vindo!',
      };

      mockGroupRepository.findOneBy.mockResolvedValue(existingGroup);

      await expect(service.newGroup(newGroup, groupData)).rejects.toThrow(BadRequestException);

      expect(mockGroupRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(mockGroupRepository.findOneBy).toHaveBeenCalledWith({
        whatsappGroupId: newGroup.whatsappGroupId,
      });
      expect(mockGroupRepository.create).not.toHaveBeenCalled();
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateGroup', () => {
    it('must update only allowed members', async () => {
      const existingGroup = {
        id: 1,
        whatsappGroupId: '12345',
        nomeGrupo: 'Group test',
        donoGrupoId: 'admin',
        descricaoGrupo: 'Descrição Antiga',
        msgEntrada: 'Bem-vindo!',
        dataCadastro: mockDate,
      };

      mockGroupRepository.findOneBy.mockResolvedValue(existingGroup);
      mockGroupRepository.save.mockImplementation((group) => group);

      const updatedData: UpdateGroupDto = {
        nomeGrupo: 'new name',
        donoGrupoId: 'newAdmin',
        descricaoGrupo: 'New Description',
        msgEntrada: 'Updated Message',
      };

      const result = await service.editGroup(existingGroup.whatsappGroupId, updatedData);

      expect(result).toMatchObject(updatedData);
      expect(result.whatsappGroupId).toBe(existingGroup.whatsappGroupId);
      expect(mockGroupRepository.save).toHaveBeenCalledWith(expect.objectContaining(updatedData));
    });

    it('must throw NotFoundException if group is not found', async () => {
      const updatedData: UpdateGroupDto = {
        nomeGrupo: 'new name',
        donoGrupoId: 'newAdmin',
        descricaoGrupo: 'New Description',
        msgEntrada: 'Updated Message',
      };

      mockGroupRepository.findOneBy.mockResolvedValue(null);
      await expect(service.editGroup('999', updatedData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('inactivate group', () => {
    it('should inactivate a group', async () => {
      const mockGroupId = 'group123';
      const mockGroup: Group = {
        id: 1,
        whatsappGroupId: mockGroupId,
        nomeGrupo: 'Grupo Teste',
        donoGrupoId: 'admin123',
        descricaoGrupo: 'Descrição do Grupo Teste',
        // msgEntrada: 'Bem-vindo ao Grupo Teste!',
        dataCadastro: new Date(),
        dataInativo: null,
        usuarios: [],
      };

      mockGroupRepository.findOneBy.mockResolvedValue(mockGroup);
      mockGroupRepository.save.mockResolvedValue({
        ...mockGroup,
        dataInativo: mockDate,
      });

      const result = await service.inactivateGroup(mockGroupId);

      expect(result.dataInativo).toBeTruthy();
      expect(result.dataInativo.getTime()).toBeGreaterThanOrEqual(mockDate.getTime());
      expect(mockGroupRepository.save).toHaveBeenCalledWith({
        ...mockGroup,
        dataInativo: result.dataInativo,
      });
    });

    it('should throw NotFoundException if group is not found', async () => {
      const mockGroupId = '1234';

      mockGroupRepository.findOneBy.mockResolvedValue(null);

      await expect(service.inactivateGroup(mockGroupId)).rejects.toThrow(NotFoundException);
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('addNewUserToGroup', () => {
    it('should add a new user to the group', async () => {
      const idUser = 'user123';
      const idGroup = 'group123';

      const userMock = { remoteJid: idUser };
      const groupMock = { whatsappGroupId: idGroup };
      const groupUserMock = {
        usuario: userMock,
        grupo: groupMock,
        dataCadastro: mockDate,
      };

      mockUserRepository.findOneBy.mockResolvedValue(userMock);
      mockGroupRepository.findOneBy.mockResolvedValue(groupMock);
      mockGroupUserRepository.create.mockReturnValue(groupUserMock);
      mockGroupUserRepository.save.mockResolvedValue(groupUserMock);

      const result = await service.addNewUserToGroup(idUser, idGroup);

      expect(result).toEqual(groupUserMock);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        remoteJid: idUser,
      });
      expect(mockGroupRepository.findOneBy).toHaveBeenCalledWith({
        whatsappGroupId: idGroup,
      });
      expect(mockGroupUserRepository.create).toHaveBeenCalledWith({
        usuario: userMock,
        grupo: groupMock,
        dataCadastro: expect.any(Date),
      });
      expect(mockGroupUserRepository.save).toHaveBeenCalledWith(groupUserMock);
    });

    it('should throw an error if user or group does not exist', async () => {
      const idUser = 'user123';
      const idGroup = 'group123';

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockGroupRepository.findOneBy.mockResolvedValue(null);

      await expect(service.addNewUserToGroup(idUser, idGroup)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        remoteJid: idUser,
      });
      expect(mockGroupRepository.findOneBy).toHaveBeenCalledWith({
        whatsappGroupId: idGroup,
      });
    });
  });

  describe('inactivateUserFromGroup', () => {
    it('should inactivate a user from the group', async () => {
      const idUser = 'user123';
      const idGroup = 'group123';
      const dateMock = new Date();

      const groupUserMock = {
        usuario: { remoteJid: idUser },
        grupo: { whatsappGroupId: idGroup },
        dataInativo: null,
      };
      mockGroupUserRepository.findOne.mockResolvedValue(groupUserMock);
      mockGroupUserRepository.save.mockResolvedValue({
        ...groupUserMock,
        dataInativo: dateMock,
      });

      const result = await service.inactivateUserFromGroup(idUser, idGroup);

      expect(result.dataInativo).toEqual(dateMock);
      expect(mockGroupUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          usuario: { remoteJid: idUser },
          grupo: { whatsappGroupId: idGroup },
        },
      });
      expect(mockGroupUserRepository.save).toHaveBeenCalledWith({
        ...groupUserMock,
        dataInativo: dateMock,
      });
    });

    it('should throw an error if user is not in the group', async () => {
      const idUser = 'user123';
      const idGroup = 'group123';

      mockGroupUserRepository.findOne.mockResolvedValue(null);

      await expect(service.inactivateUserFromGroup(idUser, idGroup)).rejects.toThrow(NotFoundException);
      expect(mockGroupUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          usuario: { remoteJid: idUser },
          grupo: { whatsappGroupId: idGroup },
        },
      });
    });
  });

  describe('getGroupReport', () => {
    it('should return group report entities', async () => {
      const idGroup = 'group123';

      const groupMock = {
        whatsappGroupId: idGroup,
        donoGrupoId: 'admin123',
        usuarios: [
          {
            usuario: {
              remoteJid: 'user1',
              tipoUsuario: UserTypeEnum.ADMINISTRADOR,
              quantidadeMensagens: 10,
              comandosExecutados: 5,
            },
            dataInativo: null,
          },
          {
            usuario: {
              remoteJid: 'user2',
              tipoUsuario: UserTypeEnum.COMUM,
              quantidadeMensagens: 20,
              comandosExecutados: 3,
            },
            dataInativo: null,
          },
          {
            usuario: {
              remoteJid: 'user3',
              tipoUsuario: UserTypeEnum.COMUM,
              quantidadeMensagens: 5,
              comandosExecutados: 2,
            },
            dataInativo: mockDate,
          },
        ],
      };

      const botOwnerMock = {
        remoteJid: 'admin123',
        nome: 'Admin Owner',
        tipoUsuario: UserTypeEnum.DONO,
      };

      mockGroupRepository.findOne.mockResolvedValue(groupMock);
      mockUserRepository.findOneBy.mockResolvedValue(botOwnerMock);

      const result = await service.getGroupReport(idGroup);

      expect(result).toEqual({
        ownerName: 'Admin Owner',
        totalActiveMembers: 2,
        totalMembers: 3,
        moderatorsQuantity: 1,
        totalMessagesNumber: 35,
        totalCommandsExecuted: 10,
      });

      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { whatsappGroupId: idGroup },
        relations: ['usuarios', 'usuarios.usuario'],
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        tipoUsuario: UserTypeEnum.DONO,
      });
    });

    it('should throw an error if the group is not found', async () => {
      const idGroup = 'group123';

      mockGroupRepository.findOne.mockResolvedValue(null);

      await expect(service.getGroupReport(idGroup)).rejects.toThrow(NotFoundException);
      expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
        where: { whatsappGroupId: idGroup },
        relations: ['usuarios', 'usuarios.usuario'],
      });
    });
  });

  describe('getGroupMembers', () => {
    it('should return paginated users of the specified group', async () => {
      const idGroup = 'group123';
      const usersMock = Array.from({ length: 5 }, (_, i) => ({
        remoteJid: `user${i + 1}`,
        nome: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      mockGroupUserRepository.createQueryBuilder.mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(usersMock.map((user) => ({ usuario: user }))),
      });

      const result = await service.getGroupsMembersPaginate(idGroup, 2, 5);

      expect(result).toEqual(usersMock);
      expect(mockGroupUserRepository.createQueryBuilder).toHaveBeenCalledWith('grupo_usuario');
    });

    it('should return the first page with default limit if page and limit are not provided', async () => {
      const idGroup = 'group123';
      const usersMock = Array.from({ length: 10 }, (_, i) => ({
        remoteJid: `user${i + 1}`,
        nome: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      mockGroupUserRepository.createQueryBuilder.mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(usersMock.map((user) => ({ usuario: user }))),
      });

      const result = await service.getGroupsMembersPaginate(idGroup, 1, 10);

      expect(result).toEqual(usersMock);
    });

    it('should throw an error if the group does not exist or has no members', async () => {
      const idGroup = 'nonExistentGroup';

      mockGroupUserRepository.createQueryBuilder.mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      });

      await expect(service.getGroupsMembersPaginate(idGroup, 1, 10)).rejects.toThrow(NotFoundException);
    });
  });
});
