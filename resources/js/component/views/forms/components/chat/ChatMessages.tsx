import React from "react";
import { Avatar } from "@mui/material";

interface User {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
}

interface Chat {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  user: User;
}

interface ChatMessagesProps {
  chats: Chat[];
  currentUser: User | null;
  loggedInUserId: number;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ chats, currentUser, loggedInUserId }) => {
  return (
    <div className="chat-messages p-4 h-[400px] overflow-y-scroll">
      {chats.length > 0 ? (
        chats
          .filter((chat) => chat.receiver_id === currentUser?.id || chat.sender_id === currentUser?.id)
          .map((chat, index) => (
            <div
              key={index}
              className={chat.sender_id === loggedInUserId ? "flex justify-end mb-4" : "flex justify-start mb-4"}
            >
              <div className="flex items-end">
                <Avatar
                  src={chat.user?.avatar || "https://via.placeholder.com/40"}
                  alt={chat.user?.name || "Unknown"}
                  className="mr-2"
                />
                <div
                  className={`rounded-lg p-3 ${
                    chat.sender_id === loggedInUserId ? "bg-blue-500 text-white" : "bg-gray-100"
                  }`}
                >
                  <div className="font-bold mb-1">{chat.user?.name || "Unknown"}</div>
                  <div>{chat.content}</div>
                </div>
              </div>
            </div>
          ))
      ) : (
        <p className="text-center">No messages yet. Start a conversation.</p>
      )}
    </div>
  );
};

export default ChatMessages;
