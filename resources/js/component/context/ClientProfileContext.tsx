import React, { createContext, useContext, useState, ReactNode } from 'react';
import apiService from '../services/apiService';

interface Role {
  roleid: number;
  rolename: string;
  created_at: string;
  updated_at: string;
}

interface PersonalInformation {
  firstname: string;
  lastname: string;
  profilepicture: string | null;
  coverphoto: string | null;
  zipcode: string;
}

interface Image {
  image_id: number;
  image_path: string;
  created_at: string;
  updated_at: string;
  post_id: number;
}

interface Post {
  post_id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  user_id: number;
  images: Image[];
}

interface Store {
  id: number;
  storename: string;
  description: string;
  location_id: number;
  user_id: number;
  location: {
    id: number;
    longitude: string;
    latitude: string;
    address: string;
    created_at: string;
    updated_at: string;
  };
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: Role; // Updated to include the role
  personal_information: PersonalInformation;
  stores: Store[];
  posts: Post[];
}

interface ClientProfileContextProps {
  profile: UserProfile | null;
  fetchProfile: (userId: number) => Promise<void>;
  updateProfile: (
    userId: number,
    data: Partial<PersonalInformation>,
    files?: { profilepicture?: File; coverphoto?: File }
  ) => Promise<void>;
  loading: boolean;
}

const ClientProfileContext = createContext<ClientProfileContextProps | undefined>(undefined);

interface ClientProfileProviderProps {
  children: ReactNode;
}

export const ClientProfileProvider: React.FC<ClientProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchProfile = async (userId: number) => {
    if (loading || (profile && profile.id === userId)) {
      console.log('Profile already loaded or loading in progress, skipping fetch.');
      return;
    }

    setLoading(true);
    console.log(`Fetching profile for user ID: ${userId}`);

    try {
      const response = await apiService.get(`/users/${userId}/profile`);
      console.log('Profile fetched:', response.data);
      setProfile(response.data.user); // Ensure response data includes role
    } catch (error) {
      console.error('Error fetching client profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (
    userId: number,
    data: Partial<PersonalInformation>,
    files?: { profilepicture?: File; coverphoto?: File }
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('firstname', data.firstname || '');
    formData.append('lastname', data.lastname || '');

    if (files?.profilepicture) {
      formData.append('profilepicture', files.profilepicture);
    }
    if (files?.coverphoto) {
      formData.append('coverphoto', files.coverphoto);
    }

    formData.append('_method', 'PUT');

    try {
      const response = await apiService.post(`/users/${userId}/updateprofile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.status === 200) {
        console.log('Profile successfully updated on server.');
        await fetchProfile(userId); // Refetch profile to update with latest data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <ClientProfileContext.Provider value={{ profile, fetchProfile, updateProfile, loading }}>
      {children}
    </ClientProfileContext.Provider>
  );
};

export const useClientProfile = (): ClientProfileContextProps => {
  const context = useContext(ClientProfileContext);
  if (!context) {
    throw new Error('useClientProfile must be used within a ClientProfileProvider');
  }
  return context;
};
