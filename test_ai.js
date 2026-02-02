
async function testAI() {
    try {
        const response = await fetch("http://localhost:3001/ai-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: "Hello" }] })
        });
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
testAI();
