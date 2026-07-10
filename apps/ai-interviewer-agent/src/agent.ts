import {
  cli,
  defineAgent,
  multimodal,
} from '@livekit/agents';
import { deepgram } from '@livekit/agents-plugin-deepgram';
import { openai } from '@livekit/agents-plugin-openai';
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
    console.log(`starting HLD interviewer for ${participant.identity}`);

    // Create the AI agent using Groq for LLM and Deepgram for STT/TTS
    const agent = new multimodal.MultimodalAgent({
      model: new openai.realtime.RealtimeModel({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama3-8b-8192',
      }),
      stt: new deepgram.STT({ apiKey: process.env.DEEPGRAM_API_KEY }),
      tts: new deepgram.TTS({ apiKey: process.env.DEEPGRAM_API_KEY }),
    });

    const session = await agent.start(ctx.room, participant);

    session.conversation.item.create({
      type: 'message',
      role: 'system',
      content: [{
        type: 'input_text',
        text: 'You are a Senior Staff Software Engineer conducting a High-Level Design (HLD) interview. The candidate is designing a scalable system. Ask probing questions about database choice, load balancing, single points of failure, and trade-offs. Be concise, professional, and conversational.'
      }]
    });

    session.conversation.item.create({
      type: 'message',
      role: 'assistant',
      content: [{
        type: 'input_text',
        text: 'Hello! I am your AI interviewer today. Whenever you are ready, please start explaining your high-level design, and I will jump in with questions.'
      }]
    });
    
    session.response.create();
  },
});

cli.runApp({ agent: fileURLToPath(import.meta.url) });

