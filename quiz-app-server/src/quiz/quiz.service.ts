import { Injectable } from '@nestjs/common';
import { CategoryDto } from './dto/category-dto/category-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizDto } from './dto/quiz-dto/quiz-dto';

@Injectable()
export class QuizService {
    constructor(private readonly prisma: PrismaService) { }
    getQuiz() {
        return { message: 'Quiz endpoint' };
    }

    getQuestions() {
        return { message: 'Questions endpoint' };
    }

    createQuiz(quizDto: QuizDto) {
        return this.prisma.quiz.create({
            data: {
                title: quizDto.title,
                description: quizDto.description,
                category: quizDto.category,
                difficulty: quizDto.difficulty,
                timeLimit: quizDto.timeLimit,
                questions: {
                    create: quizDto.questions.map((question) => ({
                        text: question.text,
                        options: {
                            create: question.options.map((option) => ({
                                text: option,
                            })),
                        },
                        correctOptionIndex: question.correctOptionIndex,
                    })),
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                difficulty: true,
                timeLimit: true,
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: {
                            select: {
                                id: true,
                                text: true,
                            },
                        },
                        correctOptionIndex: true,
                    },
                },
            },
        });
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