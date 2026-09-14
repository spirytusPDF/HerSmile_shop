const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const signup = async (req, res) => {
    try {
        const {login, password} = req.body;

        //encryption for safety
        const existingUser =
            await prisma.user.findFirst({ where: { login } });

        if (existingUser) {
            return res.status(400).json({ error: "Account already exists. Please log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data:{
                login,
                password: hashedPassword,
                cart: {create:{}}
            }
        });
        res.status(201).json({message: 'User successfully created!', userId:newUser.id});
    }
    catch (error) {
        console.log(error);
        res.status(500).json({message: 'Failed to create user'});
    }
}


const login = async (req, res) => {
    try{
        const{login, password}=req.body;
        const user = await prisma.user.findFirst({ where: { login } });
        if (!user) {
            return res.status(404).json({ error: "Account doesn't exist. Please sign up." });
        }

        const isPasswordvalid = await bcrypt.compare(password, user.password);
        if(!isPasswordvalid) {
            return res.status(400).json({ error: 'User or password not match' });
        }

        res.json({
            message:"Successfully logged in",
            user:{
                id: user.id,
                login: user.login,
            }
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ error: 'Failed to login' });
    }
}

module.exports = {
    login,
    signup
}