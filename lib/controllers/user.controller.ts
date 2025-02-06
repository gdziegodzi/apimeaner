import Controller from '../interfaces/controller.interface';
import {Request, Response, NextFunction, Router} from 'express';
import {auth} from '../middlewares/auth.middleware';
import {admin} from '../middlewares/admin.middleware';
import UserService from "../modules/services/user.service";
import PasswordService from "../modules/services/password.service";
import TokenService from '../modules/services/token.service';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import bcrypt from 'bcrypt';

class UserController implements Controller {
   public path = '/api/user';
   public router = Router();
   private userService = new UserService();
   private passwordService = new PasswordService();
   private tokenService = new TokenService();

   constructor() {
       this.initializeRoutes();
   }

   private initializeRoutes() {
       this.router.post(`${this.path}/create`, this.createNewOrUpdate);
       this.router.post(`${this.path}/auth`, this.authenticate);
       this.router.delete(`${this.path}/logout/:userId`, auth, this.removeHashSession);
       //this.router.post('/api/user/reset-password', this.resetPassword);
       //this.router.patch('/api/user/change-password', auth, this.changePassword);
   }
   private authenticate = async (request: Request, response: Response, next: NextFunction) => {
    const {login, password} = request.body;
 
    try {
        const user = await this.userService.getByEmailOrName(login);
        if (!user) {
            response.status(401).json({error: 'Unauthorized'});
        }
        await this.passwordService.authorize(user.id, await this.passwordService.hashPassword(password));
        const token = await this.tokenService.create(user);
        response.status(200).json(this.tokenService.getToken(token));
    } catch (error) {
        console.error(`Validation Error: ${error.message}`);
        response.status(401).json({error: 'Unauthorized'});
    }
 };
 
 private createNewOrUpdate = async (request: Request, response: Response, next: NextFunction) => {
    const userData = request.body;
    try {
        const user = await this.userService.createNewOrUpdate(userData);
        if (userData.password) {
            const hashedPassword = await this.passwordService.hashPassword(userData.password)
            await this.passwordService.createOrUpdate({
                userId: user._id,
                password: hashedPassword
            });
        }
        response.status(200).json(user);
    } catch (error) {
        console.error(`Validation Error: ${error.message}`);
        response.status(400).json({error: 'Bad request', value: error.message});
    }
 
 };
 
 
 private removeHashSession = async (request: Request, response: Response, next: NextFunction) => {
    const {userId} = request.params
 
    try {
        const result = await this.tokenService.remove(userId);
        response.status(200).send(result);
    } catch (error) {
        console.error(`Validation Error: ${error.message}`);
        response.status(401).json({error: 'Unauthorized'});
    }
 }; 
 private changePassword = async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.id; 

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Wymagane aktualne i nowe hasło.' });
    }

    try {
        const message = await this.userService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

}

export default UserController;
