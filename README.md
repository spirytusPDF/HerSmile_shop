Team Project HerSmile
-


Description: a full-stack online makeup and perfume shop
with an AI perfume assistant.

Team Structure:
-
- Team Lead - Yelyzaveta Kukharenko
- Backend Manager - Yelyzaveta Kukharenko
- QA/Testing - Victoria Kalnyk
- Frontend/UI - Ira Zhuchkova

Tech Stack:
-
- Node.js
- Express
- PostgreSQL (+Neon cloud)
- Prisma ORM
- Vanilla HTML/CSS/JS
- Gemini AI API

Local Setup Instructions:
-
1. git clone 
2. npm install (for Express, Prisma, bcrypt)
3. create an .env file:
   DATABASE_URL=_"postgresql://neondb_owner:npg_BgHMnch9R2fr@ep-rough-paper-b1g65zhi-pooler.c-5.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"_
   GEMINI_API_KEY=~~"AQ.Ab8RN6J2rlZIM2EkhkIESbOsUDPUCSst9xmaxJEbmk9C2Ux09g"~~;
4. npx prisma generate (in prisma folder)
5. npm start to launch on localhost3000


