import { WebSocketServer , WebSocket } from 'ws';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from '@repo/db/client';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws,request) {
    const url = request.url;
        if(!url){
            return;
        }
        const queryParams = new URLSearchParams(url.split('?')[1]);
        const token = queryParams.get('token')|| "";
        const decoded = jwt.verify(token, JWT_SECRET);
// same as the roulette of 100xdevs

if(!(decoded as JwtPayload).userId || !decoded){
    ws.close();
    return;
}

    ws.on('message', function message(data) {
        ws.send('pong');  
    });


});