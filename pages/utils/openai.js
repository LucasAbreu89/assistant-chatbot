import { OpenAI } from "openai";
import * as dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getAssistant = async (assistantId) => {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant;
  } catch (error) {
    console.error("Error in getAssistant:", error);
    throw error;
  }
};


export const createThread = async () => {
  try {
    const thread = await openai.beta.threads.create();
    return thread;
  } catch (error) {
    console.error("Error in createThread:", error);
    throw error;
  }
};

export const createMessage = async ({ threadId, content }) => {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
    });
    return message;
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw error;
  }
};

export const runAssistant = async ({ assistantId, threadId, instructions }) => {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions: instructions,
    });
    return run;
  } catch (error) {
    console.error("Error in runAssistant:", error);
    throw error;
  }
};

export const runCheck = async ({ threadId, runId }) => {
  try {
    const check = await openai.beta.threads.runs.retrieve(threadId, runId);
    return check;
  } catch (error) {
    console.error("Error in runCheck:", error);
    throw error;
  }
};

export const getMessages = async (threadId) => {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages;
  } catch (error) {
    console.error("Error in getMessages:", error);
    throw error;
  }
};