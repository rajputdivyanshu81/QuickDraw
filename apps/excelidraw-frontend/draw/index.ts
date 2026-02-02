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
    type: "image";
    data: string;
    x: number;
    y: number;
    width: number;
    height: number;
}) & { id: string; color?: string };

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "text" | "select" | "line" | "pan" | "ppt-capture" | "laser";

type LaserPointerData = {
    points: { x: number, y: number, timestamp: number }[],
    name: string,
    lastUpdate: number
};

const isTextShape = (shape: Shape): shape is Extract<Shape, { type: "text" }> => {
    return shape.type === "text";
};

export async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, initialTool: Tool, token: string, onZoomChange?: (scale: number) => void, initialBackgroundColor: string = "#ffffff", onCapture?: (image: string) => void) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageCache = new Map<string, HTMLImageElement>();

    let selectedTool: Tool = initialTool;
    let selectedColor: string = "black";
    let backgroundColor: string = initialBackgroundColor;

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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
        } else if (parsedData.type === "delete_shape") {
            const shapeId = parsedData.shapeId;
            const index = existingShapes.findIndex(s => s.id === shapeId);
            if (index !== -1) {
                existingShapes.splice(index, 1);
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
        } else if (parsedData.type === "update_shape") {
            const updatedShape = parsedData.shape;
            const index = existingShapes.findIndex(s => s.id === updatedShape.id);
            if (index !== -1) {
                existingShapes[index] = updatedShape;
            } else {
                existingShapes.push(updatedShape);
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
        }
    }

    getExistingShapes(roomId, token).then(history => {
        history.forEach((shape: Shape) => {
            if (!existingShapes.some(s => s.id === shape.id)) {
                existingShapes.push(shape);
            }
        });
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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

    let selectedShape: Shape | null = null;
    let startDragShape: Shape | null = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let isResizing = false;
    let resizeHandle: "nw" | "ne" | "sw" | "se" | null = null;

    let isSpacePressed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space" && !isSpacePressed) {
            isSpacePressed = true;
            canvas.style.cursor = "grab";
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
                } else if (selectedShape.type === "image") {
                    // Check for resize handles
                    const handleSize = 8 / camera.scale;
                    const handles = [
                        { id: "nw" as const, x: selectedShape.x, y: selectedShape.y },
                        { id: "ne" as const, x: selectedShape.x + selectedShape.width, y: selectedShape.y },
                        { id: "sw" as const, x: selectedShape.x, y: selectedShape.y + selectedShape.height },
                        { id: "se" as const, x: selectedShape.x + selectedShape.width, y: selectedShape.y + selectedShape.height }
                    ];

                    const clickedHandle = handles.find(h =>
                        worldPos.x >= h.x - handleSize && worldPos.x <= h.x + handleSize &&
                        worldPos.y >= h.y - handleSize && worldPos.y <= h.y + handleSize
                    );

                    if (clickedHandle) {
                        isResizing = true;
                        resizeHandle = clickedHandle.id;
                    } else {
                        isResizing = false;
                        dragOffsetX = worldPos.x - selectedShape.x;
                        dragOffsetY = worldPos.y - selectedShape.y;
                    }
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
                clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
                    if (onCapture) {
                        onCapture(tempCanvas.toDataURL("image/png"));
                    }
                }
            }
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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

        if (shape) {
            existingShapes.push(shape);
            addToHistory({ type: "add", shape });
            socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape }),
                roomId
            }));
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
        }

        if (selectedTool === "select" && startDragShape && JSON.stringify(selectedShape) !== JSON.stringify(startDragShape)) {
            addToHistory({ type: "update", oldShape: startDragShape, newShape: JSON.parse(JSON.stringify(selectedShape)) });
            socket.send(JSON.stringify({
                type: "update_shape",
                shape: selectedShape,
                roomId
            }));
        }

        isResizing = false;
        resizeHandle = null;
        selectedShape = null;
        startDragShape = null;
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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
            return;
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        if (clicked) {
            const worldPos = screenToWorld(e.offsetX, e.offsetY);
            const width = worldPos.x - startX;
            const height = worldPos.y - startY;

            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);

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
                    clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
                } else if (selectedShape.type === "image") {
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
                clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
            clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);

            socket.send(JSON.stringify({
                type: "laser_pointer",
                roomId,
                x: worldPos.x,
                y: worldPos.y
            }));
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
        backgroundColor = newColor;
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers);
    };

    const resetView = () => {
        camera.x = 0;
        camera.y = 0;
        camera.scale = 1;
        onZoomChange?.(camera.scale);
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, selectedShape, laserPointers);
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers);
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers);
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
        clearCanvas(existingShapes, canvas, ctx!, camera, backgroundColor, imageCache, null, laserPointers);
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
        } else if (shape.type === "image") {
            if (x >= shape.x - threshold && x <= shape.x + shape.width + threshold &&
                y >= shape.y - threshold && y <= shape.y + shape.height + threshold) {
                return shape;
            }
        }
    }
    return null;
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number }, backgroundColor: string, imageCache: Map<string, HTMLImageElement>, selectedShape: Shape | null = null, laserPointers?: Map<string, LaserPointerData>) {
    renderScene(existingShapes, canvas, ctx, camera, backgroundColor, imageCache, selectedShape, laserPointers);
}

function renderScene(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, camera: { x: number, y: number, scale: number }, backgroundColor: string, imageCache: Map<string, HTMLImageElement>, selectedShape: Shape | null = null, laserPointers?: Map<string, LaserPointerData>) {
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

    // Draw handles for selected image
    if (selectedShape && selectedShape.type === "image") {
        const handleSize = 8 / camera.scale;
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2 / camera.scale;
        ctx.strokeRect(selectedShape.x, selectedShape.y, selectedShape.width, selectedShape.height);

        ctx.fillStyle = "white";
        const handles = [
            { x: selectedShape.x, y: selectedShape.y },
            { x: selectedShape.x + selectedShape.width, y: selectedShape.y },
            { x: selectedShape.x, y: selectedShape.y + selectedShape.height },
            { x: selectedShape.x + selectedShape.width, y: selectedShape.y + selectedShape.height }
        ];

        handles.forEach(h => {
            ctx.beginPath();
            ctx.rect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        });
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
