import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { RegisterService } from './register.service';

@Controller('register')
export class RegisterController {
    constructor(private readonly registerService: RegisterService) {}

    @Post()
    async registerUser(@Body() registerUserDto: RegisterUserDto) {
        return { ...this.registerService.registerUser(registerUserDto) };
    }
}
