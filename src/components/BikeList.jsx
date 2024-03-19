import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDocs, collection, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../firebase';
import Post from './Post';
import { useAppContext } from '../context';
import loadingImg from '../assets/loadingImg.webp'
import loadingImg2 from '../assets/loadingImg2.webp'
import spinner from '../assets/spinner.gif'
import Sorter from './Sorter';

const BikeList = () => {
    const [listings, setListings] = useState([]);
    const { isLoading, setIsLoading, buyOrRent, direction, orderType, location } = useAppContext();

    console.log('bikeList rendered');

    // Fetch query, using global state to help sort and filter
    const fetchListings = async (lastListing) => {
        console.log('lastListing', lastListing);
        try {
            const listingsCollection = collection(db, 'listings');
            let listingsQuery = query(
                listingsCollection,
                orderBy(orderType, direction),
                where('transaction', '==', buyOrRent),
                ...(location ? [where('location', '==', location)] : []),
                limit(5)
            );

            if (lastListing) {
                listingsQuery = query(
                    listingsCollection,
                    orderBy(orderType, direction),
                    where('transaction', '==', buyOrRent),
                    ...(location ? [where('location', '==', location)] : []),
                    limit(5),
                    orderType === 'price' ? startAfter(lastListing.price) : startAfter(lastListing.createdAt),
                );
            }

            const snapshot = await getDocs(listingsQuery);

            const listingsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            // console.log('listingsData', listingsData);
            console.log(orderType, direction);

            setListings((prevListings) => [...prevListings, ...listingsData]);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch initial listings
    useEffect(() => {
        fetchListings();
    }, []);

    // Load more listings
    const handleLoadMore = () => {
        console.log('listings', listings);
        const lastListing = listings[listings.length - 1];
        fetchListings(lastListing);
    };

    if (isLoading) return (
        <>
            <section className='post blur'>
                <div className="slider-wrapper">
                    <div className="timestamp">
                        <p>22/02</p>
                    </div>
                    <img src={loadingImg} alt="motorbike" />
                    <div className="price-wrapper">
                        <p>₫17mil</p>
                    </div>
                </div>
                <div className="post-content">
                    <h1>Honda CBR Hornet 150cc</h1>
                    <div className="post-grid">
                        <p>Hanoi</p>
                        <div>
                            <p className='type manual'>manual</p>
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
                        <p>₫9mill</p>
                    </div>
                </div>
                <div className="post-content">
                    <h1>2019 Vespa 120cc</h1>
                    <div className="post-grid">
                        <p>Danang</p>
                        <div>
                            <p className='type automatic'>automatic</p>
                        </div>
                    </div>
                    <p>Beautiful bike that has given me no issues over the past 3 months of riding between...</p>
                    <button className='show-btn'>Show More...</button>
                </div>
            </section >
        </>
    )

    return (
        <section>
            <Sorter fetchListings={fetchListings} setListings={setListings} />
            {listings.map(({ id, userId, avatar, name, postID, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, description, descriptionRental, model, modelRental, dropLocationRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt, phone, whatsapp, facebook, zalo, website, address, }) => (
                <Post
                    key={id}
                    id={id}
                    userId={userId}
                    avatar={avatar}
                    name={name}
                    postId={postID}
                    transaction={transaction}
                    type={type}
                    price={price}
                    location={location}
                    locationRental={locationRental}
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

            <button onClick={handleLoadMore}>Load More</button>

        </section>
    );
};

export default BikeList;
