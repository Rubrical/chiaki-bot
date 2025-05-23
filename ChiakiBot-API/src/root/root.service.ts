import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RootDto } from './dto/root.dto';
import { UpdateRootDto } from './dto/update-root.dto';
import { BcryptService } from './bcrypt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Root } from './entities/root.entity';
import { JwtService } from '@nestjs/jwt';

interface Payload {
  sub: number;
  username: string;
}

@Injectable()
export class RootService {
  constructor(
    @InjectRepository(Root)
    private readonly rootRepository: Repository<Root>,

    private readonly bcrypt: BcryptService,
    private readonly jwtService: JwtService,
  ) {}

  async checkIfExists(): Promise<boolean> {
    const count = await this.rootRepository.count();
    if (count === 1) return true;

    return false;
  }

  async create(createRootDto: RootDto) {
    const hasehdPassword = await this.bcrypt.createNewPassword(createRootDto.password);
    const newRoot = this.rootRepository.create({
      login: createRootDto.username,
      senha: hasehdPassword,
      dataCadastro: new Date(),
      dataInativo: null,
    });
    const savedRoot = await this.rootRepository.save(newRoot);
    const payload: Payload = { sub: savedRoot.id, username: savedRoot.login };

    const token = await this.generateJwt(payload);
    return { token: token };
  }

  async update(id: number, updateRootDto: UpdateRootDto) {
    const existingUser = await this.rootRepository.findOneBy({ id: id });
    const newPassword = await this.bcrypt.createNewPassword(updateRootDto.password);

    existingUser.login = updateRootDto.username;
    existingUser.senha = newPassword;

    const updatedUser = await this.rootRepository.save(existingUser);
    updatedUser.senha = undefined;

    return updatedUser;
  }

  async login(dto: RootDto): Promise<{ token: string }> {
    const findedUser = await this.rootRepository.findOneBy({ login: dto.username });
    if (!findedUser) throw new NotFoundException('Usuário não cadastrado');
    const isPasswordCorrect = await this.bcrypt.checkIfPasswordAreEqual(dto.password, findedUser.senha);
    if (isPasswordCorrect === false) throw new BadRequestException('Login ou senha inválidos');

    const token = await this.generateJwt({ sub: findedUser.id, username: findedUser.login });
    return { token: token };
  }

  private async generateJwt(payload: Payload) {
    return await this.jwtService.signAsync(payload);
  }
}
