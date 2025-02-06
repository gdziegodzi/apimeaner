import express, { NextFunction } from 'express';
import { config } from './config'
import Controller from './interfaces/controller.interface';
import IndexController from './controllers/index.controller';
import PostController from './controllers/post.controller';
import mongoose from 'mongoose';
import DataService from './modules/services/data.service';
import UserController from './controllers/user.controller';

const dataService = new DataService(); 
class App {
    public app: express.Application; 
    
    
    constructor() {
        this.app = express(); 
        const controllers: Controller[] = [
            new UserController(),
            new IndexController(),
            new PostController(dataService),
        ];
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
        this.connectToDatabase();
     }
     private initializeMiddlewares(): void {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: true }));
      this.app.use(this.requestLogger.bind(this));
  

}
private requestLogger(req: Request, res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}


     
 
    private initializeControllers(controllers: Controller[]): void {
        controllers.forEach((controller) => {
            this.app.use('/', controller.router);
        });
    }
 
    public listen(): void {
        this.app.listen(config.port, () => {
            console.log(`App listening on the port ${config.port}`);
        });
    }
    private async connectToDatabase(): Promise<void> {
        try {
          await mongoose.connect(config.databaseUrl);
          console.log('Connection with database established');
        } catch (error) {
          console.error('Error connecting to MongoDB:', error);
        }
       
        mongoose.connection.on('error', (error) => {
          console.error('MongoDB connection error:', error);
        });
       
        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
        });
       
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('MongoDB connection closed due to app termination');
          process.exit(0);
        });
       
        process.on('SIGTERM', async () => {
          await mongoose.connection.close();
          console.log('MongoDB connection closed due to app termination');
          process.exit(0);
        });
       }
       
 }
 
 export default App;
 
