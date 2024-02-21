import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { db } from '../firebase'; // Update the path accordingly
import 'firebase/firestore';
const Post = ({ id, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, dropLocation, seller, description, descriptionRental, contact, contactRental, model, modelRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt }) => {
    const isForSale = transaction === 'sell';

    const featureImageSrc = isForSale ? featureImage : featureRentalImageUpload;
    const secondImageSrc = isForSale ? secondImage : secondRentalImageUpload;
    const thirdImageSrc = isForSale ? thirdImage : thirdRentalImageUpload;

    const descriptionSrc = isForSale ? description : descriptionRental
    const contactSrc = isForSale ? contact : contactRental
    const locationSrc = isForSale ? location : locationRental
    const modelSrc = isForSale ? model : modelRental

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    console.log('Feature Image URL:', featureImageSrc);
    console.log('Second Image URL:', secondImageSrc);
    console.log('Third Image URL:', thirdImageSrc);


    return (
        <section>
            <Slider {...settings}>
                <img src={featureImageSrc} alt="Motorbike" />
                <img src={secondImageSrc} alt="Motorbike" />
                <img src={thirdImageSrc} alt="Motorbike" />
            </Slider>

            <h1>{modelSrc}</h1>
            <div>
                {price && (
                    <h2>{price}₫</h2>
                )}
                {pricePerDay && (
                    <h2>{pricePerDay}₫/day</h2>
                )}
                {pricePerWeek && (
                    <h2>{pricePerWeek}₫/week</h2>
                )}
                {pricePerMonth && (
                    <h2>{pricePerMonth}₫/month</h2>
                )}
                <p>{locationSrc}</p>
            </div>
            <div>
                <p>{type}</p>
                <p>{seller}</p>
            </div>
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
            <p>{descriptionSrc}</p>
            <p>{contactSrc}</p>
        </section>
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
    featureImage: PropTypes.string, // Add PropTypes for each image field
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
