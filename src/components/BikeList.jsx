import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDocs, collection, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { db, storage } from '../firebase';
import Post from './Post';

const BikeList = () => {
    const [listings, setListings] = useState([]);

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
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };
        fetchListings();
    }, []);

    useEffect(() => {
        console.log('listings:', listings);
    }, [listings])

    return (
        <div>
            {listings.map(({ id, transaction, type, price, pricePerDay, pricePerWeek, pricePerMonth, location, locationRental, seller, description, descriptionRental, contact, contactRental, model, modelRental, dropLocationRental, featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload, featureImage, secondImage, thirdImage, createdAt }) => (
                <Post
                    key={id}
                    id={id}
                    transaction={transaction}
                    type={type}
                    price={price}
                    location={location}
                    locationRental={locationRental}
                    seller={seller}
                    description={description}
                    descriptionRental={descriptionRental}
                    contact={contact}
                    contactRental={contactRental}
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
