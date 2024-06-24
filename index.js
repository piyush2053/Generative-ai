import express from 'express';
import bodyParser from 'body-parser';
import { genAI } from './genAi.js';
import fs from 'fs';


const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const handleError = (err, res) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
};


async function generateAIResponse(query, imageUrl = null) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // const image = {
    //     inlineData: {
    //         data: Buffer.from(fs.readFileSync("cookie.png")).toString("base64"),
    //         mimeType: "image/png",
    //     },
    // };

  
    const { totalTokens } = await model.countTokens(query);
    console.log("Tokens count:", totalTokens);
    const result = await model.generateContent(query);
    const response = result.response;
    const text = response.text();
    return text
}

app.get('/askai', async (req, res) => {
    const { query, imageUrl } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Missing required field: query' });
    }

    try {
        const generatedResponse = await generateAIResponse(query, imageUrl);
        res.json({ response: generatedResponse });
    } catch (error) {
        handleError(error, res);
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
