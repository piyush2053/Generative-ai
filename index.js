import express from 'express';
import bodyParser from 'body-parser';
import { genAI } from './genAi.js';
import cors from 'cors';
import multer from 'multer';
import path from 'path';

const app = express();
const port = process.env.PORT || 8090;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const handleError = (err, res) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
};

async function generateAIResponse(query, imagePath = null) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const imageParts = [];
    if (imagePath) {
        imageParts.push(fileToGenerativePart(imagePath, "image/jpeg"));
    }

    const { totalTokens } = await model.countTokens(query);
    console.log("Tokens count:", totalTokens);
    const result = await model.generateContent([query, ...imageParts]);
    const response = result.response;
    const text = response.text();
    return text;
}

app.post('/askai', upload.single('image'), async (req, res) => {
    const { query } = req.body;
    const imagePath = req.file ? req.file.path : null;

    if (!query) {
        return res.status(400).json({ message: 'Missing required field: query' });
    }

    try {
        const generatedResponse = await generateAIResponse(query, imagePath);
        res.json({ response: generatedResponse });
    } catch (error) {
        handleError(error, res);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
