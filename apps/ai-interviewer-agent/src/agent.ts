import {
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as openai from '@livekit/agents-plugin-openai';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log('Agent connected to room, waiting for participant...');

    const participant = await ctx.waitForParticipant();
    console.log(`Starting AI interview for ${participant.identity}`);

    const agent = new voice.Agent({
      instructions: 'You are a Senior Staff Software Engineer conducting a High-Level Design (HLD) interview. The candidate is designing a scalable system. Ask probing questions about database choice, load balancing, single points of failure, and trade-offs. Be concise, professional, and conversational.',
      stt: new deepgram.STT({ apiKey: process.env.DEEPGRAM_API_KEY }),
      tts: new deepgram.TTS({ apiKey: process.env.DEEPGRAM_API_KEY }),
      llm: new openai.LLM({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama3-8b-8192',
      }),
    });

    const session = new voice.AgentSession();
    await session.start({ agent, room: ctx.room });
    
    session.say('Hello! I am your AI interviewer today. Whenever you are ready, please start explaining your high-level design, and I will jump in with questions.');
  },
});

cli.runApp({ agent: fileURLToPath(import.meta.url) });

