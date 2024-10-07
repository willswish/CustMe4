import React, { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Badge,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Container,
  Card,
} from "@mui/material";
import { Phone, VideoCall, MoreHoriz, Send, Search as SearchIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useChat } from "../../../context/ChatContext";
import { useUserProfile } from "../../../context/UserProfileContext";
import { useAuth } from "../../../context/AuthContext";
import Header from "../components/header";
import Pusher from "pusher-js";

const ChatForm: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth(); // Get logged-in user from AuthContext
  const { chats, sendMessage, userChatList } = useChat();
  const { userProfile, fetchUserProfile } = useUserProfile();
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [selectedChatUser, setSelectedChatUser] = useState<any>(null);
  const channelRef = useRef<any>(null); // Ref to store the Pusher channel

  // Initialize Pusher
  useEffect(() => {
    const pusher = new Pusher("087ae63043c8feb92728", {
      cluster: "ap1",
      authEndpoint: "/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    });

    // Subscribe to the channel and bind to the event if user is available
    if (user) { // Use user from useAuth
      channelRef.current = pusher.subscribe(`private-chat.${user.id}`);
      channelRef.current.bind("message.sent", () => {
        // Update chats state when a new message is sent
        fetchUserProfile(); // Fetch the user profile to update the UI
      });
    }

    return () => {
      // Cleanup on component unmount
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusher.unsubscribe(`private-chat.${user?.id}`);
      }
    };
  }, [user, fetchUserProfile]);

  // Set selected chat user based on userId from params or userChatList
  useEffect(() => {
    if (userId) {
      const foundUser = userChatList.find((chat) => chat.id === Number(userId));
      setSelectedChatUser(foundUser || null);
    } else if (userChatList.length > 0) {
      setSelectedChatUser(userChatList[0]);
    } else {
      setSelectedChatUser(null);
    }
  }, [userId, userChatList]);

  // Function to handle sending messages
  const handleSendMessage = async () => {
    const receiverId = selectedChatUser ? selectedChatUser.id : Number(userId);
    if (currentMessage.trim() && receiverId) {
      try {
        await sendMessage(currentMessage, receiverId); // Send message
        setCurrentMessage(""); // Clear the input message
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  // Prepare user's profile picture URL
  const personalInformation = userProfile?.personalInformation;
  const profilePictureUrl = personalInformation?.profilepicture
    ? `http://127.0.0.1:8000/${personalInformation.profilepicture}`
    : null;

  // Filter messages for the selected user
  const filteredMessages = chats.filter(chat =>
    (chat.sender_id === selectedChatUser?.id && chat.receiver_id === user.id) ||
    (chat.receiver_id === selectedChatUser?.id && chat.sender_id === user.id)
  );

  return (
    <main className="flex flex-col h-full w-full">
      <Header />
      <Container maxWidth={false} className="p-0 h-full mt-16">
        <Card className="shadow-sm m-0 h-full w-full">
          <div className="grid grid-cols-12 gap-0 h-full">
            <div className="col-span-12 lg:col-span-5 xl:col-span-3 border-r h-full">
              <div className="p-4 hidden md:block">
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <List>
                {userChatList.length > 0 ? (
                  userChatList.map((chat) => (
                    <ListItem
                      key={chat.id}
                      component="div"
                      className={`border-b hover:bg-gray-100 ${selectedChatUser?.id === chat.id ? 'bg-gray-200' : ''}`}
                      onClick={() => {
                        setSelectedChatUser(chat);
                        navigate(`/chat/${chat.id}`);
                      }}
                    >
                      <ListItemAvatar>
                        <Badge color="success" variant="dot" invisible={!chat.online}>
                          <Avatar
                            src={chat.avatar || "https://via.placeholder.com/40"}
                            alt={chat.username || "User"}
                            className="rounded-full"
                          />
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={chat.username || "User"}
                        secondary={
                          chat.online ? (
                            <span className="text-green-500">Online</span>
                          ) : (
                            <span className="text-red-500">Offline</span>
                          )
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <p className="p-4">No users found.</p>
                )}
              </List>
            </div>

            <div className="col-span-12 lg:col-span-7 xl:col-span-9 h-full">
              {selectedChatUser ? (
                <div className="py-2 px-4 border-b hidden lg:block">
                  <div className="flex justify-between">
                    <div className="flex space-x-4">
                      {profilePictureUrl ? (
                        <Avatar
                          src={profilePictureUrl}
                          alt={`${personalInformation?.firstname} ${personalInformation?.lastname}`}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <span></span>
                        </div>
                      )}
                      <div className="leading-tight">
                        <div className="text-md">
                          {selectedChatUser.username || "Unknown"} 
                        </div>
                        <span className={selectedChatUser.online ? "text-green-500" : "text-red-500"}>
                          {selectedChatUser.online ? "Online" : "Offline"}
                        </span>
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
                </div>
              ) : (
                <p className="p-4">Select a user to start chatting.</p>
              )}

              {/* Chat messages */}
              <div
                className="chat-messages p-4 flex-grow overflow-y-auto"
                style={{
                  height: "400px",
                  overflowY: "auto",
                }}
              >
                {filteredMessages.length > 0 ? (
                  filteredMessages.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex ${chat.sender_id === user.id ? "justify-end" : "justify-start"} mb-2`}
                    >
                      <div
                        className={`p-2 rounded-lg max-w-xs ${
                          chat.sender_id === user.id ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                      >
                        {chat.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4">No messages yet.</p>
                )}
              </div>

              {/* Message input */}
              <div className="p-4 border-t flex items-center">
                <TextField
                  variant="outlined"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  className="flex-grow"
                />
                <IconButton onClick={handleSendMessage} disabled={!currentMessage.trim()}>
                  <Send />
                </IconButton>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </main>
  );
};

export default ChatForm;
