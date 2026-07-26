import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login-dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LoginService {
    constructor(private readonly prisma: PrismaService) { }
    async loginUser(loginDto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: loginDto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, token: 'dummy-token' };
    }
}
