import { Controller, Get, Post, Patch, Delete, Body } from '@nestjs/common';
import { CategoryDto } from './dto/category-dto/category-dto';
import { QuizService } from './quiz.service';
import { QuizDto } from './dto/quiz-dto/quiz-dto';

@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get()
    getQuiz() {
        return { message: 'Quiz endpoint' };
    }

    @Get('questions')
    getQuestions() {
        return { message: 'Questions endpoint' };
    }

    @Post('/create')
    createQuiz(@Body() quizDto: QuizDto) {
        return this.quizService.createQuiz(quizDto);
    }

    @Patch('/update/:id')
    updateQuiz() {
        return { message: 'Update quiz endpoint' };
    }

    @Delete('/delete/:id')
    deleteQuiz() {
        return { message: 'Delete quiz endpoint' };
    }

    // category related endpoints:start
    @Get('categories')
    getCategories() {
        return this.quizService.getCategories();
    }

    @Post('categories')
    createCategories(@Body() categoryDto: CategoryDto) {
        return this.quizService.createCategories(categoryDto);
    }

    @Patch('categories/:id')
    updateCategories() {
        return { message: 'Categories endpoint' };
    }

    @Delete('categories/:id')
    deleteCategories() {
        return { message: 'Categories endpoint' };
    }
    // category related endpoints:end
}