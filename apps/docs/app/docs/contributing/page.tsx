import React from 'react';

export default function ContributingPage() {
  return (
    <article className="prose max-w-none">
      <h1 className="gradient-text">Contributing to QuickDraw</h1>
      <p>
        Contributions are what make the open source community such an amazing place to learn, 
        inspire, and create. Any contributions you make are **greatly appreciated**.
      </p>

      <h2>Getting Started</h2>
      
      <h3>Prerequisites</h3>
      <ul>
        <li><strong>Node.js</strong>: Version 20 or 22</li>
        <li><strong>pnpm</strong>: Version 9.x (Required for monorepo)</li>
        <li><strong>Docker</strong>: For running the local database</li>
      </ul>

      <h3>Local Setup</h3>
      <pre>
        <code>{`git clone https://github.com/rajputdivyanshu81/QuickDraw.git
cd QuickDraw
pnpm install`}</code>
      </pre>

      <h3>Database Setup</h3>
      <p>We use Docker Compose to make database setup effortless.</p>
      <pre>
        <code>{`docker-compose up -d
pnpm db:generate`}</code>
      </pre>

      <h3>Running Development</h3>
      <pre>
        <code>{`pnpm dev`}</code>
      </pre>

      <h2>Monorepo Structure</h2>
      <p>QuickDraw uses a modular monorepo architecture:</p>
      <ul>
        <li><strong>apps/excelidraw-frontend</strong>: The main drawing application.</li>
        <li><strong>apps/http-backend</strong>: REST API for users and rooms.</li>
        <li><strong>apps/ws-backend</strong>: WebSocket server for real-time sync.</li>
        <li><strong>apps/docs</strong>: This documentation site!</li>
        <li><strong>packages/ui</strong>: Shared React component library.</li>
      </ul>

      <h2>Pull Request Process</h2>
      <ol>
        <li>Create a feature branch from <code>main</code>.</li>
        <li>Ensure all CI checks pass (<code>pnpm lint</code>, <code>pnpm check-types</code>).</li>
        <li>Submit your PR with a clear description and screenshots if applicable.</li>
      </ol>
    </article>
  );
}
