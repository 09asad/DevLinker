const socket = require("socket.io");
const Chat = require("../models/chat");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "https://devlinker.tech",
    },
  });

  io.on("connection", (socket) => {
    // Handle Events

    socket.on("joinChat", ({ firstName, userId, toUserId }) => {
      const roomId = [userId, toUserId].sort().join("_");
      console.log(firstName + " joined the room with id : " + roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", async ({ firstName, userId, toUserId, text }) => {
      try {
        const roomId = [userId, toUserId].sort().join("_");

        // save message to the database
        let chat = await Chat.findOne({
          participants: { $all: [userId, toUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, toUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });
        await chat.save();
        io.to(roomId).emit("messageReceived", { firstName, text });
        
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
