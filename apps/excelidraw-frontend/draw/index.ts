import axios from "axios";
import { HTTP_BACKEND } from "@/config";
type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} |{
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
}

export default async function initDraw(canvas : HTMLCanvasElement,roomId : string,socket: WebSocket) {
const ctx = canvas.getContext("2d");



 const  existingShapes : Shape[] = await getExistingShapes(roomId);

    if (!ctx) return;

    socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type == "chat") {
            existingShapes.push(JSON.parse(parsedData.shape));
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    clearCanvas(existingShapes, canvas, ctx);
    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener('mousedown', (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener('mouseup', (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;
      existingShapes.push({
          type: "rect",
          x: startX,
          y: startY,
          width: width,
          height: height,
      });
      existingShapes.push(shape);
      socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId

      }));
    });

    canvas.addEventListener('mousemove', (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            // Draw white stroke
            ctx.strokeStyle = "white";
            ctx.strokeRect(startX, startY, width, height);
        }
    });
}


function clearCanvas(existingShapes : Shape[], canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    existingShapes.map((shape) => {
        if (shape.type === "rect") {
            ctx.strokeStyle = "white";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    });
}



  async function getExistingShapes(roomId: string){
  const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message:string})=>{
        const messagedData = JSON.parse(x.message);
        return messagedData.shape;
    })
    return shapes;
}
