import React, { useEffect } from 'react';
import { useUserProfile } from '../../../context/UserProfileContext';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/userheader';


const ArtistAndProviderList: React.FC = () => {
    const { artistAndPrintingProviders, fetchArtistAndPrintingProviders } = useUserProfile();
    const navigate = useNavigate();

    useEffect(() => {
        fetchArtistAndPrintingProviders();
    }, [fetchArtistAndPrintingProviders]);

    const uniqueProviders = Array.from(new Set(artistAndPrintingProviders?.map(provider => provider.username)))
        .map(username => {
            return artistAndPrintingProviders?.find(provider => provider.username === username);
        }).filter(Boolean);

    const handleProfileClick = (providerId: number) => {
        // Navigate directly to the provider's profile page
        navigate(`/provider/${providerId}/profile`);
    };

    return (
        <div className="artist-provider-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-20">
            <UserHeader/>
            {artistAndPrintingProviders ? (
                uniqueProviders.length > 0 ? (
                    uniqueProviders.map((provider) => {
                        const username = provider.username || 'Username Unavailable';
                        const role = provider.roleName || 'Role Unavailable';

                        return (
                            <div 
                                key={provider.id} 
                                className="provider-card border rounded shadow p-4 cursor-pointer" 
                                onClick={() => handleProfileClick(provider.id)}
                            >
                                <img
                                    src={provider.personalInformation?.profilepicture || '/default-avatar.png'}
                                    alt={username}
                                    className="provider-avatar w-full h-32 object-cover rounded-t"
                                />
                                <div className="provider-info mt-2">
                                    <h3 className="text-lg font-semibold">{username}</h3>
                                    <p className="text-sm text-gray-600">{role}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>No artists or printing providers found.</p>
                )
            ) : (
                <p>Loading artists and providers...</p>
            )}
        </div>
    );
};

export default ArtistAndProviderList;
