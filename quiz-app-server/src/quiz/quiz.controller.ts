import { Controller, Get, Post, Patch, Delete, Body, Query, Param } from '@nestjs/common';
import { CategoryDto } from './dto/category-dto/category-dto';
import { QuizService } from './quiz.service';
import { QuizDto } from './dto/quiz-dto/quiz-dto';

@Controller()
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get('quiz')
    getQuizzes(
        @Query('search') search?: string,
        @Query('category') category?: string,
    ) {
        return this.quizService.getQuizzes(search, category);
    }

    @Get('quiz/questions')
    getQuestions() {
        return this.quizService.getQuestions();
    }

    // category related endpoints:start
    @Get('quiz/categories')
    getCategories() {
        return this.quizService.getCategories();
    }

    @Post('quiz/categories')
    createCategories(@Body() categoryDto: CategoryDto) {
        return this.quizService.createCategories(categoryDto);
    }

    @Patch('quiz/categories/:id')
    updateCategories() {
        return { message: 'Categories endpoint' };
    }

    @Delete('quiz/categories/:id')
    deleteCategories() {
        return { message: 'Categories endpoint' };
    }
    // category related endpoints:end

    @Get('quiz/:id')
    getQuizDetails(@Param('id') id: string) {
        return this.quizService.getQuizDetails(id);
    }

    @Post('quiz/create')
    createQuiz(@Body() quizDto: QuizDto) {
        return this.quizService.createQuiz(quizDto);
    }

    @Patch('quiz/update/:id')
    updateQuiz() {
        return { message: 'Update quiz endpoint' };
    }

    @Delete('quiz/delete/:id')
    deleteQuiz(@Param('id') id: string) {
        return this.quizService.deleteQuiz(id);
    }

    @Post('quizzes/:id/attempts')
    submitQuizAttempt(
        @Param('id') id: string,
        @Body() body: { answers: { questionId: string; selectedOptionIndex: number }[] }
    ) {
        return this.quizService.submitQuizAttempt(id, body);
    }
}