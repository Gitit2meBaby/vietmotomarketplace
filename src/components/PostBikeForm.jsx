import { useState } from 'react'
import SellBikeForm from './SellBikeForm';
import RentBikeForm from './RentBikeForm';

const PostBikeForm = () => {
    const [offerType, setOfferType] = useState('sell')

    return (
        <>
            <main className='post-page'>
                <div className="tabs">
                    <div className="tab sell-tab"
                        onClick={() => setOfferType('sell')}
                    >Sell</div>
                    <div className="tab rent-tab"
                        onClick={() => setOfferType('rent')}
                    >Rent</div>
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
        </>
    );
};

export default PostBikeForm;
