# Scaling Analysis Prompt

Use this prompt to evaluate the scalability of a new feature or architectural change.

## Context
QuickDraw is a collaborative system where data frequency is high and latency is critical.

## Instructions
Analyze the current codebase and the proposed change. Answer the following:
1. **O(N) Complexity**: How does the message frequency change as the number of users in a room (N) increases? Is it O(N) or O(N^2)?
2. **Memory Footprint**: Will the server-side memory usage grow linearly or exponentially?
3. **Database Contention**: How many DB writes per second will this feature generate at 1,000 concurrent users?
4. **Bottleneck Identification**: Where is the first point of failure (CPU, Network BW, DB I/O, or Redis latency)?

## Output
Provide a **Scaling Risk Score** (1-10) and a list of mitigation strategies (e.g., throttling, batching, partitioning).
