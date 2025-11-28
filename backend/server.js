import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config(); // Load .env

const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP + WebSocket server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize Groq API
const groq = new Groq({
  apiKey: process.env.OPENAI_API_KEY, // MUST be inside .env
});

const PORT = process.env.PORT || 4000;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("user_message", async (text) => {
    console.log("User:", text);
    socket.emit("bot_typing");

    try {
      // Groq OSS 120B model response
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b", // NEW MODEL
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
      });

      const botReply = completion.choices[0]?.message?.content || "No response";

      socket.emit("bot_message", botReply);
    } catch (error) {
      console.error("Groq error:", error);
      socket.emit("bot_message", "API error: " + error.message);
    }

    socket.emit("bot_stop_typing");
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Chatbot running on port", PORT);
});
