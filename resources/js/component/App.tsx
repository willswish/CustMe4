import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../component/context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Routes from './routes/Routes';
import { PostProvider } from './context/PostContext';
import { RequestProvider } from './context/RequestContext';
import { NotificationProvider } from './context/NotificationContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { StoreProvider } from './context/StoreContext';
import { ChatProvider } from './context/ChatContext';
import { ClientProfileProvider } from './context/ClientProfileContext'; 
import { SearchProvider } from './context/SearchContext';
import { DesignerProvider } from './context/Desing&ProviderContext';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <PostProvider>
                    <RequestProvider>
                        <NotificationProvider>
                            <UserProfileProvider>
                                <StoreProvider>
                                    <ChatProvider>
                                        <TaskProvider>
                                            <ClientProfileProvider>
                                                <SearchProvider>
                                                    <DesignerProvider>
                                                        <Routes />
                                                    </DesignerProvider>
                                                </SearchProvider>
                                            </ClientProfileProvider>
                                        </TaskProvider>
                                    </ChatProvider>
                                </StoreProvider>
                            </UserProfileProvider>
                        </NotificationProvider>
                    </RequestProvider>
                </PostProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
