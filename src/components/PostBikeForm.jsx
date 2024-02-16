import { useEffect, useState } from 'react'
import { db, auth, storage } from '../firebase'
import {
    getDocs,
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore'
import { v4 } from 'uuid'


const PostBikeForm = () => {
    const [offerType, setOfferType] = useState('sell')

    const [type, setType] = useState('automatic');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('Hanoi');
    const [seller, setSeller] = useState('Private');
    const [description, setDescription] = useState('')
    const [contact, setContact] = useState('')
    const [model, setModel] = useState('')

    const [featureImageUpload, setFeatureImageUpload] = useState(null)
    const [secondImageUpload, setSecondImageUpload] = useState(null)
    const [thirdImageUpload, setThirdImageUpload] = useState(null)


    const [typeRental, setTypeRental] = useState('automatic');
    const [pricePerDay, setPricePerDay] = useState('')
    const [pricePerWeek, setPricePerWeek] = useState('')
    const [pricePerMonth, setPricePerMonth] = useState('')
    const [locationRental, setLocationRental] = useState('Hanoi');
    const [isOneWay, setIsOneWay] = useState(null)


    const handleSaleSubmit = async (e) => {
        e.preventDefault();

        const sellRef = collection(db, 'selling');

        try {
            await addDoc(sellRef, {
                type: type,
                price: price,
                model: model,
                location: location,
                seller: seller,
                description: description,
                contact: contact,
                featureImage: featureImageUpload,
                secondImage: secondImageUpload,
                thirdImage: thirdImageUpload,
                userId: auth?.currentUser?.uid,
            });


            // Clear form fields after successful submission
            setType('automatic');
            setPrice('');
            setLocation('');
            setSeller('');
            setModel('')
            setDescription('')
            setContact('')
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };


    return (
        <>

            <section className='rent-section'>
                <form onSubmit={handleSaleSubmit}>
                    <div>
                        <label>Type:</label>
                        <div>
                            <label>
                                <input
                                    name='typeRental'
                                    type="radio"
                                    value="automatic"
                                    checked={type === 'automatic'}
                                    onChange={(e) => setTypeRental(e.target.value)}
                                />
                                Automatic
                            </label>
                        </div>

                        <div>
                            <label>
                                <input
                                    name='typeRental'
                                    type="radio"
                                    value="semi-automatic"
                                    checked={type === 'semi-automatic'}
                                    onChange={(e) => setTypeRental(e.target.value)}
                                />
                                Semi-Automatic
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    name='typeRental'
                                    type="radio"
                                    value="manual"
                                    checked={type === 'manual'}
                                    onChange={(e) => setTypeRental(e.target.value)}
                                />
                                Manual
                            </label>
                        </div>
                    </div>


                    <label>
                        <input
                            name='priceDay'
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPricePerDay(e.target.value)}
                        />Price /Day
                    </label>
                    <label>
                        <input
                            name='priceWeek'
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPricePerWeek(e.target.value)}
                        />Price /Week
                    </label>
                    <label>
                        <input
                            name='priceMonth'
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPricePerMonth(e.target.value)}
                        />Price /Month
                    </label>

                    <label htmlFor="location"
                        value={location}
                        onChange={(e) => setLocationRental(e.target.value)}
                    >Location</label>
                    <select name="location" id="location">
                        <option value="Hanoi">Hanoi</option>
                        <option value="HCMC">HCMC</option>
                        <option value="Danang">Danang</option>
                        <option value="Nha Trang">Nha Trang</option>
                        <option value="Mui Ne">Mui Ne</option>
                        <option value="Dalat">Dalat</option>
                    </select>

                    <input type='checkbox' checked={isOneWay} onChange={(e) => setIsOneWay(e.target.checked)} />
                    <label>One Way rental available</label>

                    <button type="submit">Post Bike</button>
                </form>
            </section>

            <section className='sale-section'>
                <form onSubmit={handleSaleSubmit}>
                    <div>
                        <label>Type:</label>
                        <div>
                            <label>
                                <input
                                    name='type'
                                    type="radio"
                                    value="automatic"
                                    checked={type === 'automatic'}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Automatic
                            </label>
                        </div>

                        <div>
                            <label>
                                <input
                                    name='type'
                                    type="radio"
                                    value="semi-automatic"
                                    checked={type === 'semi-automatic'}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Semi-Automatic
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    name='type'
                                    type="radio"
                                    value="manual"
                                    checked={type === 'manual'}
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Manual
                            </label>
                        </div>
                    </div>

                    <div>
                        <label>
                            <input
                                name='seller'
                                type="radio"
                                value="private"
                                checked={seller === 'private'}
                                onChange={(e) => setSeller(e.target.value)}
                            />
                            Private
                        </label>
                    </div>

                    <div>
                        <label>
                            <input
                                name='seller'
                                type="radio"
                                value="business"
                                checked={seller === 'business'}
                                onChange={(e) => setSeller(e.target.value)}
                            />
                            Business
                        </label>
                    </div>

                    <label>
                        <input
                            name='model'
                            type="text"
                            placeholder="Make and model"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        />Make and Model
                    </label>

                    <label>
                        <input
                            name='price'
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />Price
                    </label>

                    <label htmlFor="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >Location
                        <select name="location" id="location">
                            <option value="Hanoi" selected>Hanoi</option>
                            <option value="HCMC">HCMC</option>
                            <option value="Danang">Danang</option>
                            <option value="Nha Trang">Nha Trang</option>
                            <option value="Mui Ne">Mui Ne</option>
                            <option value="Dalat">Dalat</option>
                        </select>
                    </label>

                    <label htmlFor='description'
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}>
                        Description
                        <textarea name="description" id="description" cols="30" rows="10"></textarea>
                    </label>

                    <label htmlFor='contact'
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}>
                        Contact
                        <textarea name="contact" id="contact" cols="30" rows="10"></textarea>
                    </label>

                    <div>
                        <label>Feature Image
                            <input type='file' onChange={(e) => setFeatureImageUpload(e.target.files[0])} />
                        </label>
                        <button onClick={() => uploadFeatureImage()}>Upload File</button>
                    </div>

                    {featureImageUpload != null && (
                        <div>
                            <label>
                                <input type='file' onChange={(e) => setSecondImageUpload(e.target.files[0])} />
                            </label>
                            <button onClick={() => uploadSecondImage()}>Upload File</button>
                        </div>
                    )}

                    {secondImageUpload != null && (

                        <div>
                            <label>
                                <input type='file' onChange={(e) => setThirdImageUpload(e.target.files[0])} />
                            </label>
                            <button onClick={() => uploadThirdImage()}>Upload File</button>
                        </div>
                    )}
                    <button type="submit">Post Bike</button>
                </form>
            </section>
        </>
    );
};

export default PostBikeForm;
