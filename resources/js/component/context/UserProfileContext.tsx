import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

interface ArtistProvider {
  id: number;
  name: string;
  profilePicture: string | null;
  roleName?: string; // Add roleName to identify the type of provider
  bio?: string; // Add any other details you want to display
}

interface PersonalInformation {
  firstname: string;
  lastname: string;
  profilepicture: string | null;
  coverphoto: string | null;
  zipcode: string;
  artistPrintingProviders?: ArtistProvider[]; 
}

// Define UserProfile interface
interface UserProfile {
  id: number;
  username: string;
  email: string;
  verified: boolean;
  personalInformation: PersonalInformation | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null; // Add location to UserProfile interface
}

// Define UserProfileContextProps interface
interface UserProfileContextProps {
  userProfile: UserProfile | null;
  fetchUserProfile: () => Promise<void>;
  fetchUserProfileById: (userId: number) => Promise<UserProfile | null>; // New method to fetch a user profile by ID
  updateUserProfile: (updatedProfile: Partial<PersonalInformation>) => Promise<void>;
  artistAndPrintingProviders: UserProfile[] | null; // State for providers
  fetchArtistAndPrintingProviders: () => Promise<void>; // Method to fetch providers
}

// Create UserProfileContext
const UserProfileContext = createContext<UserProfileContextProps | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [artistAndPrintingProviders, setArtistAndPrintingProviders] = useState<UserProfile[] | null>(null); // State for providers
  const { user } = useAuth(); // Use the Auth context to get the current user

  // Role mapping
  const roleMapping: { [key: number]: string } = {
    3: "Graphic Designer",
    4: "Printing Provider"
  };

  // Fetch user profile method
  const fetchUserProfile = useCallback(async () => {
    if (!user) return; // Check if user is authenticated

    try {
      const response = await apiService.get(`/users/${user.id}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const fetchedData = response.data;

      // Debugging: Log the fetched data
      console.log('Fetched UserProfile Data:', fetchedData);

      if (fetchedData && fetchedData.user) {
        const location = fetchedData.user.stores.length > 0 ? fetchedData.user.stores[0].location : null;

        const profileData: UserProfile = {
          id: fetchedData.user.id,
          username: fetchedData.user.username,
          email: fetchedData.user.email,
          verified: fetchedData.user.verified === 1,
          personalInformation: {
            firstname: fetchedData.user.personal_information.firstname,
            lastname: fetchedData.user.personal_information.lastname,
            profilepicture: fetchedData.user.personal_information.profilepicture || null,
            coverphoto: fetchedData.user.personal_information.coverphoto || null,
            zipcode: fetchedData.user.personal_information.zipcode,
          },
          location: location || null, // Set location if it exists
        };

        setUserProfile(profileData);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    }
  }, [user]);

  // New method to fetch user profile by ID
  const fetchUserProfileById = useCallback(async (userId: number) => {
    try {
      const response = await apiService.get(`/provider/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const fetchedData = response.data;

      // Debugging: Log the fetched data
      console.log('Fetched User Profile by ID:', fetchedData);

      if (fetchedData && fetchedData.user) {
        const profileData: UserProfile = {
          id: fetchedData.user.id,
          username: fetchedData.user.username,
          email: fetchedData.user.email,
          verified: fetchedData.user.verified === 1,
          personalInformation: {
            firstname: fetchedData.user.personal_information.firstname,
            lastname: fetchedData.user.personal_information.lastname,
            profilepicture: fetchedData.user.personal_information.profilepicture || null,
            coverphoto: fetchedData.user.personal_information.coverphoto || null,
            zipcode: fetchedData.user.personal_information.zipcode,
          },
          location: null, // You can adjust this based on your response
        };

        return profileData; // Return the fetched profile
      }
    } catch (error) {
      console.error('Failed to fetch user profile by ID:', error);
    }
    return null; // Return null if the fetch fails
  }, []);

  // Update user profile method
  const updateUserProfile = useCallback(
    async (updatedProfile: Partial<PersonalInformation>) => {
      if (!user) return; // Ensure the user is authenticated
  
      try {
        const response = await apiService.put(`/users/${user.id}/profile`, updatedProfile, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        console.log('Profile updated successfully:', response.data);
  
        setUserProfile((prevProfile) => {
          if (prevProfile) {
            return {
              ...prevProfile,
              personalInformation: {
                ...prevProfile.personalInformation,
                ...updatedProfile,
              } as PersonalInformation, 
            };
          }
          return prevProfile;
        });
      } catch (error) {
        console.error('Failed to update user profile:', error);
      }
    },
    [user]
  );

  // Fetch Artist and Printing Providers
  const fetchArtistAndPrintingProviders = useCallback(async () => {
    try {
      const response = await apiService.get('/users/artist-and-printing-provider', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      const providersData = response.data.users; // Adjust based on your API response structure

      // Map roles to providers
      const enrichedProviders = providersData.map((provider) => ({
        ...provider,
        roleName: roleMapping[provider.role_id] || 'Unknown Role', // Set role name based on ID
      }));

      // Debugging: Log the fetched artist and printing providers
      console.log('Fetched Artist and Printing Providers:', enrichedProviders);

      setArtistAndPrintingProviders(enrichedProviders);
    } catch (error) {
      console.error('Failed to fetch artist and printing providers:', error);
      setArtistAndPrintingProviders(null);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile(); // Fetch the user profile when the component mounts
    fetchArtistAndPrintingProviders(); // Fetch artist and printing providers on mount
  }, [fetchUserProfile, fetchArtistAndPrintingProviders]);

  return (
    <UserProfileContext.Provider value={{ userProfile, fetchUserProfile, fetchUserProfileById, updateUserProfile, artistAndPrintingProviders, fetchArtistAndPrintingProviders }}>
      {children}
    </UserProfileContext.Provider>
  );
};

// Custom hook to use the UserProfileContext
export const useUserProfile = (): UserProfileContextProps => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};
