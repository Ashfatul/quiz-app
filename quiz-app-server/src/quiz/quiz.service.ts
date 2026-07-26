import { Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category-dto/category-dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuizService {
    constructor(private readonly prisma: PrismaService) { }
    getQuiz() {
        return { message: 'Quiz endpoint' };
    }

    getQuestions() {
        return { message: 'Questions endpoint' };
    }

    createQuiz() {
        return { message: 'Create quiz endpoint' };
    }

    updateQuiz() {
        return { message: 'Update quiz endpoint' };
    }

    deleteQuiz() {
        return { message: 'Delete quiz endpoint' };
    }

    getCategories(){
        return this.prisma.category.findMany({
            select: {
                id: true,
                name: true,
                description: true
            },
        });
    }

    createCategories(categoryDto: CategoryDto) {
        return this.prisma.category.create({
            data: {
                name: categoryDto.name,
                description: categoryDto.description
            },
            select: {
                id: true,
                name: true,
                description: true
            },
        });
    }
}