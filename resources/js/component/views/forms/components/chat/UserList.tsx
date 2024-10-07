import React from "react";
import {
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";

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

interface UserListProps {
  chats: Chat[];
  onSelectUser: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ chats, onSelectUser }) => {
  const uniqueChats = chats.reduce<Chat[]>((acc, currentChat: Chat) => {
    const existingUser = acc.find((chat) => chat.user?.id === currentChat.user?.id);
    if (!existingUser) {
      acc.push(currentChat);
    }
    return acc;
  }, []);

  return (
    <List>
      {uniqueChats.map((chat, index) => (
        <ListItem
          key={index}
          component="div"
          className="border-b hover:bg-gray-100"
          onClick={() => onSelectUser(chat.user)}
        >
          <ListItemAvatar>
            <Badge
              color="success"
              variant="dot"
              invisible={!chat.user?.online}
            >
              <Avatar
                src={chat.user?.avatar || "https://via.placeholder.com/40"}
                alt={chat.user?.name || "Unknown"}
                className="rounded-full"
              />
            </Badge>
          </ListItemAvatar>
          <ListItemText
            primary={chat.user?.name || "Unknown User"}
            secondary={
              chat.user?.online ? (
                <span className="text-green-500">Online</span>
              ) : (
                <span className="text-red-500">Offline</span>
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;
