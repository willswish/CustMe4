import React from "react";
import { Avatar, IconButton } from "@mui/material";
import { Phone, VideoCall, MoreHoriz } from "@mui/icons-material";

interface User {
  id: number;
  name: string;
  avatar: string;
  online: boolean;
}

interface ChatHeaderProps {
  user: User | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ user }) => {
  return (
    <div className="py-2 px-4 border-b hidden lg:block">
      {user ? (
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <Avatar
              src={user.avatar || "https://via.placeholder.com/40"}
              alt={user.name || "Unknown"}
            />
            <div className="leading-tight">
              <div className="text-md">{user.name || "Unknown"}</div>
              <span className="text-green-500">Online</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <IconButton>
              <Phone />
            </IconButton>
            <IconButton>
              <VideoCall />
            </IconButton>
            <IconButton>
              <MoreHoriz />
            </IconButton>
          </div>
        </div>
      ) : (
        <p>Select a user to start chatting.</p>
      )}
    </div>
  );
};

export default ChatHeader;
