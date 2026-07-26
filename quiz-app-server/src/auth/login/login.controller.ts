import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login-dto/login.dto';
import { LoginService } from './login.service';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) {}
    @Post()
    async loginUser(@Body() LoginDto: LoginDto) {
        return this.loginService.loginUser(LoginDto);
    }
}
