import dotenv from "dotenv";
dotenv.config();

// Default dev port: align with client expectations (client defaults to http://localhost:3000/api)
export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

