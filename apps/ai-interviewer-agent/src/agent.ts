import {
  WorkerOptions,
  WorkerType,
  cli,
  defineAgent,
  multimodal,
} from '@livekit/agents';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log('waiting for participant');
    const participant = await ctx.waitForParticipant();
    console.log(`starting assistant example for ${participant.identity}`);

    const agent = new multimodal.MultimodalAgent({
      // We will configure the Groq LLM and Deepgram here
      // model: new openai.realtime.RealtimeModel({ ... })
    });

    const session = await agent.start(ctx.room, participant);

    session.conversation.item.create({
      type: 'message',
      role: 'system',
      content: [{
        type: 'input_text',
        text: 'You are a Senior Staff Software Engineer conducting a High-Level Design (HLD) interview. Ask probing questions about system architecture, databases, load balancing, and trade-offs. Be conversational and concise.'
      }]
    });

    session.conversation.item.create({
      type: 'message',
      role: 'assistant',
      content: [{
        type: 'input_text',
        text: 'Hello! I am your AI interviewer today. Are you ready to start our high-level design session?'
      }]
    });
    
    session.response.create();
  },
});

cli.runApp(new WorkerOptions({ agent: fileURLToPath(import.meta.url), workerType: WorkerType.ROOM }));
