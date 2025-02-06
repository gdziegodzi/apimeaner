import { checkPostCount } from '../middlewares/checkPostCount.middleware';
import Controller from '../interfaces/controller.interface';
import { Request, Response, NextFunction, Router } from 'express';
import Joi from 'joi';
import DataService from 'modules/services/data.service';

let testArr = [4,5,6,3,5,3,7,5,13,5,6,4,3,6,3,6];

class PostController implements Controller {

   public path = '/api/post';
   public router = Router(); 
   private posts: { id: number; content: string }[] = [];
   private idCounter: number = 1;
   private dataService: DataService;
   constructor(dataService:DataService) {
    this.dataService =dataService;
       this.initializeRoutes();
   }

   private initializeRoutes() {
    this.router.get('/api/post/get/:id', /* checkPostCount,*/ this.getElementById); // Pobranie wpisu po ID
    this.router.post('/api/post', this.addData); // Dodanie nowego wpisu
    this.router.delete('/api/post/:id', this.removePost); // Usunięcie wpisu po ID
    this.router.get('/api/post/num/:num', checkPostCount, this.getNPosts); // Pobranie N elementów
    this.router.get('/api/posts/get', this.getAllPosts); // Pobranie wszystkich elementów
    this.router.delete('/api/posts', this.deleteAllPosts); // Usunięcie wszystkich elementów
   }

// 2. Dodanie nowego wpisu
private addData = async (request: Request, response: Response, next: NextFunction) => {
    const {title, text, image} = request.body;
 
    const readingData = Joi.object({
        title: Joi.string().required(),
        text: Joi.string().required(),
        image: Joi.string().uri().required()
     });
 
    try {
        const validatedData = await readingData.validateAsync({title, text, image})
        await this.dataService.createPost(validatedData);
        response.status(200).json(validatedData);
    } catch (error) {
        console.log('eeee', error)
 
        console.error(`Validation Error: ${error.message}`);
        response.status(400).json({error: 'Invalid input data.'});
    }
 }
 
 private getElementById = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    const allData = await this.dataService.query({id});
    response.status(200).json(allData);
 }
 
 private removePost = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    await this.dataService.deleteData({_id: id});
    response.sendStatus(200);
 };

private getNPosts = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { num } = request.params;
        const parsedNum = parseInt(num);

        if (parsedNum <= 0) {
            return response.status(400).json({ message: 'Number must be greater than 0' });
        }

        const result = await this.dataService.query({},);
        response.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

private getAllPosts = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const allPosts = await this.dataService.query({});
        response.status(200).json(allPosts);
    } catch (error) {
        next(error);
    }
};

private deleteAllPosts = async (request: Request, response: Response, next: NextFunction) => {
    try {
        await this.dataService.deleteData({});
        response.status(200).json({ message: 'All posts deleted successfully' });
    } catch (error) {
        next(error);
    }
};
}


export default PostController;