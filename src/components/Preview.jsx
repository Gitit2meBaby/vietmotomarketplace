import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Preview = ({ type, price, location, seller, description, contact, model, featureImage, secondImage, thirdImage, setShowPreview, pricePerDay, pricePerWeek, pricePerMonth, dropLocation }) => {
    const images = [featureImage, secondImage, thirdImage];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        swipe: images.length > 1,
    };

    return (
        <section>
            <Slider {...settings}>
                {images.map((image, index) => (
                    <div key={index}>
                        <img src={image ? URL.createObjectURL(image) : ''} alt={`Preview ${index + 1}`} />

                    </div>
                ))}
            </Slider>

            <h1>{model}</h1>
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

                <p>{location}</p>
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

            <p>{description}</p>
            <p>{contact}</p>
            <button onClick={() => setShowPreview(false)}>Close</button>
        </section>
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
