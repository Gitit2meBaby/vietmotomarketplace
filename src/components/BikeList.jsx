import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDocs, collection, query } from 'firebase/firestore';
import { db } from '../firebase';
import Post from './Post';
import { useAppContext } from '../context';
import loadingImg from '../assets/loadingImg.webp'
import loadingImg2 from '../assets/loadingImg2.webp'
import spinner from '../assets/spinner.gif'

const BikeList = () => {
    const [listings, setListings] = useState([]);
    const { isLoading, setIsLoading } = useAppContext()

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listingsCollection = collection(db, 'listings');
                const listingsQuery = query(listingsCollection);
                const snapshot = await getDocs(listingsQuery);

                const listingsData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setListings(listingsData);
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };
        fetchListings();
    }, [setIsLoading]);


    if (isLoading) return (
        <>
            <section className='post blur'>
                <div className="slider-wrapper">
                    <div className="timestamp">
                        <p>22/02</p>
                    </div>
                    <img src={loadingImg} alt="motorbike" />
                    <div className="price-wrapper">
                        <p>17,000,000₫</p>
                    </div>
                </div>
                <div className="post-content">
                    <h1>Honda CBR Hornet 150cc</h1>
                    <div className="post-grid">
                        <p>Hanoi</p>
                        <div>
                            <p className='type manual'>manual</p>
                            <p className='seller private'>private</p>
                        </div>
                    </div>
                    <p>Well serviced and maintained bike, selling due to moving to a different...</p>
                    <button className='show-btn'>Show More...</button>
                </div>
            </section>

            <img className='spinner' src={spinner} alt="loading spinner" />

            <section className='post blur'>
                <div className="slider-wrapper">
                    <div className="timestamp">
                        <p>22/02</p>
                    </div>
                    <img src={loadingImg2} alt="motorbike" />
                    <div className="price-wrapper">
                        <p>9,000,000₫</p>
                    </div>
                </div>
                <div className="post-content">
                    <h1>2019 Vespa 120cc</h1>
                    <div className="post-grid">
                        <p>Danang</p>
                        <div>
                            <p className='type automatic'>automatic</p>
                            <p className='seller private'>private</p>
                        </div>
                    </div>
                    <p>Beautiful bike that has given me no issues over the past 3 months of riding between...</p>
                    <button className='show-btn'>Show More...</button>
                </div>
            </section >
        </>
    )

    return (
        <div>
            {listings.map(({ id, userId, postID, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, seller, description, descriptionRental, model, modelRental, dropLocationRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt, phone, whatsapp, facebook, zalo, website, address, }) => (
                <Post
                    key={id}
                    id={id}
                    userId={userId}
                    postId={postID}
                    transaction={transaction}
                    type={type}
                    price={price}
                    location={location}
                    locationRental={locationRental}
                    seller={seller}
                    description={description}
                    descriptionRental={descriptionRental}
                    phone={phone}
                    whatsapp={whatsapp}
                    facebook={facebook}
                    zalo={zalo}
                    website={website}
                    address={address}
                    model={model}
                    modelRental={modelRental}
                    featureImage={featureImage}
                    secondImage={secondImage}
                    thirdImage={thirdImage}
                    featureRentalImageUpload={featureRentalImageUpload}
                    secondRentalImageUpload={secondRentalImageUpload}
                    thirdRentalImageUpload={thirdRentalImageUpload}
                    pricePerDay={pricePerDay}
                    pricePerWeek={pricePerWeek}
                    pricePerMonth={pricePerMonth}
                    dropLocation={dropLocationRental}
                    createdAt={createdAt}
                />
            ))}

        </div>
    );
};

export default BikeList;
