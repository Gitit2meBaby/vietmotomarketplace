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

    // Example usage:
    const { trimmedDescription, descriptionRemainder } = trimDescription(descriptionSrc, 15);

    // Get useable date format from timestamp from database
    const createdAtDate = new Date(createdAt.seconds * 1000);
    const options = { month: '2-digit', day: '2-digit' };
    let formattedDate;
    isForSale ? formattedDate = createdAtDate.toLocaleDateString(undefined, options) : formattedDate = 'In Stock'

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
                        <p>{price}₫</p>
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
                        <div className='post-contact'
                            style={{ Backdropfilter: isLoggedIn ? 'none' : 'blur(5px)' }}>
                            <h2 className='contact-heading'>Contact</h2>
                            <p>{contactSrc}</p>
                            {!isLoggedIn && (
                                <button onClick={() => handleSignInClick()}>Sign In</button>
                            )}
                        </div>

                        <button className='hide-btn' onClick={() => setShowMore(false)}>...Show Less</button>

                        <button className='msg-btn'>Message</button>
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
