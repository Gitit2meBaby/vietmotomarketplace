import { useState } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Preview = ({ type, price, location, seller, description, contact, model, featureImage, secondImage, thirdImage, setShowPreview, pricePerDay, pricePerWeek, pricePerMonth, dropLocation }) => {

    const featureImageUrl = featureImage ? URL.createObjectURL(featureImage) : null;
    const secondImageUrl = secondImage ? URL.createObjectURL(secondImage) : null;
    const thirdImageUrl = thirdImage ? URL.createObjectURL(thirdImage) : null;

    const [showMore, setShowMore] = useState(false)

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

    const { trimmedDescription, descriptionRemainder } = trimDescription(description, 15);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };


    return (
        <main className="preview">
            <section className='post'>
                <div className="slider-wrapper">
                    <div className="timestamp">
                        <p>Now</p>
                    </div>
                    <Slider {...settings}>
                        <img className='post-img' src={featureImageUrl} alt="Motorbike" />
                        <img className='post-img' src={secondImageUrl} alt="Motorbike" />
                        <img className='post-img' src={thirdImageUrl} alt="Motorbike" />
                    </Slider>
                    <div className="price-wrapper">
                        {price && (
                            <p>{price}₫</p>
                        )}
                    </div>
                </div>

                <div className="post-content">
                    <h1>{model}</h1>
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
                        <p>{location}</p>
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
                            <div className='post-contact'>
                                <h2 className='contact-heading'>Contact</h2>
                                <p>{contact}</p>
                            </div>

                            <button className='hide-btn' onClick={() => setShowMore(false)}>...Show Less</button>

                            <button className='msg-btn'>Message</button>
                        </>
                    )}
                </div>
            </section >

            <button className='preview-btn' onClick={() => setShowPreview(false)}>Close</button>
        </main>
    );
};

Preview.propTypes = {
    type: PropTypes.string,
    price: PropTypes.string,
    location: PropTypes.string,
    seller: PropTypes.string,
    description: PropTypes.string,
    contact: PropTypes.string,
    model: PropTypes.string,
    // featureImage: PropTypes.string,
    // secondImage: PropTypes.string,
    // thirdImage: PropTypes.string,
    setShowPreview: PropTypes.func
};

export default Preview;
