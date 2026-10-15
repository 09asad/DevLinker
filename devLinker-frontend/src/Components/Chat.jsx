import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";

const Chat = () => {
  const { toUserId } = useParams();
  const [receiver, setReceiver] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const userId = user?._id;
  const firstName = user?.firstName;

  const isConnection = connections?.find(
    (connection) => connection._id === toUserId,
  );

  const fetchChatMessage = async () => {
    if (!isConnection) {
      setMessages([]);
      setError("You are not connected with this user. Please connect first to start chatting.");
      return;
    }
    setError(""); // Clear any previous error if the user is connected
    
    try {
      const chat = await axios.get(BASE_URL + "/chat/" + toUserId, {
        withCredentials: true,
      });

      const chatMessages = chat?.data?.messages.map((msg) => {
        const { senderId, text } = msg;
        return {
          firstName: senderId?.firstName,
          text,
        };
      });
      setMessages(chatMessages);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch chat messages. Please try again later.");
    }
  };

  useEffect(() => {
    fetchChatMessage();
  }, [isConnection, toUserId]);

  useEffect(() => {
    getUser();
  }, [toUserId]);

  useEffect(() => {
    if (!userId || !toUserId || !isConnection) return;

    const socket = createSocketConnection();

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("joinChat", {
        firstName,
        userId,
        toUserId,
      });
    });

    socket.on("messageReceived", ({ firstName, text }) => {
      console.log(firstName + " : " + text);
      setMessages((messages) => [...messages, { firstName, text }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, toUserId, isConnection]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit("sendMessage", {
      firstName: user.firstName,
      userId,
      toUserId,
      text: newMessage,
    });
    setNewMessage("");
  };

  const getUser = async () => {
    const res = await axios.get(BASE_URL + "/user/" + toUserId, {
      withCredentials: true,
    });
    setReceiver(res.data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[80vh] bg-gray-800 rounded-2xl shadow-xl flex flex-col">
      <div className="h-16 border-b border-gray-500 flex items-center px-6">
        <h2 className="text-xl font-bold">
          Chat with{" "}
          {receiver ? `${receiver.firstName} ${receiver.lastName}` : "receiver"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-red-400 text-2xl font-semibold">{error}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMyMessage = message.firstName === user?.firstName;

            return (
              <div
                key={index}
                className={isMyMessage ? "chat chat-end" : "chat chat-start"}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={isMyMessage ? user?.photoURL : receiver?.photoURL}
                    />
                  </div>
                </div>

                <div className="chat-header">{message.firstName}</div>
                <div className="chat-bubble">{message.text}</div>
              </div>
            );
          })
        )}
      </div>

      {!error && (
        <div className="h-20 border-t border-gray-500 flex items-center gap-3 px-4">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input input-bordered flex-1 rounded-lg"
          />

          <button className="btn btn-primary rounded-lg" onClick={sendMessage}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default Chat;
