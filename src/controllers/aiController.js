const { GoogleGenAI } = require('@google/genai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const recommendPerfume = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Please provide a message' });
        }

        const perfumes = await prisma.product.findMany({
            where: { category: 'perfume' },
            select: { name: true, description: true, brand: true }
        });
        if (perfumes.length === 0) {
            return res.status(404).json({ error: 'No perfumes found in database to recommend.' });
        }

        const inventoryList = perfumes.map(p => `- ${p.name} by ${p.brand}: ${p.description}`).join('\n');

        const prompt = `You are an expert perfume assistant for the online cosmetics shop HerSmile.
        Your goal is to recommend exactly ONE perfume from our available inventory based on the user's request.

        Rules:
        1. Recommend ONLY perfumes listed in the inventory below.
        2. Return a short, friendly response mentioning the exact perfume name clearly.
        3. Remind the user they can search for this perfume name using the site search bar.

        Available Inventory:
            ${inventoryList}

            User Request: "${message}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: prompt,
        });

        res.json({
            reply: response.text
        });


    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate AI recommendation.' });
    }
}
module.exports = { recommendPerfume };