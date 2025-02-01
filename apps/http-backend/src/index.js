"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@repo/backend-common/config");
const middleware_js_1 = require("./middleware.js");
const types_1 = require("@repo/common/types");
const client_1 = require("@repo/db/client");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/signup", async (req, res) => {
    const parsedData = types_1.CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error);
        res.json({
            message: "Incorrect inputs"
        });
        return;
    }
    try {
        const user = await client_1.prismaClient.user.create({
            data: {
                email: parsedData.data?.username,
                // TODO: Hash the pw
                password: parsedData.data.password,
                name: parsedData.data.name
            }
        });
        res.json({
            userId: user.id
        });
    }
    catch (e) {
        res.status(411).json({
            message: "User already exists with this username"
        });
    }
});
app.post("/signin", async (req, res) => {
    const parsedData = types_1.SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        });
        return;
    }
    // TODO: Compare the hashed pws here
    const user = await client_1.prismaClient.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password
        }
    });
    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user?.id
    }, config_1.JWT_SECRET);
    res.json({
        token
    });
});
app.post("/room", middleware_js_1.middleware, (req, res) => {
    const data = types_1.CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.json({
            message: "Incorrect Inputs"
        });
        return;
    }
    res.json({
        roomId: "123"
    });
});
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
