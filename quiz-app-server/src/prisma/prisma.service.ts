
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaPg(
            new Pool({
                connectionString: process.env.DATABASE_URL,
            }),
        );

        super({ adapter });
    }
}
