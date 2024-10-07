import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

// Define Personal Information interface
interface PersonalInformation {
  firstname: string;
  lastname: string;
  profilepicture: string | null;
  coverphoto: string | null;
  zipcode: string;
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
  updateUserProfile: (updatedProfile: Partial<PersonalInformation>) => Promise<void>; // Add updateUserProfile
}

// Create UserProfileContext
const UserProfileContext = createContext<UserProfileContextProps | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user } = useAuth(); // Use the Auth context to get the current user

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
        // Log personal information for debugging
        console.log('Personal Information:', fetchedData.user.personal_information);

        // Extracting the first store's location if available
        const location = fetchedData.user.stores.length > 0 ? fetchedData.user.stores[0].location : null;
        if (location) {
          console.log('User Location:', location);
        } else {
          console.warn('No location information available for user profile');
        }

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
        console.warn('No personal information available for user profile');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
    }
  }, [user]);

  // Update user profile method
  const updateUserProfile = useCallback(
    async (updatedProfile: Partial<PersonalInformation>) => {
      if (!user) return; // Ensure the user is authenticated
  
      // Debugging: Log the updated profile data before making the API request
      console.log('Updating User Profile with data:', updatedProfile);
  
      try {
        const response = await apiService.put(`/users/${user.id}/profile`, updatedProfile, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        console.log('Profile updated successfully:', response.data);
  
        // Update local state with the new profile information
        setUserProfile((prevProfile) => {
          if (prevProfile) {
            // Handle potential undefined values by ensuring defaults
            return {
              ...prevProfile,
              personalInformation: {
                ...prevProfile.personalInformation,
                ...updatedProfile,
              } as PersonalInformation, // Assert that this will still match PersonalInformation structure
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
  

  useEffect(() => {
    fetchUserProfile(); // Fetch the user profile when the component mounts
  }, [fetchUserProfile]);

  return (
    <UserProfileContext.Provider value={{ userProfile, fetchUserProfile, updateUserProfile }}>
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
