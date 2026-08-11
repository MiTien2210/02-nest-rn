import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email: email });
    if (user) return true;
    return false;
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    // check email exist or not
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email address.`,
      );
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    console.log('hashPassword ::: ', hashPassword);

    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });

    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItem = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItem / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password') // Bỏ password, không select password
      .sort(sort as any);
    return { results, totalPages };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async update(updateUserDto: UpdateUserDto) {
    const { _id, ...updateDataUser } = updateUserDto;
    return await this.userModel.updateOne({ _id: _id }, { ...updateDataUser });
  }

  async remove(id: string) {
    // check id
    if (mongoose.isValidObjectId(id)) {
      // delete
      return await this.userModel.deleteOne({ _id: id });
    } else {
      throw new BadRequestException('Invalid ID format of mongodb');
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const { email, password, name } = registerDto;
    // check email exist or not
    const isExist = await this.isEmailExist(email);
    if (isExist) {
      throw new BadRequestException(
        `Email ${email} already exists. Please use another email address.`,
      );
    }
    // hash password
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();

    // create user
    const user = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      isActive: false,
      codeId: codeId,
      // codeExpired: dayjs().add(5, 'minutes'),
      codeExpired: dayjs().add(30, 'seconds'),
    });

    // send email

    this.mailerService.sendMail({
      to: user.email, // list of receivers
      // from: 'noreply@nestjs.com',
      subject: 'Activate for your account at Fairy Bistro', // subject line
      // text: 'welcome', // plaintexxt body
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    // trả phản hồi
    return {
      _id: user._id,
    };
  }
}
