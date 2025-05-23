import { Module } from '@nestjs/common';
import { RootService } from './root.service';
import { RootController } from './root.controller';
import { BcryptService } from './bcrypt.service';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Root } from './entities/root.entity';

const jwtConstant = { secret: '#2Bq!w87;LlMap' };

@Module({
  controllers: [RootController],
  providers: [RootService, BcryptService],
  imports: [
    TypeOrmModule.forFeature([Root]),
    JwtModule.register({
      global: true,
      secret: jwtConstant.secret,
      signOptions: {
        expiresIn: '8h',
      },
    }),
  ],
})
export class RootModule {}
