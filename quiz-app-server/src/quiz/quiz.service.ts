import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoryDto } from './dto/category-dto/category-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { QuizDto } from './dto/quiz-dto/quiz-dto';

@Injectable()
export class QuizService {
    constructor(private readonly prisma: PrismaService) { }

    async getQuizzes(search?: string, categoryId?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }

        return this.prisma.quiz.findMany({
            where,
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                timeLimit: true,
                numberOfQuestions: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    getQuestions() {
        return { message: 'Questions endpoint' };
    }

    async createQuiz(quizDto: QuizDto) {
        const categoryId = quizDto.categoryId || quizDto.category;
        if (!categoryId) {
            throw new BadRequestException('Category ID is required');
        }

        const quiz = await this.prisma.quiz.create({
            data: {
                title: quizDto.title,
                description: quizDto.description,
                categoryId: categoryId,
                difficulty: quizDto.difficulty,
                timeLimit: quizDto.timeLimit,
                numberOfQuestions: quizDto.questions.length,
                questions: {
                    create: quizDto.questions.map((question) => ({
                        title: question.text,
                        option0: question.options[0] || '',
                        option1: question.options[1] || '',
                        option2: question.options[2] || '',
                        option3: question.options[3] || '',
                        correctOptionIndex: String(question.correctOptionIndex),
                    })),
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                timeLimit: true,
                numberOfQuestions: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                questions: {
                    select: {
                        id: true,
                        title: true,
                        option0: true,
                        option1: true,
                        option2: true,
                        option3: true,
                        correctOptionIndex: true,
                    },
                },
            },
        });

        return {
            ...quiz,
            questions: quiz.questions.map((q) => ({
                id: q.id,
                text: q.title,
                options: [q.option0, q.option1, q.option2, q.option3],
                correctOptionIndex: Number(q.correctOptionIndex),
            })),
        };
    }

    async getQuizDetails(id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                timeLimit: true,
                numberOfQuestions: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
                questions: {
                    select: {
                        id: true,
                        title: true,
                        option0: true,
                        option1: true,
                        option2: true,
                        option3: true,
                    },
                },
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        return {
            ...quiz,
            questions: quiz.questions.map((q) => ({
                id: q.id,
                text: q.title,
                options: [q.option0, q.option1, q.option2, q.option3],
            })),
        };
    }

    updateQuiz() {
        return { message: 'Update quiz endpoint' };
    }

    async deleteQuiz(id: string) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id },
        });
        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }
        await this.prisma.quiz.delete({
            where: { id },
        });
        return { success: true };
    }

    async submitQuizAttempt(quizId: string, submissionDto: { answers: { questionId: string; selectedOptionIndex: number }[] }) {
        const quiz = await this.prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true,
            },
        });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        let score = 0;
        const answersReview = quiz.questions.map((question) => {
            const userAnswer = submissionDto.answers?.find(
                (ans) => String(ans.questionId) === question.id
            );
            const selectedOptionIndex = userAnswer !== undefined ? userAnswer.selectedOptionIndex : -1;
            const correctOptionIndex = Number(question.correctOptionIndex);
            const isCorrect = selectedOptionIndex === correctOptionIndex;

            if (isCorrect) {
                score++;
            }

            return {
                questionId: question.id,
                text: question.title,
                selectedOptionIndex,
                correctOptionIndex,
                isCorrect,
            };
        });

        const totalQuestions = quiz.questions.length;
        const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(1)) : 0;

        return {
            attemptId: Math.floor(Math.random() * 1000000),
            score,
            totalQuestions,
            percentage,
            answersReview,
        };
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