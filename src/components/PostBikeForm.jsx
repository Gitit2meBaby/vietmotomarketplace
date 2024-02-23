import { useState } from 'react'
import SellBikeForm from './SellBikeForm';
import RentBikeForm from './RentBikeForm';
import '../sass/postBikeForm.css'

const PostBikeForm = () => {
    const [offerType, setOfferType] = useState('sell')
    const [showInfo, setShowInfo] = useState(false)

    return (
        <main className='post-page'>
            <h1>Make a Post</h1>
            <div className="post-info">
                <p>Please fill out as much detail as you can and check out the preview of your post before submission...</p>
                {!showInfo && (

                    <button className='more-info-btn' onClick={() => setShowInfo(!showInfo)}>More..</button>
                )}

                {showInfo && (
                    <>
                        <p>Quality photos and an honest description lead to the quickest sales, be sure to check your messages in the following days and add alternate contact methods for your best chance.</p>
                        <p>All posts must adhere to our <a>User Guidelines</a></p>
                        <button className='more-info-btn' onClick={() => setShowInfo(!showInfo)}>...less</button>
                    </>
                )}
            </div>

            <div className="tabs">
                <div
                    className={`tab sell-tab ${offerType === 'rent' ? 'inactive-tab' : ''}`}
                    onClick={() => setOfferType('sell')}
                >
                    Sell
                </div>
                <div
                    className={`tab rent-tab ${offerType === 'sell' ? 'inactive-tab' : ''}`}
                    onClick={() => setOfferType('rent')}
                >
                    Rent
                </div>
            </div>

            <section className="form-container">
                {offerType === 'sell' && (
                    <SellBikeForm />
                )}
                {offerType === 'rent' && (
                    <RentBikeForm />
                )}
            </section>
        </main>
    );
};

export default PostBikeForm;
