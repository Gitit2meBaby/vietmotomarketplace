import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState([]);

    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const [buyOrRent, setBuyOrRent] = useState('sell')

    // image cropper, store files to edit before sending to firebase
    const [cropper, setCropper] = useState(false)
    const [chosenImage, setChosenImage] = useState(null)
    const [featureImageUpload, setFeatureImageUpload] = useState(null)
    const [secondImageUpload, setSecondImageUpload] = useState(null)
    const [thirdImageUpload, setThirdImageUpload] = useState(null)
    const [featureRentalImageUpload, setFeatureRentalImageUpload] = useState(null)
    const [secondRentalImageUpload, setSecondRentalImageUpload] = useState(null)
    const [thirdRentalImageUpload, setThirdRentalImageUpload] = useState(null)

    return (
        <AppContext.Provider value={{
            currentUser, setCurrentUser,
            isLoggedIn, setIsLoggedIn,
            isLoading, setIsLoading,
            imageUrls, setImageUrls,
            cropper, setCropper,
            setChosenImage, chosenImage,
            featureImageUpload, setFeatureImageUpload,
            secondImageUpload, setSecondImageUpload,
            thirdImageUpload, setThirdImageUpload,
            featureRentalImageUpload, setFeatureRentalImageUpload,
            secondRentalImageUpload, setSecondRentalImageUpload,
            thirdRentalImageUpload, setThirdRentalImageUpload,
            isAuthOpen, setIsAuthOpen,
            buyOrRent, setBuyOrRent
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { AppProvider, AppContext };
