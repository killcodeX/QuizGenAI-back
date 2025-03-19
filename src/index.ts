import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    const users = await prisma.user.findMany();
    res.json(users);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
