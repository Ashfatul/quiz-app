import { IsArray, IsNotEmpty, IsString, IsEnum, IsInt } from "class-validator"
import { Difficulty } from '../../../../generated/prisma/enums';

export class QuizDto {
    @IsString()
    @IsNotEmpty()
    title!: string

    @IsString()
    description!: string

    @IsInt()
    category!: number

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
