import  UserModel  from '../schemas/user.schema';
import {IUser} from "../models/user.model";
import bcrypt from 'bcrypt';
import { IPassword } from '../models/password.model';
import PasswordService from './password.service';

class UserService {
private passwordService: PasswordService;
   public async createNewOrUpdate(user: IUser) {
       console.log(user)
       try {
           if (!user._id) {
               const dataModel = new UserModel(user);
               return await dataModel.save();
           } else {
               return await UserModel.findByIdAndUpdate(user._id, { $set: user }, { new: true });
           }
       } catch (error) {
           console.error('Wystąpił błąd podczas tworzenia danych:', error);
           throw new Error('Wystąpił błąd podczas tworzenia danych');
       }
   }

   public async getByEmailOrName(name: string) {
       try {
           const result = await UserModel.findOne({ $or: [{ email: name }, { name: name }] });
           if (result) {
               return result;
           }
       } catch (error) {
           console.error('Wystąpił błąd podczas pobierania danych:', error);
           throw new Error('Wystąpił błąd podczas pobierania danych');
       }
   } 

   public async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<string> {
    try {
        // 🔹 Sprawdzenie poprawności obecnego hasła
        const isPasswordValid = await this.passwordService.authorize(userId, currentPassword);
        if (!isPasswordValid) {
            throw new Error('Aktualne hasło jest niepoprawne.');
        }

        // 🔹 Aktualizacja na nowe zahashowane hasło
        await this.passwordService.createOrUpdate({ userId, password: newPassword });

        return 'Hasło zostało pomyślnie zmienione.';
    } catch (error) {
        console.error('Błąd podczas zmiany hasła:', error);
        throw new Error('Nie udało się zmienić hasła.');
    }
}
}



export default UserService;

