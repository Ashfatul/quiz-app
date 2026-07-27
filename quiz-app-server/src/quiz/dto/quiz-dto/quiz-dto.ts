import { IsArray, IsNotEmpty, IsString, IsEnum, IsInt, IsOptional } from "class-validator"
import { Difficulty } from '../../../../generated/prisma/enums';

export class QuizDto {
    @IsString()
    @IsNotEmpty()
    title!: string

    @IsString()
    description!: string

    @IsString()
    @IsOptional()
    category?: string

    @IsString()
    @IsOptional()
    categoryId?: string

    @IsEnum(Difficulty)
    difficulty!: Difficulty

    @IsInt()
    timeLimit!: number

    @IsArray()
    questions!: {
        text: string
        options: string[]
        correctOptionIndex: number
    }[]
}

