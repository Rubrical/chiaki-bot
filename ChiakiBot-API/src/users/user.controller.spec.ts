import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NewUserDto } from './dtos/new-user-dto';
import { UserTypeEnum } from '../shared/enums/user-type-enum';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    registerUser: jest.fn(),
    registerOwner: jest.fn(),
    incrementMessageNumber: jest.fn(),
    findUserByRemoteJid: jest.fn(),
    registerAdmin: jest.fn(),
    getUserRole: jest.fn(),
    updateCommandQuantity: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call UserService.registerUser and return a user', async () => {
    const newUser: NewUserDto = {
      remoteJid: '00987654321@teste',
      userName: 'nome teste',
    };
    const createdUser: User = {
      remoteJid: newUser.remoteJid,
      id: 1,
      nome: newUser.userName,
      tipoUsuario: UserTypeEnum.COMUM,
      // comandosExecutados: 0,
      dataCadastro: new Date(),
      // quantidadeMensagens: 0,
      grupos: [],
    };

    mockUserService.registerUser.mockResolvedValue(createdUser);
    const result = await controller.createNewUser(newUser);

    expect(mockUserService.registerUser).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(createdUser);
  });

  it('should call UserService.registerOwner and return a user', async () => {
    const newUserDto: NewUserDto = { remoteJid: '456', userName: 'Owner' };
    const createdOwner: User = {
      remoteJid: newUserDto.remoteJid,
      nome: newUserDto.userName,
      id: 1,
      tipoUsuario: UserTypeEnum.DONO,
    } as User;

    mockUserService.registerOwner.mockResolvedValue(createdOwner);

    const result = await controller.registerNewOwner(newUserDto);

    expect(mockUserService.registerOwner).toHaveBeenCalledWith(newUserDto);
    expect(result).toEqual(createdOwner);
  });

  // it('should call UserService.incrementMessageNumber and return true', async () => {
  //   const remoteJid = '123';
  //   mockUserService.incrementMessageNumber.mockResolvedValue(true);

  //   const result = await controller.updateMessageQuantity(remoteJid);

  //   expect(mockUserService.incrementMessageNumber).toHaveBeenCalledWith(
  //     remoteJid,
  //   );
  //   expect(result).toBe(true);
  // });

  // it('should return a UserDto', async () => {
  //   const remoteJid = 'test_remote_jid';
  //   const userDto: UserDto = {
  //     remoteJid: 'test_remote_jid',
  //     nome: 'Test User',
  //     dataCadastro: new Date(),
  //   };
  //
  //   mockUserService.findUserByRemoteJid.mockResolvedValue(userDto);
  //
  //   const result = await controller.getUserByRemoteJid(remoteJid);
  //
  //   expect(result).toEqual(userDto);
  //   expect(mockUserService.findUserByRemoteJid).toHaveBeenCalledWith(remoteJid);
  // });

  it('should call userService.registerNewAdmin and return the result', async () => {
    const newUserDto = { remoteJid: '123', userName: 'Admin' };
    const savedUser = {
      remoteJid: '123',
      nome: 'Admin',
      tipoUsuario: UserTypeEnum.ADMINISTRADOR,
    };

    mockUserService.registerAdmin.mockResolvedValue(savedUser);

    const result = await controller.registerNewAdmin(newUserDto);

    expect(mockUserService.registerAdmin).toHaveBeenCalledWith(newUserDto);
    expect(result).toEqual(savedUser);
  });

  it('should call userService.getUserRoleByRemoteJid and return the result', async () => {
    const userRoleDto = { userName: 'User', role: UserTypeEnum.COMUM };

    mockUserService.getUserRole.mockResolvedValue(userRoleDto);

    const result = await controller.getUserRoleByRemoteJid('123');

    expect(mockUserService.getUserRole).toHaveBeenCalledWith('123');
    expect(result).toEqual(userRoleDto);
  });

  // it('should call userService.updateCommandQuantity and return the result', async () => {
  //   const remoteJid = '123';
  //   mockUserService.updateCommandQuantity.mockResolvedValue(true);

  //   const result = await controller.updateMessageQuantity(remoteJid);

  //   expect(mockUserService.incrementMessageNumber).toHaveBeenCalledWith(
  //     remoteJid,
  //   );
  //   expect(result).toBe(true);
  // });
});
