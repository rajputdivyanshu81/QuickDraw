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
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}) & { id: string; color?: string };

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select" | "line";

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, initialTool: Tool, token: string, onZoomChange?: (scale: number) => void, initialBackgroundColor: string = "#ffffff") {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let selectedTool: Tool = initialTool;
    let selectedColor: string = "black";
    let backgroundColor: string = initialBackgroundColor;
    const existingShapes: Shape[] = [];

    // Camera state
    let camera = { x: 0, y: 0, scale: 1 };

    // ... (rest of helper functions: screenToWorld, worldToScreen)

    const screenToWorld = (x: number, y: number) => {
        return {
            x: (x - camera.x) / camera.scale,
            y: (y - camera.y) / camera.scale
        };
    };

    const worldToScreen = (x: number, y: number) => {
        return {
            x: x * camera.scale + camera.x,
            y: y * camera.scale + camera.y
        };
    };

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

            if (existingShapes.some(s => s.id === newShape.id)) return;

            existingShapes.push(newShape);
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        } else if (parsedData.type === "delete_shape") {
            const shapeId = parsedData.shapeId;
            const index = existingShapes.findIndex(s => s.id === shapeId);
            if (index !== -1) {
                existingShapes.splice(index, 1);
            }
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        } else if (parsedData.type === "update_shape") {
            const updatedShape = parsedData.shape;
            const index = existingShapes.findIndex(s => s.id === updatedShape.id);
            if (index !== -1) {
                existingShapes[index] = updatedShape;
            } else {
                existingShapes.push(updatedShape);
            }
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        }
    }

    getExistingShapes(roomId, token).then(history => {
        history.forEach((shape: Shape) => {
            if (!existingShapes.some(s => s.id === shape.id)) {
                existingShapes.push(shape);
            }
        });
        clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
    }).catch((e: any) => {
        console.error("Failed to fetch existing shapes", e);
        if (e.response) {
            console.error("Error response data:", e.response.data);
            console.error("Error status:", e.response.status);
        }
    });

    // History for Undo/Redo
    type Operation =
        | { type: "add"; shape: Shape }
        | { type: "delete"; shape: Shape }
        | { type: "update"; oldShape: Shape; newShape: Shape };

    const undoStack: Operation[] = [];
    const redoStack: Operation[] = [];

    const addToHistory = (op: Operation) => {
        undoStack.push(op);
        redoStack.length = 0; // Clear redo stack on new action
    };

    // ... (socket, getExistingShapes unchanged) ...

    let clicked = false;
    let startX = 0;
    let startY = 0;
    let currentPath: { x: number, y: number }[] = [];

    let selectedShape: Shape | null = null;
    let startDragShape: Shape | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            return;
        }

        clicked = true;
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        startX = worldPos.x;
        startY = worldPos.y;

        if (selectedTool === "select") {
            selectedShape = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx);
            if (selectedShape) {
                // Deep copy for undo history
                startDragShape = JSON.parse(JSON.stringify(selectedShape));

                if (selectedShape.type === "rect") {
                    dragOffsetX = worldPos.x - selectedShape.x;
                    dragOffsetY = worldPos.y - selectedShape.y;
                } else if (selectedShape.type === "circle") {
                    dragOffsetX = worldPos.x - selectedShape.centerX;
                    dragOffsetY = worldPos.y - selectedShape.centerY;
                } else if (selectedShape.type === "text") {
                    dragOffsetX = worldPos.x - selectedShape.x;
                    dragOffsetY = worldPos.y - selectedShape.y;
                } else if (selectedShape.type === "pencil") {
                    dragOffsetX = worldPos.x;
                    dragOffsetY = worldPos.y;
                } else if (selectedShape.type === "line") {
                    dragOffsetX = worldPos.x - selectedShape.startX;
                    dragOffsetY = worldPos.y - selectedShape.startY;
                }
            }
        } else if (selectedTool === "pencil") {
            currentPath = [{ x: worldPos.x, y: worldPos.y }];
        } else if (selectedTool === "eraser") {
            const shapeToErace = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx);
            if (shapeToErace) {
                const index = existingShapes.findIndex(s => s.id === shapeToErace.id);
                if (index !== -1) {
                    existingShapes.splice(index, 1);
                    addToHistory({ type: "delete", shape: shapeToErace });
                }
                socket.send(JSON.stringify({
                    type: "delete_shape",
                    shapeId: shapeToErace.id,
                    roomId
                }));
                clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
            }
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
                        x: worldPos.x,
                        y: worldPos.y,
                        color: selectedColor
                    };
                    existingShapes.push(newShape);
                    addToHistory({ type: "add", shape: newShape });
                    socket.send(JSON.stringify({
                        type: "chat",
                        message: JSON.stringify({ shape: newShape }),
                        roomId
                    }));
                    clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
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
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        const width = worldPos.x - startX;
        const height = worldPos.y - startY;

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
        } else if (selectedTool === "line") {
            shape = {
                type: "line",
                id: Math.random().toString(36).substring(2, 9),
                startX: startX,
                startY: startY,
                endX: worldPos.x,
                endY: worldPos.y,
                color: selectedColor
            };
        }

        if (selectedTool === "select" && selectedShape && startDragShape) {
            // Check if shape actually moved or changed
            if (JSON.stringify(selectedShape) !== JSON.stringify(startDragShape)) {
                addToHistory({ type: "update", oldShape: startDragShape, newShape: JSON.parse(JSON.stringify(selectedShape)) });
                socket.send(JSON.stringify({
                    type: "update_shape",
                    shape: selectedShape,
                    roomId
                }));
            }
            selectedShape = null;
            startDragShape = null;
        }

        if (shape) {
            existingShapes.push(shape);
            addToHistory({ type: "add", shape });
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }));
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (e.buttons === 4 || (e.buttons === 1 && e.altKey)) {
            camera.x += e.movementX;
            camera.y += e.movementY;
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
            return;
        }

        if (clicked) {
            const worldPos = screenToWorld(e.offsetX, e.offsetY);
            const width = worldPos.x - startX;
            const height = worldPos.y - startY;

            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);

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
                currentPath.push({ x: worldPos.x, y: worldPos.y });
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                for (let i = 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i].x, currentPath[i].y);
                }
                ctx.stroke();
            } else if (selectedTool === "line") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(worldPos.x, worldPos.y);
                ctx.stroke();
            } else if (selectedTool === "eraser") {
                const shapeToErace = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx);
                if (shapeToErace) {
                    const index = existingShapes.findIndex(s => s.id === shapeToErace.id);
                    if (index !== -1) {
                        existingShapes.splice(index, 1);
                        addToHistory({ type: "delete", shape: shapeToErace });
                    }
                    socket.send(JSON.stringify({
                        type: "delete_shape",
                        shapeId: shapeToErace.id,
                        roomId
                    }));
                    clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
                }
            } else if (selectedTool === "select" && selectedShape) {
                if (selectedShape.type === "rect") {
                    selectedShape.x = worldPos.x - dragOffsetX;
                    selectedShape.y = worldPos.y - dragOffsetY;
                } else if (selectedShape.type === "circle") {
                    selectedShape.centerX = worldPos.x - dragOffsetX;
                    selectedShape.centerY = worldPos.y - dragOffsetY;
                } else if (selectedShape.type === "text") {
                    selectedShape.x = worldPos.x - dragOffsetX;
                    selectedShape.y = worldPos.y - dragOffsetY;
                } else if (selectedShape.type === "pencil") {
                    const diffX = worldPos.x - dragOffsetX;
                    const diffY = worldPos.y - dragOffsetY;
                    selectedShape.points = selectedShape.points.map(p => ({
                        x: p.x + diffX,
                        y: p.y + diffY
                    }));
                    dragOffsetX = worldPos.x;
                    dragOffsetY = worldPos.y;
                } else if (selectedShape.type === "line") {
                    const width = selectedShape.endX - selectedShape.startX;
                    const height = selectedShape.endY - selectedShape.startY;
                    selectedShape.startX = worldPos.x - dragOffsetX;
                    selectedShape.startY = worldPos.y - dragOffsetY;
                    selectedShape.endX = selectedShape.startX + width;
                    selectedShape.endY = selectedShape.startY + height;
                }
                clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
            }
        }
    };

    const handleWheel = (e: WheelEvent) => {
        // ... (wheel logic unchanged) ...
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = -e.deltaY;
        const newScale = Math.min(Math.max(camera.scale + delta * zoomSpeed * camera.scale, 0.1), 10);

        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        camera.scale = newScale;
        camera.x = e.offsetX - worldPos.x * camera.scale;
        camera.y = e.offsetY - worldPos.y * camera.scale;

        onZoomChange?.(camera.scale);
        clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return {
        updateTool: (newTool: Tool) => {
            selectedTool = newTool;
        },
        updateColor: (newColor: string) => {
            selectedColor = newColor;
        },
        updateBackgroundColor: (newColor: string) => {
            backgroundColor = newColor;
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        },
        resetView: () => {
            camera = { x: 0, y: 0, scale: 1 };
            onZoomChange?.(camera.scale);
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        },
        undo: () => {
            if (undoStack.length === 0) return;
            const op = undoStack.pop()!;
            redoStack.push(op);

            if (op.type === "add") {
                const index = existingShapes.findIndex(s => s.id === op.shape.id);
                if (index !== -1) existingShapes.splice(index, 1);
                socket.send(JSON.stringify({ type: "delete_shape", shapeId: op.shape.id, roomId }));
            } else if (op.type === "delete") {
                existingShapes.push(op.shape);
                socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape: op.shape }), roomId }));
            } else if (op.type === "update") {
                const index = existingShapes.findIndex(s => s.id === op.newShape.id);
                if (index !== -1) existingShapes[index] = op.oldShape;
                socket.send(JSON.stringify({ type: "update_shape", shape: op.oldShape, roomId }));
            }
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        },
        redo: () => {
            if (redoStack.length === 0) return;
            const op = redoStack.pop()!;
            undoStack.push(op);

            if (op.type === "add") {
                existingShapes.push(op.shape);
                socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape: op.shape }), roomId }));
            } else if (op.type === "delete") {
                const index = existingShapes.findIndex(s => s.id === op.shape.id);
                if (index !== -1) existingShapes.splice(index, 1);
                socket.send(JSON.stringify({ type: "delete_shape", shapeId: op.shape.id, roomId }));
            } else if (op.type === "update") {
                const index = existingShapes.findIndex(s => s.id === op.oldShape.id);
                if (index !== -1) existingShapes[index] = op.newShape;
                socket.send(JSON.stringify({ type: "update_shape", shape: op.newShape, roomId }));
            }
            clearCanvas(existingShapes, canvas, ctx, camera, backgroundColor);
        },
        cleanup: () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('wheel', handleWheel);
        }
    };
}

function findShapeAt(x: number, y: number, existingShapes: Shape[], ctx: CanvasRenderingContext2D): Shape | null {
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
        } else if (shape.type === "line") {
            const dist = Math.abs((shape.endY - shape.startY) * x - (shape.endX - shape.startX) * y + shape.endX * shape.startY - shape.endY * shape.startX) / Math.sqrt(Math.pow(shape.endY - shape.startY, 2) + Math.pow(shape.endX - shape.startX, 2));
            if (dist < threshold && x >= Math.min(shape.startX, shape.endX) - threshold && x <= Math.max(shape.startX, shape.endX) + threshold && y >= Math.min(shape.startY, shape.endY) - threshold && y <= Math.max(shape.startY, shape.endY) + threshold) return shape;
        }
    }
    return null;
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number }, backgroundColor: string) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.x, camera.y);

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
        } else if (shape.type === "line") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();
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
    } catch (e: any) {
        console.error("Failed to fetch existing shapes", e);
        if (e.response) {
            console.error("Error response data:", e.response.data);
            console.error("Error status:", e.response.status);
        }
        return [];
    }
}
