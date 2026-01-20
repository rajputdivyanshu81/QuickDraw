import axios from "axios";
import { HTTP_BACKEND } from "@/config";

type Shape = ({
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    points: { x: number, y: number }[];
} | {
    type: "text";
    text: string;
    x: number;
    y: number;
}) & { id: string; color?: string };

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select";

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, initialTool: Tool, token: string) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let selectedTool: Tool = initialTool;
    let selectedColor: string = "black";
    const existingShapes: Shape[] = [];

    socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
            let shapeMessage;
            try {
                shapeMessage = JSON.parse(parsedData.message);
            } catch (e) {
                return;
            }

            const newShape = shapeMessage.shape;
            if (!newShape || !newShape.id) return;

            // Prevent duplicates
            if (existingShapes.some(s => s.id === newShape.id)) return;

            existingShapes.push(newShape);
            clearCanvas(existingShapes, canvas, ctx);
        } else if (parsedData.type === "delete_shape") {
            const shapeId = parsedData.shapeId;
            const index = existingShapes.findIndex(s => s.id === shapeId);
            if (index !== -1) {
                existingShapes.splice(index, 1);
            }
            clearCanvas(existingShapes, canvas, ctx);
        } else if (parsedData.type === "update_shape") {
            const updatedShape = parsedData.shape;
            const index = existingShapes.findIndex(s => s.id === updatedShape.id);
            if (index !== -1) {
                existingShapes[index] = updatedShape;
            } else {
                existingShapes.push(updatedShape);
            }
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    // Fetch history in background
    getExistingShapes(roomId, token).then(history => {
        history.forEach((shape: Shape) => {
            if (!existingShapes.some(s => s.id === shape.id)) {
                existingShapes.push(shape);
            }
        });
        clearCanvas(existingShapes, canvas, ctx);
    }).catch(e => {
        console.error("Failed to load history:", e);
    });


    let clicked = false;
    let startX = 0;
    let startY = 0;
    let currentPath: { x: number, y: number }[] = [];

    let selectedShape: Shape | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        clicked = true;
        startX = e.offsetX;
        startY = e.offsetY;

        if (selectedTool === "select") {
            selectedShape = findShapeAt(e.offsetX, e.offsetY);
            if (selectedShape) {
                if (selectedShape.type === "rect") {
                    dragOffsetX = e.offsetX - selectedShape.x;
                    dragOffsetY = e.offsetY - selectedShape.y;
                } else if (selectedShape.type === "circle") {
                    dragOffsetX = e.offsetX - selectedShape.centerX;
                    dragOffsetY = e.offsetY - selectedShape.centerY;
                } else if (selectedShape.type === "text") {
                    dragOffsetX = e.offsetX - selectedShape.x;
                    dragOffsetY = e.offsetY - selectedShape.y;
                } else if (selectedShape.type === "pencil") {
                    dragOffsetX = e.offsetX;
                    dragOffsetY = e.offsetY;
                }
            }
        } else if (selectedTool === "pencil") {
            currentPath = [{ x: startX, y: startY }];
        } else if (selectedTool === "eraser") {
            eraseAt(e.offsetX, e.offsetY);
        } else if (selectedTool === "text") {
            clicked = false;
            const input = document.createElement("textarea");
            input.style.position = "fixed";
            input.style.left = `${e.clientX}px`;
            input.style.top = `${e.clientY}px`;
            input.style.background = "white";
            input.style.border = "1px solid #6366f1";
            input.style.borderRadius = "4px";
            input.style.outline = "none";
            input.style.font = "20px Arial";
            input.style.color = "black";
            input.style.padding = "4px";
            input.style.margin = "0";
            input.style.resize = "none";
            input.style.overflow = "hidden";
            input.style.whiteSpace = "nowrap";
            input.style.zIndex = "1000";
            input.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1)";

            input.onmousedown = (e) => e.stopPropagation();
            input.onmouseup = (e) => e.stopPropagation();
            input.onmousemove = (e) => e.stopPropagation();

            document.body.appendChild(input);
            setTimeout(() => input.focus(), 0);

            const handleBlur = () => {
                const text = input.value.trim();
                if (text) {
                    const newShape: Shape = {
                        type: "text",
                        id: Math.random().toString(36).substring(2, 9),
                        text,
                        x: e.offsetX,
                        y: e.offsetY,
                        color: selectedColor
                    };
                    existingShapes.push(newShape);
                    socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ shape: newShape }),
                        roomId
                    }));
                    clearCanvas(existingShapes, canvas, ctx);
                }
                document.body.removeChild(input);
            };

            input.onblur = handleBlur;
            input.onkeydown = (event) => {
                if (event.key === "Enter") {
                    input.blur();
                }
            };
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false;
        let shape: Shape | null = null;
        const width = e.offsetX - startX;
        const height = e.offsetY - startY;

        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                id: Math.random().toString(36).substring(2, 9),
                x: startX,
                y: startY,
                width: width,
                height: height,
                color: selectedColor
            };
        } else if (selectedTool === "circle") {
            const radius = Math.sqrt(width * width + height * height);
            shape = {
                type: "circle",
                id: Math.random().toString(36).substring(2, 9),
                centerX: startX,
                centerY: startY,
                radius: radius,
                color: selectedColor
            };
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                id: Math.random().toString(36).substring(2, 9),
                points: currentPath,
                color: selectedColor
            };
        }

        if (selectedTool === "select" && selectedShape) {
            socket.send(JSON.stringify({
                type: "update_shape",
                shape: selectedShape,
                roomId
            }));
            selectedShape = null;
        }

        if (shape) {
            existingShapes.push(shape);
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }));
            clearCanvas(existingShapes, canvas, ctx);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (clicked) {
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = 2;

            if (selectedTool === "rect") {
                ctx.strokeRect(startX, startY, width, height);
            } else if (selectedTool === "circle") {
                const radius = Math.sqrt(width * width + height * height);
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (selectedTool === "pencil") {
                currentPath.push({ x: e.offsetX, y: e.offsetY });
                ctx.beginPath();
                ctx.moveTo(currentPath[0].x, currentPath[0].y);
                for (let i = 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i].x, currentPath[i].y);
                }
                ctx.stroke();
            } else if (selectedTool === "eraser") {
                eraseAt(e.offsetX, e.offsetY);
            } else if (selectedTool === "select" && selectedShape) {
                if (selectedShape.type === "rect") {
                    selectedShape.x = e.offsetX - dragOffsetX;
                    selectedShape.y = e.offsetY - dragOffsetY;
                } else if (selectedShape.type === "circle") {
                    selectedShape.centerX = e.offsetX - dragOffsetX;
                    selectedShape.centerY = e.offsetY - dragOffsetY;
                } else if (selectedShape.type === "text") {
                    selectedShape.x = e.offsetX - dragOffsetX;
                    selectedShape.y = e.offsetY - dragOffsetY;
                } else if (selectedShape.type === "pencil") {
                    const diffX = e.offsetX - dragOffsetX;
                    const diffY = e.offsetY - dragOffsetY;
                    selectedShape.points = selectedShape.points.map(p => ({
                        x: p.x + diffX,
                        y: p.y + diffY
                    }));
                    dragOffsetX = e.offsetX;
                    dragOffsetY = e.offsetY;
                }
                clearCanvas(existingShapes, canvas, ctx);
            }
        }
    };

    const findShapeAt = (x: number, y: number): Shape | null => {
        const threshold = 10;
        for (let i = existingShapes.length - 1; i >= 0; i--) {
            const shape = existingShapes[i];
            if (shape.type === "rect") {
                const minX = Math.min(shape.x, shape.x + shape.width);
                const maxX = Math.max(shape.x, shape.x + shape.width);
                const minY = Math.min(shape.y, shape.y + shape.height);
                const maxY = Math.max(shape.y, shape.y + shape.height);
                if (x >= minX - threshold && x <= maxX + threshold && y >= minY - threshold && y <= maxY + threshold) return shape;
            } else if (shape.type === "circle") {
                const dist = Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2));
                if (Math.abs(dist - shape.radius) < threshold || dist < shape.radius) return shape;
            } else if (shape.type === "pencil") {
                if (shape.points.some(p => Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2)) < threshold)) return shape;
            } else if (shape.type === "text") {
                const width = ctx.measureText(shape.text).width;
                const height = 20;
                if (x >= shape.x && x <= shape.x + width && y >= shape.y - height && y <= shape.y) return shape;
            }
        }
        return null;
    };

    const eraseAt = (x: number, y: number) => {
        const threshold = 10;
        const shapeToErace = existingShapes.find(shape => {
            if (shape.type === "rect") {
                const minX = Math.min(shape.x, shape.x + shape.width);
                const maxX = Math.max(shape.x, shape.x + shape.width);
                const minY = Math.min(shape.y, shape.y + shape.height);
                const maxY = Math.max(shape.y, shape.y + shape.height);
                return x >= minX - threshold && x <= maxX + threshold && y >= minY - threshold && y <= maxY + threshold;
            } else if (shape.type === "circle") {
                const dist = Math.sqrt(Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2));
                return Math.abs(dist - shape.radius) < threshold || dist < shape.radius;
            } else if (shape.type === "pencil") {
                return shape.points.some(p => Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2)) < threshold);
            } else if (shape.type === "text") {
                const width = ctx.measureText(shape.text).width;
                const height = 20;
                return x >= shape.x && x <= shape.x + width && y >= shape.y - height && y <= shape.y;
            }
            return false;
        });

        if (shapeToErace) {
            const index = existingShapes.findIndex(s => s.id === shapeToErace.id);
            if (index !== -1) {
                existingShapes.splice(index, 1);
            }
            socket.send(JSON.stringify({
                type: "delete_shape",
                shapeId: shapeToErace.id,
                roomId
            }));
            clearCanvas(existingShapes, canvas, ctx);
        }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);

    return {
        updateTool: (newTool: Tool) => {
            selectedTool = newTool;
        },
        updateColor: (newColor: string) => {
            selectedColor = newColor;
        },
        cleanup: () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
        }
    };
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    existingShapes.forEach((shape) => {
        ctx.strokeStyle = shape.color || "black";
        ctx.lineWidth = 2;
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === "pencil") {
            if (shape.points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
                ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
        } else if (shape.type === "text") {
            ctx.font = "20px Arial";
            ctx.fillStyle = shape.color || "black";
            ctx.fillText(shape.text, shape.x, shape.y);
        }
    });
}

async function getExistingShapes(roomId: string, token: string) {
    try {
        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
            headers: {
                "Authorization": token
            }
        });
        const messages = res.data.messages;
        const shapes = messages.map((x: { message: string }) => {
            const messagedData = JSON.parse(x.message);
            const shape = messagedData.shape;
            if (shape && !shape.id) {
                shape.id = Math.random().toString(36).substring(2, 9);
            }
            return shape;
        });
        return shapes;
    } catch (e) {
        console.error("Failed to fetch existing shapes", e);
        return [];
    }
}
