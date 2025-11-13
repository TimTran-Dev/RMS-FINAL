// config/database.js
import 'dotenv/config';

export const url = process.env.MONGO_URI;
export const dbName = process.env.DB_NAME || "ratemyschool";