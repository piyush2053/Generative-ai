import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from 'dotenv';

dotenv.config()
export const genAI = new GoogleGenerativeAI(process.env.GENERATIVE_AI_API_KEY);