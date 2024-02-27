import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { db } from '../firebase';
import 'firebase/firestore';
import { useAppContext } from '../context';
import '../sass/post.css'

const Post = ({ id, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, dropLocation, seller, description, descriptionRental, contact, contactRental, model, modelRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt }) => {

    const { isLoggedIn, setIsLoggedIn } = useAppContext();

    const isForSale = transaction === 'sell';

    // culminate the rent and sell data into one variable
    const featureImageSrc = isForSale ? featureImage : featureRentalImageUpload;
    const secondImageSrc = isForSale ? secondImage : secondRentalImageUpload;
    const thirdImageSrc = isForSale ? thirdImage : thirdRentalImageUpload;

    const descriptionSrc = isForSale ? description : descriptionRental
    const contactSrc = isForSale ? contact : contactRental
    const locationSrc = isForSale ? location : locationRental
    const modelSrc = isForSale ? model : modelRental

    const [showMore, setShowMore] = useState(false)

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

        // Default case: return the original number
        return price;
    }

    return (
        <section className='post'>
            <div className="slider-wrapper">
                <div className="timestamp">
                    <p>{formattedDate}</p>
                </div>
                <Slider {...settings}>
                    <img className='post-img' src={featureImageSrc} alt="Motorbike" />
                    <img className='post-img' src={secondImageSrc} alt="Motorbike" />
                    <img className='post-img' src={thirdImageSrc} alt="Motorbike" />
                </Slider>
                <div className="price-wrapper">
                    {price && (
                        <h4><span>₫</span>{formatPrice(price)}</h4>
                    )}
                </div>
            </div>

            <div className="post-content">
                <h1>{modelSrc}</h1>
                <div className='rent-prices'>
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

                <div className="post-grid">
                    <p>{locationSrc}</p>
                    <div>
                        <p className={`type ${type === 'automatic' ? 'automatic' : type === 'manual' ? 'manual' : 'semi'}`}>{type}</p>

                        <p className={`seller ${seller === 'private' ? 'private' : 'business'}`}>{seller}</p>
                    </div>
                </div>


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

                <p>{showMore ? `${trimmedDescription} ${descriptionRemainder}` : `${trimmedDescription} ...`}</p>

                {!showMore && (
                    <button className='show-btn' onClick={() => setShowMore(true)}>Show More...</button>
                )}

                {showMore && (
                    <>
                        <button className='hide-btn'
                            onClick={() => setShowMore(false)}>...Show Less</button>

                        <div className='post-contact'>
                            <h2 className='contact-heading'>Contact</h2>
                            <p style={{ filter: isLoggedIn ? 'none' : 'blur(5px)' }}>{contactSrc}</p>
                            {!isLoggedIn && (
                                <button className='sign-for-more-btn'
                                    onClick={() => handleSignInClick()}>Log In
                                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1.1em" width="1.1em" xmlns="http://www.w3.org/2000/svg"><path d="M0 220.8C0 266.416 37.765 304 83.2 304h35.647a93.148 93.148 0 0 0 7.929 22.064c-2.507 22.006 3.503 44.978 15.985 62.791C143.9 441.342 180.159 480 242.701 480H264c60.063 0 98.512-40 127.2-40h2.679c5.747 4.952 13.536 8 22.12 8h64c17.673 0 32-12.894 32-28.8V188.8c0-15.906-14.327-28.8-32-28.8h-64c-8.584 0-16.373 3.048-22.12 8H391.2c-6.964 0-14.862-6.193-30.183-23.668l-.129-.148-.131-.146c-8.856-9.937-18.116-20.841-25.851-33.253C316.202 80.537 304.514 32 259.2 32c-56.928 0-92 35.286-92 83.2 0 8.026.814 15.489 2.176 22.4H83.2C38.101 137.6 0 175.701 0 220.8zm48 0c0-18.7 16.775-35.2 35.2-35.2h158.4c0-17.325-26.4-35.2-26.4-70.4 0-26.4 20.625-35.2 44-35.2 8.794 0 20.445 32.712 34.926 56.1 9.074 14.575 19.524 27.225 30.799 39.875 16.109 18.374 33.836 36.633 59.075 39.596v176.752C341.21 396.087 309.491 432 264 432h-21.299c-40.524 0-57.124-22.197-50.601-61.325-14.612-8.001-24.151-33.979-12.925-53.625-19.365-18.225-17.787-46.381-4.95-61.05H83.2C64.225 256 48 239.775 48 220.8zM448 360c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24z"></path></svg></button>
                            )}
                        </div>

                        <button disabled={!isLoggedIn} className='msg-btn'>
                            Message</button>
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
