import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { db } from '../firebase';
import { useAppContext } from '../context';
import '../sass/post.css'
// icon imports
import whatsAppLogo from '../assets/socials/whatsApp.svg'
import faceBookLogo from '../assets/socials/facebook.svg'
import zaloLogo from '../assets/socials/zalo.svg'

import { doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject, getMetadata } from "firebase/storage";
import SendMessage from './chat/SendMessage';


const Post = ({ id, userId, avatar, name, postId, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, dropLocation, seller, description, descriptionRental, phone, whatsapp, facebook, zalo, website, address, model, modelRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt, }) => {

    const { isLoggedIn, currentUser, setIsAuthOpen, roomChosen, setRoomChosen, showMessenger, setShowMessenger } = useAppContext();
    const [showMore, setShowMore] = useState(false)
    const [sameUser, setSameUser] = useState(false)
    const [showMessageInput, setShowMessageInput] = useState(false);

    // match user with their own posts
    useEffect(() => {
        if (currentUser && currentUser.uid === userId) {
            setSameUser(true);
            console.log('postId', postId)
            console.log('userId', userId)
        }
    }, [currentUser, userId]);

    // culminate the rent and sell data into one variable
    const isForSale = transaction === 'sell';
    const featureImageSrc = isForSale ? featureImage : featureRentalImageUpload;
    const secondImageSrc = isForSale ? secondImage : secondRentalImageUpload;
    const thirdImageSrc = isForSale ? thirdImage : thirdRentalImageUpload;

    const descriptionSrc = isForSale ? description : descriptionRental
    const locationSrc = isForSale ? location : locationRental
    const modelSrc = isForSale ? model : modelRental

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    // get first 15 words of description to show on initial post
    const trimDescription = (fullDescription, wordLimit) => {
        const words = fullDescription.split(' ');
        const truncatedDescription = words.slice(0, wordLimit).join(' ');
        const descriptionRemainder = words.slice(wordLimit).join(' ');

        return {
            trimmedDescription: truncatedDescription,
            descriptionRemainder: descriptionRemainder,
            showMore: words.length > wordLimit,
        };
    };

    const { trimmedDescription, descriptionRemainder } = trimDescription(descriptionSrc, 15);

    // Get useable date format from timestamp from database
    const createdAtDate = new Date(createdAt.seconds * 1000);
    const options = { month: '2-digit', day: '2-digit' };
    let formattedDate;
    isForSale ? formattedDate = createdAtDate.toLocaleDateString(undefined, options) : formattedDate = 'In Stock'

    // format the price to use 'mil' and remove excessive zeros
    function formatPrice(price) {
        const priceStr = price.toString();
        const length = priceStr.length;

        if (length >= 7 && price % 1000000 === 0) {
            // Remove the last 6 digits and replace with ' mil'
            return priceStr.slice(0, length - 6) + 'mil';
        } else if (length >= 7 && price % 100000 === 0 && priceStr[length - 6] !== '0') {
            // Insert a decimal between digit 7 and 6 and replace the remaining 5 digits with ' mil'
            return priceStr.slice(0, length - 6) + '.' + priceStr.slice(length - 6, length - 5) + 'mil';
        }

        return price;
    }

    const handleSignInClick = () => {
        setIsAuthOpen(true)
    }

    const handleShowMessageInput = () => {
        setRoomChosen({
            docId: '',
            id: userId,
            name: name,
            avatar: avatar,
        });
        setShowMessageInput(true);
    };

    useEffect(() => {
        console.log('roomChosen', roomChosen);
    }, [roomChosen]);

    async function handleDelete() {
        try {
            // Initialize storage reference
            const storage = getStorage();

            // Construct image references based on your storage structure
            let imageRefs;
            if (transaction === 'sell') {
                imageRefs = [
                    ref(storage, `/sellImages/${postId}/feature.png`),
                    ref(storage, `/sellImages/${postId}/second.png`),
                    ref(storage, `/sellImages/${postId}/third.png`),
                ];
                console.log('imageRefs', imageRefs);
            } else {
                imageRefs = [
                    ref(storage, `/rentImages/${postId}/feature.png`),
                    ref(storage, `/rentImages/${postId}/second.png`),
                    ref(storage, `/rentImages/${postId}/third.png`),
                ];
                console.log('imageRefsRent', imageRefs);
            }

            const deletionPromises = imageRefs.map(async (imageRef) => {
                const fullPath = imageRef.fullPath;
                console.log(`Deleting image: ${fullPath}`);

                try {
                    await getMetadata(imageRef);
                    console.log(`Image ${fullPath} found in storage. Proceeding with deletion...`);
                    console.log('imageRef in metadata:', imageRef)
                } catch (error) {
                    if (error.code === 'storage/object-not-found') {
                        console.warn(`Image ${fullPath} not found in storage. Skipping deletion...`);
                    } else {
                        throw error; // Re-throw other errors
                    }
                }

                try {
                    await deleteObject(imageRef);
                    console.log(`Image ${fullPath} deleted successfully.`);
                } catch (error) {
                    console.error(`Error deleting image ${fullPath}:`, error.message);
                }
            });

            // Wait for all deletion promises to resolve or reject
            await Promise.all(deletionPromises);
            console.log('deletionPromises', deletionPromises);

            // Delete document from Firestore after successful image deletions
            const docRef = doc(db, "listings", postId);
            console.log('docRef', docRef);
            await deleteDoc(docRef);

            console.log("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error.message);
        }
    }


    return (
        <section className='post'>
            <div className="slider-wrapper">
                {sameUser && (
                    <div className="messages-on-post">
                        <h2>3 messages</h2>
                        <Link to='message'>Read</Link>
                    </div>
                )}
                <div className="timestamp">
                    <p>{formattedDate}</p>
                </div>
                <Slider {...settings} style={{ zIndex: '0' }}>
                    <img className='post-img' src={featureImageSrc} alt="Motorbike" />
                    <img className='post-img' src={secondImageSrc} alt="Motorbike" />
                    <img className='post-img' src={thirdImageSrc} alt="Motorbike" />
                </Slider>
                <div className="price-wrapper">
                    {price && (
                        <h4><span>₫</span>{formatPrice(price)}</h4>
                    )}
                    {pricePerDay && (
                        <h4><span>₫</span>{formatPrice(pricePerDay)}<span>/day</span></h4>
                    )}
                </div>
            </div>


            <div className="post-content">
                <div className="cover"></div>
                <h1>{modelSrc}</h1>

                <div className="post-grid">
                    <p>{locationSrc}</p>
                    <div>
                        {(type != '') && (
                            <p className={`type ${type === 'automatic' ? 'automatic' : type === 'manual' ? 'manual' : 'semi'}`}>{type}</p>
                        )}
                        {(seller != '') && (
                            <p className={`seller ${seller === 'private' ? 'private' : 'business'}`}>{seller}</p>
                        )}
                    </div>
                </div>

                <p>{showMore ? `${trimmedDescription} ${descriptionRemainder}` : `${trimmedDescription}...`}</p>

                {!showMore && (
                    <button className='show-btn' onClick={() => setShowMore(true)}>Show More...</button>
                )}

                {showMore && (
                    <>
                        <div className="drop-locations">
                            {dropLocation && (
                                <>
                                    <p>Drop off Locations - </p>
                                    <ul>
                                        {dropLocation.map((location) => (
                                            <li key={location}>{location}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        {pricePerDay && (
                            <>
                                <div className='rent-prices'>
                                    <h2 className="rental-rates-heading">Rental Rates</h2>
                                    {pricePerDay && (
                                        <h2>{pricePerDay}₫/day</h2>
                                    )}
                                    {pricePerWeek && (
                                        <h2>{pricePerWeek}₫/week</h2>
                                    )}
                                    {pricePerMonth && (
                                        <h2>{pricePerMonth}₫/month</h2>
                                    )}
                                </div>
                            </>
                        )}

                        <button className='hide-btn'
                            onClick={() => setShowMore(false)}>...Show Less</button>

                        <div className='post-contact'>
                            <h2 className='contact-heading'>Contact</h2>

                            {phone && (
                                <div className="post-contact-details">
                                    <div className="svg-wrapper">
                                        <svg stroke="#fff" fill="#fff" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    </div>
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{phone}</p>
                                </div>
                            )}

                            {whatsapp && (
                                <div className="post-contact-details">
                                    <img src={whatsAppLogo} alt="WhatsApp logo" />
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{whatsapp}</p>
                                </div>
                            )}

                            {facebook && (
                                <div className="post-contact-details">
                                    <img src={faceBookLogo} alt="Facebook logo" />
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{facebook}</p>
                                </div>
                            )}

                            {zalo && (
                                <div className="post-contact-details">
                                    <img src={zaloLogo} alt="Zalo logo" />
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{zalo}</p>
                                </div>
                            )}

                            {website && (
                                <div className="post-contact-details">
                                    <div className="svg-wrapper">
                                        <svg stroke="currentColor" fill="#0000FF" strokeWidth="0" viewBox="0 0 512 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>
                                    </div>
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{website}</p>
                                </div>
                            )}

                            {address && (
                                <div className="post-contact-details">             <div className="svg-wrapper">
                                    <svg stroke="#DB4437" fill="#FF0000" strokeWidth="0" viewBox="0 0 288 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"></path></svg>
                                </div>
                                    <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{address}</p>
                                </div>
                            )}

                            {!isLoggedIn && (
                                <button className='sign-for-more-btn'
                                    onClick={() => handleSignInClick()}>Log In
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 220.8C0 266.416 37.765 304 83.2 304h35.647a93.148 93.148 0 0 0 7.929 22.064c-2.507 22.006 3.503 44.978 15.985 62.791C143.9 441.342 180.159 480 242.701 480H264c60.063 0 98.512-40 127.2-40h2.679c5.747 4.952 13.536 8 22.12 8h64c17.673 0 32-12.894 32-28.8V188.8c0-15.906-14.327-28.8-32-28.8h-64c-8.584 0-16.373 3.048-22.12 8H391.2c-6.964 0-14.862-6.193-30.183-23.668l-.129-.148-.131-.146c-8.856-9.937-18.116-20.841-25.851-33.253C316.202 80.537 304.514 32 259.2 32c-56.928 0-92 35.286-92 83.2 0 8.026.814 15.489 2.176 22.4H83.2C38.101 137.6 0 175.701 0 220.8zm48 0c0-18.7 16.775-35.2 35.2-35.2h158.4c0-17.325-26.4-35.2-26.4-70.4 0-26.4 20.625-35.2 44-35.2 8.794 0 20.445 32.712 34.926 56.1 9.074 14.575 19.524 27.225 30.799 39.875 16.109 18.374 33.836 36.633 59.075 39.596v176.752C341.21 396.087 309.491 432 264 432h-21.299c-40.524 0-57.124-22.197-50.601-61.325-14.612-8.001-24.151-33.979-12.925-53.625-19.365-18.225-17.787-46.381-4.95-61.05H83.2C64.225 256 48 239.775 48 220.8zM448 360c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24z"></path></svg>
                                </button>
                            )}
                        </div>

                        {!showMessageInput && (
                            <>
                                {!sameUser && (
                                    <button disabled={!isLoggedIn} className='msg-btn'
                                        onClick={() => handleShowMessageInput()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-80 -80 240 240" height="3em" width="3em">
                                            <path
                                                fillRule="evenodd"
                                                fill="#FFFF05"
                                                d="m117.41 130.18-56.225-28.75-46.504 42.72 9.974-62.356-55.008-31.023 62.391-9.785 12.506-61.903 28.586 56.314 62.74-7.235-44.726 44.589 26.266 57.429z"
                                            /></svg>
                                        Message
                                    </button>
                                )}

                                {sameUser && (
                                    <button onClick={() => handleDelete()}
                                        className='delete-post-btn'>Delete Post</button>
                                )}

                            </>
                        )}

                        {showMessageInput && (
                            <SendMessage showMessageInput={showMessageInput} />
                        )}
                    </>
                )}
            </div>
        </section >
    );
};

Post.propTypes = {
    type: PropTypes.string,
    price: PropTypes.string,
    location: PropTypes.string,
    seller: PropTypes.string,
    description: PropTypes.string,
    contact: PropTypes.string,
    model: PropTypes.string,
    setShowPreview: PropTypes.func,
    featureImage: PropTypes.string,
    secondImage: PropTypes.string,
    thirdImage: PropTypes.string,
    featureRentalImageUpload: PropTypes.string,
    secondRentalImageUpload: PropTypes.string,
    thirdRentalImageUpload: PropTypes.string,
    pricePerDay: PropTypes.string,
    pricePerWeek: PropTypes.string,
    pricePerMonth: PropTypes.string,
    dropLocation: PropTypes.arrayOf(PropTypes.string),
};

export default Post;
