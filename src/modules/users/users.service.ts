import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { USER_ERRORS } from '../../shared/helpers/responses/errors/user-errors.helpers';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  private readonly salt: string;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

    private readonly configService: ConfigService<
      {
        SECURITY_SALT: string;
      },
      true
    >,
  ) {
    this.salt = configService.get<string>('SECURITY_SALT', {
      infer: true,
    });
  }

  async signIn(authDto: CreateUserDto): Promise<{ access_token: string }> {
    return this.authService.signIn(authDto);
  }
  async create(createUserDto: CreateUserDto) {
    const userAlreadyExist = await this.findOneByUsername(
      createUserDto.username,
    );

    if (userAlreadyExist) {
      throw new BadRequestException(USER_ERRORS.userAlreadyExist);
    }
    const user: CreateUserDto = this.userRepository.create(createUserDto);

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hash(createUserDto.password, salt);

    user.password = hash;

    return this.userRepository.save(user);
  }

  async findOneById(id: string) {
    return this.userRepository.findOne({
      where: [{ id }, { username: id }],
    });
  }

  async findOneByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
      withDeleted: true,
    });
  }
}
