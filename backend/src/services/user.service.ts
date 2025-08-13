import { UserModel } from "../models/user.model";
import { User, RegisterDTO, LoginDTO } from "../types/user.type";
import bcrypt from 'bcryptjs';
import { createError } from "../errors/app.error";
import { generateToken } from "../utils/jwt.util";

export class UserService {
    static async register(userData: RegisterDTO): Promise<{user: User, token: string}> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        const result = await UserModel.create({
            email: userData.email,
            password: hashedPassword,
            name: userData.name
        })

        if (result.changes === 0) {
            throw createError.createFailed('계정');
        }

        const createdUser = await UserModel.findById(Number(result.lastInsertRowid));
        if (!createdUser) {
            throw createError.notFound("생성된 계정");
        }

        const token = generateToken(createdUser.id!);

        return {user: createdUser, token: token};
    }

    static async login(userData: LoginDTO): Promise<{user: User, token: string}> {
        const validUser = await UserModel.findByEmail(userData.email);
        if (!validUser) {
            throw createError.notFound('이메일');
        }

        const isValidPassword = await this.verifyPassword(userData.password, validUser.password);
        if (!isValidPassword) {
            throw createError.unauthorized();
        }

        const token = generateToken(validUser.id!);

        return {user: validUser, token: token};
    }

    static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}