import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class RegisterService {
    constructor(private readonly prisma: PrismaService) { }

    async registerUser(dto: RegisterUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hashedPassword,
                avatar: dto.avatar,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}