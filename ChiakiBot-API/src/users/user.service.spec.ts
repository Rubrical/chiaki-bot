import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { NewUserDto } from './dtos/new-user-dto';
import { UserTypeEnum } from '../shared/enums/user-type-enum';

describe('UserService', () => {
  let service: UserService;
  const mockDate = new Date();

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    increment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new user', async () => {
    // entities gathering
    const newUserDto: NewUserDto = {
      remoteJid: 'numero_teste',
      userName: 'nome teste',
    };
    const createdUser: User = {
      id: 0,
      remoteJid: newUserDto.remoteJid,
      nome: newUserDto.userName,
      // comandosExecutados: 0,
      // quantidadeMensagens: 0,
      tipoUsuario: UserTypeEnum.COMUM,
      dataCadastro: mockDate,
      grupos: [],
    };

    // mocks
    mockUserRepository.create.mockReturnValue(createdUser);
    mockUserRepository.save.mockReturnValue(createdUser);
    const result = await service.registerUser(newUserDto);

    // test asserts
    expect(result).toBeDefined();
    expect(result.remoteJid).toBe(newUserDto.remoteJid);
    expect(result.nome).toBe(newUserDto.userName);
    expect(result.tipoUsuario).toBe(UserTypeEnum.COMUM);
    expect(result.dataCadastro).toBeDefined();
  });

  it('should register new owner user if no owner exists', async () => {
    // entities mock
    const newUserDto: NewUserDto = {
      remoteJid: 'numero_teste',
      userName: 'nome teste',
    };
    const createdUser: User = {
      id: 0,
      remoteJid: newUserDto.remoteJid,
      nome: newUserDto.userName,
      // comandosExecutados: 0,
      // quantidadeMensagens: 0,
      tipoUsuario: UserTypeEnum.DONO,
      dataCadastro: mockDate,
      grupos: [],
    };

    // functions mocks
    mockUserRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    mockUserRepository.create.mockReturnValue(createdUser);
    mockUserRepository.save.mockResolvedValue(createdUser);

    const result = await service.registerOwner(newUserDto);

    // test asserts
    expect(result).toBeDefined();
    expect(result.remoteJid).toBe(newUserDto.remoteJid);
    expect(result.nome).toBe(newUserDto.userName);
    expect(result.tipoUsuario).toBe(UserTypeEnum.DONO);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      remoteJid: newUserDto.remoteJid,
      nome: newUserDto.userName,
      tipoUsuario: UserTypeEnum.DONO,
      comandosExecutados: 0,
      quantidadeMensagens: 0,
      dataCadastro: mockDate,
    });
    expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
  });

  it('should update an existing user to owner if an user exists', async () => {
    // mock existing user (not owner)
    const existingUser = {
      remoteJid: 'numero_teste',
      nome: 'nome teste',
      tipoUsuario: UserTypeEnum.COMUM,
    };

    mockUserRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(existingUser);

    const updatedUser = { ...existingUser, tipoUsuario: UserTypeEnum.DONO };
    mockUserRepository.update.mockReturnValue({ affected: 1 });
    mockUserRepository.findOne.mockReturnValue(updatedUser);

    const result = await service.registerOwner({
      userName: existingUser.nome,
      remoteJid: existingUser.remoteJid,
    });

    // test asserts
    expect(result).toBeDefined();
    expect(result.tipoUsuario).toBe(UserTypeEnum.DONO);
    expect(mockUserRepository.update).toHaveBeenCalledWith(existingUser.remoteJid, {
      tipoUsuario: UserTypeEnum.DONO,
    });
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(3);
  });

  it('should throw an error if an owner already exists', async () => {
    // mock existing owner
    mockUserRepository.findOne.mockResolvedValueOnce({
      remoteJid: 'existing_dono',
      tipoUsuario: UserTypeEnum.DONO,
    });

    const newUserDto: NewUserDto = {
      remoteJid: 'numero_teste',
      userName: 'nome teste',
    };

    // test execution & asserts
    await expect(service.registerOwner(newUserDto)).rejects.toThrow(BadRequestException);
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  // it('should increment message quantity', async () => {
  //   const existingUser = {
  //     remoteJid: 'numero_teste',
  //     quantidadeMensagens: 5,
  //   };

  //   mockUserRepository.findOne.mockResolvedValue(existingUser);
  //   mockUserRepository.increment.mockResolvedValue({ affected: 1 });

  //   const result = await service.incrementMessageNumber('numero_teste');

  //   expect(result).toBe(true);
  //   expect(mockUserRepository.increment).toHaveBeenCalledWith(
  //     { remoteJid: 'numero_teste' },
  //     'quantidadeMensagens',
  //     1,
  //   );
  // });

  // it('should throw an exception if no user found', async () => {
  //   mockUserRepository.findOne.mockResolvedValue(null);
  //
  //   await expect(
  //     service.incrementMessageNumber('numero_inexistente'),
  //   ).rejects.toThrow(NotFoundException);
  // });

  // it('should throw an exception if no entity was updated', async () => {
  //   const existingUser = {
  //     remoteJid: 'test_remote_jid',
  //     quantidadeMensagens: 5,
  //   };
  //
  //   mockUserRepository.findOne.mockResolvedValue(existingUser);
  //   mockUserRepository.increment.mockResolvedValue({ affected: 0 });
  //
  //   await expect(
  //     service.incrementMessageNumber(existingUser.remoteJid),
  //   ).rejects.toThrow(InternalServerErrorException);
  // });

  // it('should find an user by its remoteJid', async () => {
  //   const existingUser = {
  //     remoteJid: 'teste_remote_jid',
  //     nome: 'teste',
  //     quantidadeMensagens: 1,
  //     comandosExecutados: 1,
  //     dataCadastro: mockDate,
  //   };
  //   const userDto: UserDto = {
  //     remoteJid: 'teste_remote_jid',
  //     nome: 'teste',
  //     dataCadastro: mockDate,
  //   };
  //
  //   mockUserRepository.findOneBy.mockResolvedValue(existingUser);
  //
  //   const result = await service.findUserByRemoteJid(existingUser.remoteJid);
  //
  //   expect(result).toBeDefined();
  //   expect(result).toEqual(userDto);
  //   expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
  //     remoteJid: existingUser.remoteJid,
  //   });
  // });

  it('should throw NotFoundException if user is not found', async () => {
    const nonExistingRemoteJid = 'teste';

    mockUserRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findUserByRemoteJid(nonExistingRemoteJid)).rejects.toThrow(NotFoundException);
    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      remoteJid: nonExistingRemoteJid,
    });
  });

  it('should create and save a new admin if the user does not exist', async () => {
    const newUserDto = { remoteJid: '123', userName: 'Admin' };
    const savedUser = {
      ...newUserDto,
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
    };

    mockUserRepository.findOneBy.mockResolvedValue(null); // Usuário não existe
    mockUserRepository.create.mockReturnValue(savedUser); // Criação de um novo admin
    mockUserRepository.save.mockResolvedValue(savedUser); // Salvando o admin

    const result = await service.registerAdmin(newUserDto);

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      remoteJid: '123',
    });
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      remoteJid: '123',
      nome: 'Admin',
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
      quantidadeMensagens: 0,
      comandosExecutados: 0,
      dataCadastro: expect.any(Date),
    });
    expect(mockUserRepository.save).toHaveBeenCalledWith(savedUser);
    expect(result).toEqual(savedUser);
  });

  it('should update the user to admin if they already exist and are not admin', async () => {
    const existingUser = { remoteJid: '123', tipoUsuario: UserTypeEnum.COMUM };

    mockUserRepository.findOneBy.mockResolvedValue(existingUser);
    mockUserRepository.update.mockResolvedValue({ affected: 1 });
    mockUserRepository.findOneBy.mockResolvedValue({
      ...existingUser,
      tipoUsuario: UserTypeEnum.COMUM,
    });

    const result = await service.registerAdmin({
      remoteJid: '123',
      userName: 'Admin',
    });

    expect(mockUserRepository.update).toHaveBeenCalledWith('123', {
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
    });
    expect(result.tipoUsuario).toBe(UserTypeEnum.ADMINISTRADOR);
  });

  it('should throw an error if the user is already an admin', async () => {
    const existingUser = {
      remoteJid: '123',
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
    };

    mockUserRepository.findOneBy.mockResolvedValue(existingUser);

    await expect(service.registerAdmin({ remoteJid: '123', userName: 'Admin' })).rejects.toThrow(
      InternalServerErrorException,
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('should return the user role', async () => {
    const existingUser = {
      remoteJid: '123',
      nome: 'User',
      tipoUsuario: UserTypeEnum.COMUM,
    };

    mockUserRepository.findOneBy.mockResolvedValue(existingUser);

    const result = await service.getUserRole('123');

    expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
      remoteJid: '123',
    });
    expect(result).toEqual({ userName: 'User', role: UserTypeEnum.COMUM });
  });

  // it('should increment command quantity', async () => {
  //   mockUserRepository.increment.mockResolvedValue({ affected: 1 });

  //   const result = await service.incrementCommandNumber('numero_teste');

  //   expect(result).toBe(true);
  //   expect(mockUserRepository.increment).toHaveBeenCalledWith(
  //     { remoteJid: 'numero_teste' },
  //     'comandosExecutados',
  //     1,
  //   );
  // });

  // it('should throw an exception if no entity was updated on command quantity update', async () => {
  //   const existingUser = {
  //     remoteJid: 'test_remote_jid',
  //     comandosExecutados: 5,
  //   };

  //   mockUserRepository.findOne.mockResolvedValue(existingUser);
  //   mockUserRepository.increment.mockResolvedValue({ affected: 0 });

  //   await expect(
  //     service.incrementMessageNumber(existingUser.remoteJid),
  //   ).rejects.toThrow(InternalServerErrorException);
  // });
});
