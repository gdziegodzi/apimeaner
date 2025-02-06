
import dotenv from 'dotenv';

dotenv.config(); 

export const config = {
    port: process.env.PORT || 3100,
    supportedPostCount: 15,
    jwtSecret: process.env.JWT_SECRET || 'defaultSecretKey',
    databaseUrl: process.env.MONGODB_URI || 'mongodb+srv://techweb:dNhO0lOvE79jys2h@cluster0.ooees.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
 };