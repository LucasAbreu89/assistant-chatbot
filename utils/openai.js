import { OpenAI } from "openai";
import * as dotenv from "dotenv";
import fs from 'fs';

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

export const createMessage = async ({ threadId, content, fileIds }) => {
  try {
    const messageData = { role: "user", content: content };
    if (fileIds && fileIds.length) {
      messageData.file_ids = fileIds;
    }

    const message = await openai.beta.threads.messages.create(threadId, messageData);
    return message;
  } catch (error) {
    console.error("Error in createMessage:", error);
    throw error;
  }
};


export const runAssistant = async ({ assistantId, threadId, instructions }) => {
  try {
    const fullInstructions = instructions + " Important Instruction: This user doesn't understand LATEX, expressions in plain text. This is an IB Diploma student who is studying either Physics HL or SL";

    // Log antes de enviar a requisição
    // console.log("Running assistant with:", { assistantId, threadId, fullInstructions });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      instructions: fullInstructions,
    });

    // Log para ver a resposta da OpenAI
    console.log("Response from OpenAI:", run);

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

export const UploadFile = async (filePath) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const file = await openai.files.create({
      file: fileStream,
      purpose: "assistants",
    });
    // console.log("Resposta da OpenAI:", file); // Log da resposta completa
    // console.log(filePath)
    return file;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    throw error;
  }
};



export const updateThreadWithFile = async (threadId, fileId) => {
  try {
    const updatedThread = await openai.beta.threads.update(threadId, {
      metadata: {
        fileUploaded: "true",
        fileId: fileId,
      }
    });
    console.log(`Thread updated with id: ${threadId} and file id: ${fileId}`);
    return updatedThread;
  } catch (error) {
    console.error("Error updating thread with file:", error);
    throw error;
  }
};

export const createMessageWithFile = async ({ threadId, content, fileId }) => {
  try {
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: content,
      file_ids: [fileId],
    });
    return message;
  } catch (error) {
    console.error("Error in createMessageWithFile:", error);
    throw error;
  }
};

export const fetchImageFromOpenAI = async (fileId) => {
  try {
    const response = await openai.files.content(fileId);
    const image_data = await response.arrayBuffer();
    const image_data_buffer = Buffer.from(image_data);
    return image_data_buffer.toString('base64');
  } catch (error) {
    console.error("Error fetching image from OpenAI:", error);
    throw error;
  }
};
