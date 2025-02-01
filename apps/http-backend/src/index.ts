import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware.js';
import { CreateUserSchema,SignInSchema,CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from '@repo/db/client';


const app = express();

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        })
        res.json({
            userId: user.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})


app.post("/signin", (req, res) => {

    const data = SignInSchema.safeParse(req.body);
    if(!data.success){
       res.json({
            message:"Incorrect Inputs"
        })
        return;
    }


    const userId = 1;
    const token = jwt.sign({ userId }, JWT_SECRET);

    res.json({
        token
    });
});


app.post("/room", middleware, (req, res) => {


    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
       res.json({
            message:"Incorrect Inputs"
        })
        return;
    }
    res.json({
        roomId:"123"
    })
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});