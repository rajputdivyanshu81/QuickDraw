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
} | {
    type: "arrow";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "image";
    data: string;
    x: number;
    y: number;
    width: number;
    height: number;
}) & { id: string; color?: string };

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select" | "line" | "pan" | "ppt-capture" | "laser" | "arrow" | "marquee-copy";

type LaserPointerData = {
    points: { x: number, y: number, timestamp: number }[],
    name: string,
    lastUpdate: number
};

const isTextShape = (shape: Shape): shape is Extract<Shape, { type: "text" }> => {
    return shape.type === "text";
};

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, initialTool: Tool, token: string, onZoomChange?: (scale: number) => void, initialBackgroundColor: string = "#ffffff", onCapture?: (captureData: any) => void) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageCache = new Map<string, HTMLImageElement>();

    let selectedTool: Tool = initialTool;
    let selectedColor: string = "black";
    let backgroundColor: string = initialBackgroundColor;
    canvas.style.backgroundColor = initialBackgroundColor;

    // Identity for local laser/interactions
    let myUserId = "anon";
    let myUserName = "User";
    try {
        const parts = token.split('.');
        if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            myUserId = (payload.sub || payload.userId || "anon").toString();
            myUserName = (payload.name || payload.first_name || "User").toString();
        }
    } catch (e) {
        console.warn("Could not decode token for identity", e);
    }

    const existingShapes: Shape[] = [];
    const laserPointers = new Map<string, LaserPointerData>();

    // Camera state
    const camera = { x: 0, y: 0, scale: 1 };

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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        } else if (parsedData.type === "delete_shape") {
            const shapeId = parsedData.shapeId;
            const index = existingShapes.findIndex(s => s.id === shapeId);
            if (index !== -1) {
                existingShapes.splice(index, 1);
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        } else if (parsedData.type === "update_shape") {
            const updatedShape = parsedData.shape;
            const index = existingShapes.findIndex(s => s.id === updatedShape.id);
            if (index !== -1) {
                existingShapes[index] = updatedShape;
            } else {
                existingShapes.push(updatedShape);
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        } else if (parsedData.type === "laser_pointer") {
            const userId = parsedData.userId;
            const existing = laserPointers.get(userId);
            const newPoint = { x: parsedData.x, y: parsedData.y, timestamp: Date.now() };

            if (existing) {
                existing.points.push(newPoint);
                if (existing.points.length > 20) existing.points.shift();
                existing.lastUpdate = Date.now();
                existing.name = parsedData.name || existing.name;
            } else {
                laserPointers.set(userId, {
                    points: [newPoint],
                    name: parsedData.name || "User",
                    lastUpdate: Date.now()
                });
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        }
    }

    getExistingShapes(roomId, token).then(history => {
        history.forEach((shape: Shape) => {
            if (!existingShapes.some(s => s.id === shape.id)) {
                existingShapes.push(shape);
            }
        });
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
    }).catch((e: any) => {
        console.error("Failed to fetch existing shapes", e);
        if (e.response) {
            console.error("Error response data:", e.response.data);
            console.error("Error status:", e.response.status);
        }
    });

    // Cleanup old laser pointers every 100ms
    const laserCleanupInterval = setInterval(() => {
        let changed = false;
        const now = Date.now();
        for (const [userId, data] of laserPointers.entries()) {
            if (now - data.lastUpdate > 1500) {
                laserPointers.delete(userId);
                changed = true;
            }
        }
        if (changed || laserPointers.size > 0) {
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        }
    }, 50);

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

    let clicked = false;
    let startX = 0;
    let startY = 0;
    let currentPath: { x: number, y: number }[] = [];
    let copiedShapes: Shape[] = [];
    let selectedShape: Shape | null = null;
    let selectedShapes: Shape[] = [];
    let startDragShapes: Shape[] | null = null;
    let startDragShape: Shape | null = null;
    let startDragShapeBox: { x: number, y: number, width: number, height: number } | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let isResizing = false;
    let resizeHandle: "nw" | "ne" | "sw" | "se" | null = null;

    let isSpacePressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        
        if (e.code === "Space" && !isSpacePressed) {
            isSpacePressed = true;
            canvas.style.cursor = "grab";
            return;
        }

        // Prevent copying/pasting/deleting if editing text inputs or rich doc editor
        if (document.activeElement && (
            document.activeElement.tagName === "INPUT" || 
            document.activeElement.tagName === "TEXTAREA" || 
            document.activeElement.getAttribute("contenteditable") === "true"
        )) {
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === "c") {
            // Copy Shape
            if (selectedTool === "select" && selectedShape) {
                copiedShapes = [JSON.parse(JSON.stringify(selectedShape))];
                e.preventDefault();
            }
        } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
            // Paste Shape
            if (copiedShapes.length > 0) {
                e.preventDefault();
                const pastedShapes = [];
                for (const shape of copiedShapes) {
                    const newShape = JSON.parse(JSON.stringify(shape));
                    
                    // Assign a new unique ID
                    newShape.id = Math.random().toString(36).substring(2, 9);
                    
                    // Offset position to avoid exact overlapping
                    if (newShape.type === "rect" || newShape.type === "text" || newShape.type === "image" || newShape.type === "line" || newShape.type === "arrow") {
                        newShape.x += 20;
                        newShape.y += 20;
                        if (newShape.type === "line" || newShape.type === "arrow") {
                            newShape.endX += 20;
                            newShape.endY += 20;
                        }
                    } else if (newShape.type === "circle") {
                        newShape.centerX += 20;
                        newShape.centerY += 20;
                    } else if (newShape.type === "pencil") {
                        newShape.points = newShape.points.map((p: any) => ({
                            x: p.x + 20,
                            y: p.y + 20
                        }));
                    }
                    
                    existingShapes.push(newShape);
                    pastedShapes.push(newShape);
                    addToHistory({ type: "add", shape: newShape });

                    if (onCapture) {
                        onCapture(newShape);
                    }
                }
                
                selectedShapes = pastedShapes;
                selectedShape = null;
                clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            }
        } else if (e.key === "Delete" || e.key === "Backspace") {
            // Delete Shape
            if (selectedTool === "select" && selectedShape) {
                e.preventDefault();
                const index = existingShapes.findIndex(s => s.id === selectedShape!.id);
                if (index !== -1) {
                    const removedShape = existingShapes.splice(index, 1)[0];
                    addToHistory({ type: "delete", shape: removedShape });
                    socket.send(JSON.stringify({
                        type: "delete_shape",
                        shapeId: removedShape.id,
                        roomId
                    }));
                    selectedShape = null;
                    clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
                }
            }
        }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") {
            isSpacePressed = false;
            canvas.style.cursor = selectedTool === "pan" ? "grab" : "default";
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        if (e.button === 1 || (e.button === 0 && e.altKey) || selectedTool === "pan" || isSpacePressed) {
            clicked = true;
            canvas.style.cursor = "grabbing";
            return;
        }

        clicked = true;
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        startX = worldPos.x;
        startY = worldPos.y;

        if (selectedTool === "select") {
            if (selectedShape && (selectedShape.type === "image" || selectedShape.type === "rect" || selectedShape.type === "pencil")) {
                const handleSize = 8 / camera.scale;
                let hX, hY, hW, hH;
                if (selectedShape.type === "pencil") {
                    const box = getShapeBoundingBox(selectedShape, ctx);
                    if (box) { hX = box.x; hY = box.y; hW = box.width; hH = box.height; }
                } else {
                    hX = selectedShape.x; hY = selectedShape.y; hW = selectedShape.width; hH = selectedShape.height;
                }
                
                if (hX !== undefined && hY !== undefined && hW !== undefined && hH !== undefined) {
                    const handles = [
                        { id: "nw" as const, x: hX, y: hY },
                        { id: "ne" as const, x: hX + hW, y: hY },
                        { id: "sw" as const, x: hX, y: hY + hH },
                        { id: "se" as const, x: hX + hW, y: hY + hH }
                    ];
                    const clickedHandle = handles.find(h =>
                        worldPos.x >= h.x - handleSize && worldPos.x <= h.x + handleSize &&
                        worldPos.y >= h.y - handleSize && worldPos.y <= h.y + handleSize
                    );
                    if (clickedHandle) {
                        isResizing = true;
                        resizeHandle = clickedHandle.id;
                        startDragShape = JSON.parse(JSON.stringify(selectedShape));
                        if (startDragShape?.type === "pencil") {
                            startDragShapeBox = getShapeBoundingBox(startDragShape, ctx) || null;
                        } else {
                            startDragShapeBox = null;
                        }
                        return;
                    }
                }
            }

            const clickedShape = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx);
            if (clickedShape) {
                if (selectedShapes.some(s => s.id === clickedShape.id)) {
                    startDragShapes = JSON.parse(JSON.stringify(selectedShapes));
                    selectedShape = null;
                } else {
                    selectedShapes = [];
                    selectedShape = clickedShape;
                    // Deep copy for undo history
                    startDragShape = JSON.parse(JSON.stringify(selectedShape));

                    if (selectedShape.type === "circle") {
                        dragOffsetX = worldPos.x - selectedShape.centerX;
                        dragOffsetY = worldPos.y - selectedShape.centerY;
                    } else if (selectedShape.type === "text") {
                        dragOffsetX = worldPos.x - selectedShape.x;
                        dragOffsetY = worldPos.y - selectedShape.y;
                    } else if (selectedShape.type === "pencil") {
                        dragOffsetX = worldPos.x;
                        dragOffsetY = worldPos.y;
                    } else if (selectedShape.type === "image" || selectedShape.type === "rect") {
                        isResizing = false;
                        dragOffsetX = worldPos.x - selectedShape.x;
                        dragOffsetY = worldPos.y - selectedShape.y;
                    }
                }
            } else {
                selectedShape = null;
                selectedShapes = [];
            }
        } else if (selectedTool === "pencil" || selectedTool === "lasso-copy") {
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
                clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            }
        } else if (selectedTool === "text") {
            clicked = false;
            const shapeAt = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx!);
            if (shapeAt && shapeAt.type === "text") {
                showTextInput(e.clientX, e.clientY, worldPos, shapeAt);
            } else {
                showTextInput(e.clientX, e.clientY, worldPos);
            }
        }
    };

    const showTextInput = (clientX: number, clientY: number, worldPos: { x: number, y: number }, existingShape?: Shape) => {
        const input = document.createElement("textarea");
        input.style.position = "fixed";
        input.style.left = `${clientX}px`;
        input.style.top = `${clientY}px`;
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

        if (existingShape && isTextShape(existingShape)) {
            input.value = existingShape.text;
            // Adjust position to match existing text
            const screenPos = worldToScreen(existingShape.x, existingShape.y);
            input.style.left = `${screenPos.x + canvas.getBoundingClientRect().left}px`;
            input.style.top = `${screenPos.y + canvas.getBoundingClientRect().top - 20 * camera.scale}px`;
            input.style.font = `${20 * camera.scale}px Arial`;
            input.style.color = existingShape.color || "black";
        }

        input.onmousedown = (e) => e.stopPropagation();
        input.onmouseup = (e) => e.stopPropagation();
        input.onmousemove = (e) => e.stopPropagation();

        document.body.appendChild(input);
        setTimeout(() => {
            input.focus();
            if (existingShape) {
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }, 0);

        const handleBlur = () => {
            const text = input.value.trim();
            if (existingShape && isTextShape(existingShape)) {
                if (text && text !== existingShape.text) {
                    const oldShape = JSON.parse(JSON.stringify(existingShape));
                    existingShape.text = text;
                    addToHistory({ type: "update", oldShape, newShape: JSON.parse(JSON.stringify(existingShape)) });
                    socket.send(JSON.stringify({
                        type: "update_shape",
                        shape: existingShape,
                        roomId
                    }));
                } else if (!text) {
                    // Delete if empty
                    const idx = existingShapes.findIndex(s => s.id === existingShape.id);
                    if (idx !== -1) {
                        existingShapes.splice(idx, 1);
                        addToHistory({ type: "delete", shape: existingShape });
                        socket.send(JSON.stringify({ type: "delete_shape", shapeId: existingShape.id, roomId }));
                    }
                }
            } else if (!existingShape && text) {
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
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            document.body.removeChild(input);
        };

        input.onblur = handleBlur;
        input.onkeydown = (event) => {
            if (event.key === "Enter") {
                input.blur();
            }
            if (event.key === "Escape") {
                if (existingShape && isTextShape(existingShape)) input.value = existingShape.text; // Revert
                else input.value = "";
                input.blur();
            }
        };
    };

    const handleDoubleClick = (e: MouseEvent) => {
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        const shape = findShapeAt(worldPos.x, worldPos.y, existingShapes, ctx);
        if (shape && shape.type === "text") {
            showTextInput(e.clientX, e.clientY, worldPos, shape);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (!clicked) return;
        clicked = false;

        const worldPos = screenToWorld(e.offsetX, e.offsetY);

        if (selectedTool === "pan" || isSpacePressed || e.button === 1 || (e.button === 0 && e.altKey)) {
            canvas.style.cursor = isSpacePressed || selectedTool === "pan" ? "grab" : "default";
            return;
        }

        if (selectedTool === "lasso-copy") {
            if (currentPath.length > 2) {
                const elements = [];
                for (const shape of existingShapes) {
                    const center = getShapeCenter(shape);
                    if (pointInPolygon(center, currentPath)) {
                        elements.push(JSON.parse(JSON.stringify(shape)));
                    }
                }
                copiedShapes = elements;
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            return;
        }

        if (selectedTool === "ppt-capture") {
            const width = Math.abs(worldPos.x - startX);
            const height = Math.abs(worldPos.y - startY);
            const x = Math.min(worldPos.x, startX);
            const y = Math.min(worldPos.y, startY);

            if (width > 5 && height > 5) {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tempCtx = tempCanvas.getContext("2d");

                if (tempCtx) {
                    renderScene(existingShapes, tempCanvas, tempCtx!, { x: -x, y: -y, scale: 1 }, backgroundColor, imageCache, null);
                    
                    const elements = [];
                    for (const shape of existingShapes) {
                        if (shapeIntersectRect(shape, x, y, width, height, ctx!)) {
                            const normalized = JSON.parse(JSON.stringify(shape)); // deep copy
                            if (normalized.type === "rect" || normalized.type === "text" || normalized.type === "image") {
                                normalized.x -= x;
                                normalized.y -= y;
                            } else if (normalized.type === "circle") {
                                normalized.centerX -= x;
                                normalized.centerY -= y;
                            } else if (normalized.type === "line" || normalized.type === "arrow") {
                                normalized.startX -= x;
                                normalized.startY -= y;
                                normalized.endX -= x;
                                normalized.endY -= y;
                            } else if (normalized.type === "pencil") {
                                normalized.points = simplifyPath(normalized.points.map((p: any) => ({ x: p.x - x, y: p.y - y })), 3);
                            }
                            
                            elements.push(normalized);
                        }
                    }

                    if (onCapture) {
                        onCapture({
                            image: tempCanvas.toDataURL("image/png"),
                            elements,
                            pencilImage: null,
                            width,
                            height,
                            bgColor: backgroundColor
                        });
                    }
                }
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            return;
        }

        let shape: Shape | null = null;
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
        } else if (selectedTool === "line" || selectedTool === "arrow") {
            const dragLength = Math.sqrt(Math.pow(worldPos.x - startX, 2) + Math.pow(worldPos.y - startY, 2));
            if (dragLength > 3) {
                shape = {
                    type: selectedTool,
                    id: Math.random().toString(36).substring(2, 9),
                    startX: startX,
                    startY: startY,
                    endX: worldPos.x,
                    endY: worldPos.y,
                    color: selectedColor
                } as Shape;
            }
        }

        if (shape) {
            existingShapes.push(shape);
            addToHistory({ type: "add", shape });
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }));
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
        }

        if (selectedTool === "select" && startDragShape && JSON.stringify(selectedShape) !== JSON.stringify(startDragShape)) {
            addToHistory({ type: "update", oldShape: startDragShape, newShape: JSON.parse(JSON.stringify(selectedShape)) });
            socket.send(JSON.stringify({
                type: "update_shape",
                shape: selectedShape,
                roomId
            }));
        } else if (selectedTool === "select" && startDragShapes && JSON.stringify(selectedShapes) !== JSON.stringify(startDragShapes)) {
            for (let i = 0; i < selectedShapes.length; i++) {
                const oldS = startDragShapes[i];
                const newS = selectedShapes[i];
                if (JSON.stringify(oldS) !== JSON.stringify(newS)) {
                    socket.send(JSON.stringify({
                        type: "update_shape",
                        shape: newS,
                        roomId
                    }));
                }
            }
        }

        isResizing = false;
        resizeHandle = null;
        startDragShape = null;
        startDragShapeBox = null;
        startDragShapes = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Handle Panning (Middle Mouse, Alt+Left Click, Pan Tool, Spacebar)
        if (clicked && (selectedTool === "pan" || isSpacePressed || e.buttons === 4 || (e.buttons === 1 && e.altKey))) {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            camera.x += deltaX;
            camera.y += deltaY;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            return;
        }

        if (clicked) {
            const worldPos = screenToWorld(e.offsetX, e.offsetY);
            const width = worldPos.x - startX;
            const height = worldPos.y - startY;

            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);

            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = 2;

            if (selectedTool === "rect" || selectedTool === "ppt-capture") {
                if (selectedTool === "ppt-capture") {
                    ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
                    ctx.fillRect(startX, startY, width, height);
                    ctx.strokeStyle = "#6366f1";
                }
                ctx.strokeRect(startX, startY, width, height);

            } else if (selectedTool === "circle") {
                const radius = Math.sqrt(width * width + height * height);
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
                ctx.stroke();
            } else if (selectedTool === "pencil" || selectedTool === "lasso-copy") {
                currentPath.push({ x: worldPos.x, y: worldPos.y });
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                for (let i = 1; i < currentPath.length; i++) {
                    ctx.lineTo(currentPath[i].x, currentPath[i].y);
                }
                
                if (selectedTool === "lasso-copy") {
                    ctx.closePath();
                    ctx.fillStyle = "rgba(99, 102, 241, 0.1)";
                    ctx.fill();
                    ctx.strokeStyle = "#6366f1";
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                } else {
                    ctx.stroke();
                }
            } else if (selectedTool === "line") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(worldPos.x, worldPos.y);
                ctx.stroke();
            } else if (selectedTool === "arrow") {
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(worldPos.x, worldPos.y);
                ctx.stroke();
                
                // Draw arrowhead preview
                const angle = Math.atan2(worldPos.y - startY, worldPos.x - startX);
                const arrowLength = 15;
                ctx.beginPath();
                ctx.moveTo(worldPos.x, worldPos.y);
                ctx.lineTo(worldPos.x - arrowLength * Math.cos(angle - Math.PI / 6), worldPos.y - arrowLength * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(worldPos.x - arrowLength * Math.cos(angle + Math.PI / 6), worldPos.y - arrowLength * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fillStyle = ctx.strokeStyle;
                ctx.fill();
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
                    clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
                }
            } else if (selectedTool === "select" && selectedShapes.length > 0 && startDragShapes) {
                const diffX = worldPos.x - startX;
                const diffY = worldPos.y - startY;
                for (let i = 0; i < selectedShapes.length; i++) {
                    const shape = selectedShapes[i];
                    const startShape = startDragShapes[i];
                    if (shape.type === "rect" || shape.type === "text" || shape.type === "image") {
                        shape.x = (startShape as any).x + diffX;
                        shape.y = (startShape as any).y + diffY;
                    } else if (shape.type === "circle") {
                        shape.centerX = (startShape as any).centerX + diffX;
                        shape.centerY = (startShape as any).centerY + diffY;
                    } else if (shape.type === "line" || shape.type === "arrow") {
                        shape.startX = (startShape as any).startX + diffX;
                        shape.startY = (startShape as any).startY + diffY;
                        shape.endX = (startShape as any).endX + diffX;
                        shape.endY = (startShape as any).endY + diffY;
                    } else if (shape.type === "pencil") {
                        for (let j = 0; j < shape.points.length; j++) {
                            shape.points[j].x = (startShape as any).points[j].x + diffX;
                            shape.points[j].y = (startShape as any).points[j].y + diffY;
                        }
                    }
                }
            } else if (selectedTool === "select" && selectedShape) {
                if (selectedShape.type === "circle") {
                    selectedShape.centerX = worldPos.x - dragOffsetX;
                    selectedShape.centerY = worldPos.y - dragOffsetY;
                } else if (selectedShape.type === "text") {
                    selectedShape.x = worldPos.x - dragOffsetX;
                    selectedShape.y = worldPos.y - dragOffsetY;
                } else if (selectedShape.type === "pencil") {
                    if (isResizing && resizeHandle && startDragShape && startDragShape.type === "pencil") {
                        const box = startDragShapeBox || getShapeBoundingBox(startDragShape, ctx);
                        if (box) {
                            let newX = box.x;
                            let newY = box.y;
                            let newW = box.width;
                            let newH = box.height;
                            if (resizeHandle === "se") {
                                newW = worldPos.x - box.x;
                                newH = worldPos.y - box.y;
                            } else if (resizeHandle === "sw") {
                                newX = worldPos.x;
                                newW = box.x + box.width - newX;
                                newH = worldPos.y - box.y;
                            } else if (resizeHandle === "ne") {
                                newY = worldPos.y;
                                newH = box.y + box.height - newY;
                                newW = worldPos.x - box.x;
                            } else if (resizeHandle === "nw") {
                                newX = worldPos.x;
                                newY = worldPos.y;
                                newW = box.x + box.width - newX;
                                newH = box.y + box.height - newY;
                            }
                            if (newW < 5) newW = 5;
                            if (newH < 5) newH = 5;
                            const scaleX = newW / box.width;
                            const scaleY = newH / box.height;
                            for (let i = 0; i < selectedShape.points.length; i++) {
                                const sp = startDragShape.points[i];
                                selectedShape.points[i].x = newX + (sp.x - box.x) * scaleX;
                                selectedShape.points[i].y = newY + (sp.y - box.y) * scaleY;
                            }
                        }
                    } else {
                        const diffX = worldPos.x - dragOffsetX;
                        const diffY = worldPos.y - dragOffsetY;
                        for (const p of selectedShape.points) {
                            p.x += diffX;
                            p.y += diffY;
                        }
                        dragOffsetX = worldPos.x;
                        dragOffsetY = worldPos.y;
                    }
                } else if (selectedShape.type === "line" || selectedShape.type === "arrow") {
                    const width = selectedShape.endX - selectedShape.startX;
                    const height = selectedShape.endY - selectedShape.startY;
                    selectedShape.startX = worldPos.x - dragOffsetX;
                    selectedShape.startY = worldPos.y - dragOffsetY;
                    selectedShape.endX = selectedShape.startX + width;
                    selectedShape.endY = selectedShape.startY + height;
                } else if (selectedShape.type === "image" || selectedShape.type === "rect") {
                    if (isResizing && resizeHandle) {
                        if (resizeHandle === "se") {
                            selectedShape.width = worldPos.x - selectedShape.x;
                            selectedShape.height = worldPos.y - selectedShape.y;
                        } else if (resizeHandle === "sw") {
                            const newX = worldPos.x;
                            selectedShape.width += selectedShape.x - newX;
                            selectedShape.x = newX;
                            selectedShape.height = worldPos.y - selectedShape.y;
                        } else if (resizeHandle === "ne") {
                            const newY = worldPos.y;
                            selectedShape.height += selectedShape.y - newY;
                            selectedShape.y = newY;
                            selectedShape.width = worldPos.x - selectedShape.x;
                        } else if (resizeHandle === "nw") {
                            const newX = worldPos.x;
                            const newY = worldPos.y;
                            selectedShape.width += selectedShape.x - newX;
                            selectedShape.height += selectedShape.y - newY;
                            selectedShape.x = newX;
                            selectedShape.y = newY;
                        }
                    } else {
                        selectedShape.x = worldPos.x - dragOffsetX;
                        selectedShape.y = worldPos.y - dragOffsetY;
                    }
                }
                clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
            }
        }

        if (selectedTool === "pan" || isSpacePressed) {
            canvas.style.cursor = clicked ? "grabbing" : "grab";
        }

        if (selectedTool === "laser") {
            const worldPos = screenToWorld(e.offsetX, e.offsetY);
            const now = Date.now();
            const newPoint = { x: worldPos.x, y: worldPos.y, timestamp: now };

            // Update locally for immediate feedback
            const existing = laserPointers.get(myUserId);
            if (existing) {
                existing.points.push(newPoint);
                if (existing.points.length > 20) existing.points.shift();
                existing.lastUpdate = now;
            } else {
                laserPointers.set(myUserId, {
                    points: [newPoint],
                    name: myUserName,
                    lastUpdate: now
                });
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);

            socket.send(JSON.stringify({
                type: "laser_pointer",
                roomId,
                x: worldPos.x,
                y: worldPos.y
            }));
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
    };

    const handleTouchStart = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;

        // Treat touch as left click (button 0)
        handleMouseDown({
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX,
            offsetY,
            button: 0,
            altKey: false,
            stopPropagation: () => e.stopPropagation()
        } as any);
    };

    const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = canvas.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;

        handleMouseMove({
            clientX: touch.clientX,
            clientY: touch.clientY,
            offsetX,
            offsetY,
            buttons: 1 // Treat as left button held
        } as any);

        if (clicked && selectedTool !== "select") {
            e.preventDefault(); // Prevent scrolling while drawing
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        // use last known coordinates from mouse move if available or just complete
        handleMouseUp({
            offsetX: lastMouseX - canvas.getBoundingClientRect().left, // approximation if moved
            offsetY: lastMouseY - canvas.getBoundingClientRect().top,
            button: 0
        } as any);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    const updateTool = (newTool: Tool) => {
        selectedTool = newTool;
        canvas.style.cursor = newTool === "pan" ? "grab" : "default";
    };

    const updateColor = (newColor: string) => {
        selectedColor = newColor;
    };

    const updateBackgroundColor = (newColor: string) => {
        console.log("draw/index.ts updateBackgroundColor called with:", newColor);
        backgroundColor = newColor;
        canvas.style.backgroundColor = newColor;
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers, selectedShapes);
    };

    const resetView = () => {
        camera.x = 0;
        camera.y = 0;
        camera.scale = 1;
        onZoomChange?.(camera.scale);
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
    };

    const undo = () => {
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers, selectedShapes);
    };

    function redo() {
        if (redoStack.length === 0) return;
        const op = redoStack.pop()!;
        undoStack.push(op);

        if (op.type === "add") {
            existingShapes.push(op.shape);
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: op.shape }),
                roomId
            }));
        } else if (op.type === "delete") {
            const idx = existingShapes.findIndex(s => s.id === op.shape.id);
            if (idx !== -1) existingShapes.splice(idx, 1);
            socket.send(JSON.stringify({
                type: "delete_shape",
                shapeId: op.shape.id,
                roomId
            }));
        } else if (op.type === "update") {
            const index = existingShapes.findIndex(s => s.id === op.oldShape.id);
            if (index !== -1) existingShapes[index] = op.newShape;
            socket.send(JSON.stringify({ type: "update_shape", shape: op.newShape, roomId }));
        }
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers, selectedShapes);
    }

    function insertImage(data: string, x: number, y: number, width: number, height: number) {
        const imageShape: Shape = {
            id: Math.random().toString(36).substring(2, 9),
            type: "image",
            data,
            x,
            y,
            width,
            height
        };
        existingShapes.push(imageShape);
        addToHistory({ type: "add", shape: imageShape });
        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape: imageShape }),
            roomId
        }));
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers, selectedShapes);
    }

    function cleanup() {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        clearInterval(laserCleanupInterval);
    }

    return {
        camera,
        updateTool,
        updateColor,
        updateBackgroundColor,
        resetView,
        undo,
        redo,
        insertImage,
        cleanup
    };
}


function pointInPolygon(point: {x: number, y: number}, vs: {x: number, y: number}[]) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i].x, yi = vs[i].y;
        let xj = vs[j].x, yj = vs[j].y;
        let intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getShapeCenter(shape: Shape): {x: number, y: number} {
    if (shape.type === "rect" || shape.type === "image") {
        return { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
    } else if (shape.type === "circle") {
        return { x: shape.centerX, y: shape.centerY };
    } else if (shape.type === "line" || shape.type === "arrow") {
        return { x: (shape.startX + shape.endX) / 2, y: (shape.startY + shape.endY) / 2 };
    } else if (shape.type === "text") {
        return { x: shape.x, y: shape.y };
    } else if (shape.type === "pencil") {
        if (shape.points.length === 0) return {x: 0, y: 0};
        return shape.points[Math.floor(shape.points.length / 2)];
    }
    return { x: 0, y: 0 };
}

function shapeIntersectRect(shape: Shape, x: number, y: number, w: number, h: number, ctx: CanvasRenderingContext2D): boolean {
    const rx = x, ry = y, rw = w, rh = h;
    if (shape.type === "rect") {
        const sx = Math.min(shape.x, shape.x + shape.width);
        const sy = Math.min(shape.y, shape.y + shape.height);
        const sw = Math.abs(shape.width);
        const sh = Math.abs(shape.height);
        return !(sx > rx + rw || sx + sw < rx || sy > ry + rh || sy + sh < ry);
    } else if (shape.type === "circle") {
        const cx = Math.max(rx, Math.min(shape.centerX, rx + rw));
        const cy = Math.max(ry, Math.min(shape.centerY, ry + rh));
        const dist = Math.sqrt(Math.pow(cx - shape.centerX, 2) + Math.pow(cy - shape.centerY, 2));
        return dist <= shape.radius;
    } else if (shape.type === "image") {
        const sx = Math.min(shape.x, shape.x + shape.width);
        const sy = Math.min(shape.y, shape.y + shape.height);
        const sw = Math.abs(shape.width);
        const sh = Math.abs(shape.height);
        return !(sx > rx + rw || sx + sw < rx || sy > ry + rh || sy + sh < ry);
    } else if (shape.type === "line" || shape.type === "arrow") {
        const minX = Math.min(shape.startX, shape.endX);
        const maxX = Math.max(shape.startX, shape.endX);
        const minY = Math.min(shape.startY, shape.endY);
        const maxY = Math.max(shape.startY, shape.endY);
        return !(minX > rx + rw || maxX < rx || minY > ry + rh || maxY < ry);
    } else if (shape.type === "text") {
        ctx.font = "20px Arial";
        const textWidth = ctx.measureText(shape.text).width;
        const textHeight = 20;
        return !(shape.x > rx + rw || shape.x + textWidth < rx || shape.y - textHeight > ry + rh || shape.y < ry);
    } else if (shape.type === "pencil") {
        for (const p of shape.points) {
            if (p.x >= rx && p.x <= rx + rw && p.y >= ry && p.y <= ry + rh) return true;
        }
        return false;
    }
    return false;
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
        } else if (shape.type === "line" || shape.type === "arrow") {
            const len = Math.sqrt(Math.pow(shape.endY - shape.startY, 2) + Math.pow(shape.endX - shape.startX, 2));
            if (len < 5) {
                const distToPoint = Math.sqrt(Math.pow(x - shape.startX, 2) + Math.pow(y - shape.startY, 2));
                if (distToPoint < threshold) return shape;
            } else {
                const dist = Math.abs((shape.endY - shape.startY) * x - (shape.endX - shape.startX) * y + shape.endX * shape.startY - shape.endY * shape.startX) / len;
                if (dist < threshold && x >= Math.min(shape.startX, shape.endX) - threshold && x <= Math.max(shape.startX, shape.endX) + threshold && y >= Math.min(shape.startY, shape.endY) - threshold && y <= Math.max(shape.startY, shape.endY) + threshold) return shape;
            }
        } else if (shape.type === "image") {
            if (x >= shape.x - threshold && x <= shape.x + shape.width + threshold &&
                y >= shape.y - threshold && y <= shape.y + shape.height + threshold) {
                return shape;
            }
        }
    }
    return null;
}

function getShapeBoundingBox(shape: Shape, ctx: CanvasRenderingContext2D): { x: number, y: number, width: number, height: number } | null {
    if (shape.type === "rect" || shape.type === "image") {
        const x = Math.min(shape.x, shape.x + shape.width);
        const y = Math.min(shape.y, shape.y + shape.height);
        const width = Math.abs(shape.width);
        const height = Math.abs(shape.height);
        return { x, y, width, height };
    }
    if (shape.type === "circle") {
        return {
            x: shape.centerX - shape.radius,
            y: shape.centerY - shape.radius,
            width: shape.radius * 2,
            height: shape.radius * 2
        };
    }
    if (shape.type === "text") {
        const textWidth = ctx.measureText(shape.text).width;
        return {
            x: shape.x - 4,
            y: shape.y - 20,
            width: textWidth + 8,
            height: 24
        };
    }
    if (shape.type === "line" || shape.type === "arrow") {
        const minX = Math.min(shape.startX, shape.endX);
        const maxX = Math.max(shape.startX, shape.endX);
        const minY = Math.min(shape.startY, shape.endY);
        const maxY = Math.max(shape.startY, shape.endY);
        return {
            x: minX - 4,
            y: minY - 4,
            width: (maxX - minX) + 8,
            height: (maxY - minY) + 8
        };
    }
    if (shape.type === "pencil") {
        if (!shape.points || shape.points.length === 0) return null;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of shape.points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        }
        return {
            x: minX - 4,
            y: minY - 4,
            width: (maxX - minX) + 8,
            height: (maxY - minY) + 8
        };
    }
    return null;
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number }, backgroundColor: string, imageCache: Map<string, HTMLImageElement>, selectedShape: Shape | null = null, laserPointers?: Map<string, LaserPointerData>, selectedShapes: Shape[] = []) {
    renderScene(existingShapes, canvas, ctx, camera, backgroundColor, imageCache, selectedShape, laserPointers, selectedShapes);
}

function renderScene(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number }, backgroundColor: string, imageCache: Map<string, HTMLImageElement>, selectedShape: Shape | null = null, laserPointers?: Map<string, LaserPointerData>, selectedShapes: Shape[] = []) {
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
        } else if (shape.type === "arrow") {
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();

            const angle = Math.atan2(shape.endY - shape.startY, shape.endX - shape.startX);
            const arrowLength = 15;
            ctx.beginPath();
            ctx.moveTo(shape.endX, shape.endY);
            ctx.lineTo(shape.endX - arrowLength * Math.cos(angle - Math.PI / 6), shape.endY - arrowLength * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(shape.endX - arrowLength * Math.cos(angle + Math.PI / 6), shape.endY - arrowLength * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = shape.color || "black";
            ctx.fill();
        } else if (shape.type === "image") {
            let img = imageCache.get(shape.data);
            if (!img) {
                img = new Image();
                img.src = shape.data;
                img.onload = () => {
                    imageCache.set(shape.data, img!);
                    // Trigger a re-render once loaded
                    renderScene(existingShapes, canvas, ctx, camera, backgroundColor, imageCache, selectedShape, laserPointers);
                };
            } else if (img.complete) {
                ctx.drawImage(img, shape.x, shape.y, shape.width, shape.height);
            }
        }
    });

    // Draw Laser Pointers with Trail
    if (laserPointers) {
        const now = Date.now();
        laserPointers.forEach((data) => {
            if (data.points.length === 0) return;

            const age = now - data.lastUpdate;
            if (age > 1500) return;
            const overallOpacity = Math.max(0, 1 - age / 1500);

            // 1. Draw Trail segments
            if (data.points.length > 1) {
                ctx.save();
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                ctx.shadowColor = "red";

                for (let i = 1; i < data.points.length; i++) {
                    const p1 = data.points[i - 1];
                    const p2 = data.points[i];
                    const pointAge = now - p2.timestamp;
                    const trailOpacity = Math.max(0, 1 - pointAge / 800);

                    if (trailOpacity <= 0) continue;

                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 0, 0, ${overallOpacity * trailOpacity * 0.5})`;
                    ctx.lineWidth = (6 / camera.scale) * trailOpacity;
                    ctx.shadowBlur = (8 / camera.scale) * trailOpacity;

                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // 2. Draw Current Pointer Head
            const head = data.points[data.points.length - 1];
            ctx.save();
            ctx.beginPath();
            const radius = 6 / camera.scale;

            // Draw glow
            const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, radius * 3);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${overallOpacity * 0.6})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
            ctx.fillStyle = gradient;
            ctx.arc(head.x, head.y, radius * 3, 0, Math.PI * 2);
            ctx.fill();

            // Draw core
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 0, 0, ${overallOpacity})`;
            ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
            ctx.fill();

            // Draw Name tag
            ctx.font = `${12 / camera.scale}px sans-serif`;
            const nameWidth = ctx.measureText(data.name).width;
            ctx.fillStyle = `rgba(0, 0, 0, ${overallOpacity * 0.7})`;
            ctx.fillRect(head.x + radius + 2, head.y - radius - 15 / camera.scale, nameWidth + 8 / camera.scale, 16 / camera.scale);
            ctx.fillStyle = `rgba(255, 255, 255, ${overallOpacity})`;
            ctx.fillText(data.name, head.x + radius + 6, head.y - radius - 2);

            ctx.restore();
        });
    }

    // Draw handles / selection highlight for ANY selected shape
    if (selectedShapes && selectedShapes.length > 0) {
        ctx.save();
        ctx.strokeStyle = "#818cf8"; // Subtle indigo selection border
        ctx.lineWidth = 1.5 / camera.scale;
        selectedShapes.forEach(shape => {
            const bbox = getShapeBoundingBox(shape, ctx);
            if (bbox) {
                ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            }
        });
        ctx.restore();
    }

    if (selectedShape) {
        const bbox = getShapeBoundingBox(selectedShape, ctx);
        if (bbox) {
            ctx.save();
            ctx.strokeStyle = "#818cf8"; // Subtle indigo selection border
            ctx.lineWidth = 1.5 / camera.scale;
            ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            
            // Draw resize corner handles for resizable shapes
            if (selectedShape.type === "image" || selectedShape.type === "rect" || selectedShape.type === "pencil") {
                const handleSize = 8 / camera.scale;
                ctx.fillStyle = "white";
                ctx.strokeStyle = "#4f46e5";
                ctx.lineWidth = 1.5 / camera.scale;
                
                const handles = [
                    { x: bbox.x, y: bbox.y },
                    { x: bbox.x + bbox.width, y: bbox.y },
                    { x: bbox.x, y: bbox.y + bbox.height },
                    { x: bbox.x + bbox.width, y: bbox.y + bbox.height }
                ];
                
                handles.forEach(h => {
                    ctx.beginPath();
                    ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
                    ctx.fill();
                    ctx.stroke();
                });
            }
            ctx.restore();
        }
    }
}

async function getExistingShapes(roomId: string, token: string) {
    try {
        const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
        console.log("Fetching existing shapes for room:", roomId);
        console.log("Using token:", authHeader.substring(0, 20) + "...");

        const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
            headers: {
                "Authorization": authHeader
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
        if (e.response) {
            console.error(`Failed to fetch existing shapes. Server said: ${e.response.status}`, e.response.data);
            if (e.response.status === 403) {
                console.error("403 Forbidden: Check if CLERK_SECRET_KEY is identical in both http-backend and ws-backend, and matches your Clerk dashboard.");
            }
        } else {
            console.error("Failed to fetch existing shapes", e.message || e);
        }
        return [];
    }
}

function simplifyPath(points: { x: number, y: number }[], tolerance: number = 3): { x: number, y: number }[] {
    if (points.length <= 2) return points;
    
    const result = [points[0]];
    let lastPoint = points[0];
    
    for (let i = 1; i < points.length - 1; i++) {
        const point = points[i];
        const dist = Math.sqrt(Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2));
        if (dist >= tolerance) {
            result.push(point);
            lastPoint = point;
        }
    }
    
    result.push(points[points.length - 1]);
    return result;
}
