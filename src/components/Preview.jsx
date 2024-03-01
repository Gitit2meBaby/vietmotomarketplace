import { useState } from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// icon imports
import whatsAppLogo from '../assets/socials/whatsApp.svg'
import faceBookLogo from '../assets/socials/facebook.svg'
import zaloLogo from '../assets/socials/zalo.svg'

const Preview = ({ type, price, location, seller, description, contact, model, featureImage, secondImage, thirdImage, setShowPreview, pricePerDay, pricePerWeek, pricePerMonth, dropLocation, phone, whatsapp, facebook, zalo, website, address, }) => {

    const featureImageUrl = featureImage
    // ? URL.createObjectURL(featureImage) : null;
    const secondImageUrl = secondImage
    // ? URL.createObjectURL(secondImage) : null;
    const thirdImageUrl = thirdImage
    // ? URL.createObjectURL(thirdImage) : null;

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
                            <h4><span>₫</span>{price}</h4>
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

                                {phone && (
                                    <div className="post-contact-details">
                                        <div className="svg-wrapper">
                                            <svg stroke="#fff" fill="#fff" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        </div>
                                        <p>{phone}</p>
                                    </div>
                                )}

                                {whatsapp && (
                                    <div className="post-contact-details">
                                        <img src={whatsAppLogo} alt="WhatsApp logo" />
                                        <p>{whatsapp}</p>
                                    </div>
                                )}

                                {facebook && (
                                    <div className="post-contact-details">
                                        <img src={faceBookLogo} alt="Facebook logo" />
                                        <p>{facebook}</p>
                                    </div>
                                )}

                                {zalo && (
                                    <div className="post-contact-details">
                                        <img src={zaloLogo} alt="Zalo logo" />
                                        <p>{zalo}</p>
                                    </div>
                                )}

                                {website && (
                                    <div className="post-contact-details">
                                        <div className="svg-wrapper">
                                            <svg stroke="currentColor" fill="#0000FF" strokeWidth="0" viewBox="0 0 512 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>
                                        </div>                               <p>{website}</p>
                                    </div>
                                )}

                                {address && (
                                    <div className="post-contact-details">             <div className="svg-wrapper">
                                        <svg stroke="#DB4437" fill="#FF0000" strokeWidth="0" viewBox="0 0 288 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"></path></svg>
                                    </div>
                                        <p>{address}</p>
                                    </div>
                                )}
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
    setShowPreview: PropTypes.func
};

export default Preview;
