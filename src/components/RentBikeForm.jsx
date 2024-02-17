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
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage'
import { v4 } from 'uuid'
import Preview from './Preview'



const RentBikeForm = () => {
    const [featureRentalImageUpload, setRentalFeatureImageUpload] = useState(null)
    const [secondRentalImageUpload, setRentalSecondImageUpload] = useState(null)
    const [thirdRentalImageUpload, setRentalThirdImageUpload] = useState(null)


    const [typeRental, setTypeRental] = useState('');
    const [pricePerDay, setPricePerDay] = useState('')
    const [pricePerWeek, setPricePerWeek] = useState('')
    const [pricePerMonth, setPricePerMonth] = useState('')
    const [locationRental, setLocationRental] = useState('');
    const [dropLocationRental, setDropLocationRental] = useState([]);
    const [descriptionRental, setDescriptionRental] = useState('')
    const [contactRental, setContactRental] = useState('')
    const [modelRental, setModelRental] = useState('')
    const [isOneWay, setIsOneWay] = useState(false)

    const [imageUrls, setImageUrls] = useState([]);

    const [showPreview, setShowPreview] = useState(false)

    const handleImageUpload = async (image, e) => {
        e.preventDefault()
        try {
            if (!image) {
                console.error('No file selected for upload.');
                return;
            }

            console.log('featureRentalImageUpload:', featureRentalImageUpload);
            console.log('secondRentalImageUpload:', secondRentalImageUpload);
            console.log('thirdRentalImageUpload:', thirdRentalImageUpload);

            const imageName = image.name + v4();
            const filesFolderRef = ref(storage, `sellImages/${auth?.currentUser?.uid}/${imageName}`);

            await uploadBytes(filesFolderRef, image);

            // Fetch the updated file list and update the state
            const response = await listAll(filesFolderRef);
            const urls = await Promise.all(response.items.map((item) => getDownloadURL(item)));

            setImageUrls((prevUrls) => [...prevUrls, ...urls]);

            console.log('all urls:', urls);
            console.log('imageName:', imageName);

            return urls[0];
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };


    const handleDropLocationChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setDropLocationRental(selectedOptions);
    };

    const handleSaleSubmit = async (e) => {
        e.preventDefault();



        const rentRef = collection(db, 'renting');

        try {

            await addDoc(rentRef, {
                type: typeRental,
                pricePerDay: pricePerDay,
                pricePerWeek: pricePerWeek,
                pricePerMonth: pricePerMonth,
                modelRental: modelRental,
                locationRental: locationRental,
                dropLocationRental: dropLocationRental,
                descriptionRental: descriptionRental,
                contactRental: contactRental,
                featureRentalImageUpload: featureRentalImageUpload,
                secondRentalImageUpload: secondRentalImageUpload,
                thirdRentalImageUpload: thirdRentalImageUpload,
                userId: auth?.currentUser?.uid,
            });


            // Clear form fields after successful submission
            setTypeRental('automatic');
            setPricePerDay('');
            setPricePerWeek('');
            setPricePerMonth('');
            setLocationRental('');
            setModelRental('')
            setDescriptionRental('')
            setContactRental('')
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    useEffect(() => {
        console.log('featureRentalImageUpload:', featureRentalImageUpload);
        console.log('secondRentalImageUpload:', secondRentalImageUpload);
        console.log('thirdRentalImageUpload:', thirdRentalImageUpload);
    }, [featureRentalImageUpload, secondRentalImageUpload, thirdRentalImageUpload]);



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
                                    onChange={(e) => setTypeRental(e.target.value)}
                                />
                                Manual
                            </label>
                        </div>
                    </div>

                    <label>
                        <input
                            name='model'
                            type="text"
                            placeholder="ie Honda Wave 2010"
                            value={modelRental}
                            onChange={(e) => setModelRental(e.target.value)}
                        />Make and Model
                    </label>

                    <label>
                        <input
                            name='priceDay'
                            type="number"
                            placeholder="Price"
                            value={pricePerDay}
                            onChange={(e) => setPricePerDay(e.target.value)}
                        />Price /Day
                    </label>
                    <label>
                        <input
                            name='priceWeek'
                            type="number"
                            placeholder="Price"
                            value={pricePerWeek}
                            onChange={(e) => setPricePerWeek(e.target.value)}
                        />Price /Week
                    </label>
                    <label>
                        <input
                            name='priceMonth'
                            type="number"
                            placeholder="Price"
                            value={pricePerMonth}
                            onChange={(e) => setPricePerMonth(e.target.value)}
                        />Price /Month
                    </label>

                    <label htmlFor="locationRental">Location</label>
                    <select
                        name="location"
                        id="locationRental"
                        onChange={(e) => setLocationRental(e.target.value)}
                    >
                        <option value="Hanoi">Hanoi</option>
                        <option value="HCMC">HCMC</option>
                        <option value="Danang">Danang</option>
                        <option value="Hoi An">Hoi An</option>
                        <option value="Nha Trang">Nha Trang</option>
                        <option value="Mui Ne">Mui Ne</option>
                        <option value="Dalat">Dalat</option>
                    </select>


                    <input type='checkbox' checked={isOneWay} onChange={(e) => setIsOneWay(e.target.checked)} />
                    <label>One Way rental available</label>

                    {isOneWay && (
                        <>
                            <label htmlFor="dropLocation">Drop off locations</label>
                            <select
                                name="dropLocation"
                                id="dropLocation"
                                multiple
                                onChange={(e) => handleDropLocationChange(e)}
                                value={dropLocationRental}
                            >
                                <option value="Hanoi">Hanoi</option>
                                <option value="HCMC">HCMC</option>
                                <option value="Danang">Danang</option>
                                <option value="Hoi An">Hoi An</option>
                                <option value="Nha Trang">Nha Trang</option>
                                <option value="Mui Ne">Mui Ne</option>
                                <option value="Dalat">Dalat</option>
                            </select>
                        </>
                    )}

                    <label htmlFor='description'
                        onChange={(e) => setDescriptionRental(e.target.value)}>
                        Description
                        <textarea name="description" id="descriptionRental" cols="30" rows="10"></textarea>
                    </label>

                    <label htmlFor='contact'
                        onChange={(e) => setContactRental(e.target.value)}>
                        Contact
                        <textarea name="contact" id="contactRental" cols="30" rows="10"></textarea>
                    </label>
                </form>

                <div>
                    <label>Feature Image
                        <input type='file' onChange={(e) => setRentalFeatureImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)} />
                    </label>
                    <button type='button' onClick={(e) => handleImageUpload(featureRentalImageUpload, e)}>Upload File</button>
                </div>


                {featureRentalImageUpload != null && (
                    <div>
                        <label>
                            <input type='file' onChange={(e) => setRentalSecondImageUpload(e.target.files[0])} />
                        </label>
                        <button type='button' onClick={(e) => handleImageUpload(secondRentalImageUpload, e)}>Upload File</button>
                    </div>
                )}

                {secondRentalImageUpload != null && (

                    <div>
                        <label>
                            <input type='file' onChange={(e) => setRentalThirdImageUpload(e.target.files[0])} />
                        </label>
                        <button type='button' onClick={(e) => handleImageUpload(thirdRentalImageUpload, e)}>Upload File</button>
                    </div>
                )}

                <button type="button" onClick={() => setShowPreview(true)}>Preview</button>

                {showPreview && (
                    <Preview
                        type={typeRental}
                        pricePerDay={pricePerDay}
                        pricePerWeek={pricePerWeek}
                        pricePerMonth={pricePerMonth}
                        location={locationRental}
                        dropLocation={dropLocationRental}
                        description={descriptionRental}
                        contact={contactRental}
                        model={modelRental}
                        featureImage={featureRentalImageUpload}
                        secondImage={secondRentalImageUpload}
                        thirdImage={thirdRentalImageUpload}
                        setShowPreview={setShowPreview}
                    />
                )}

                <button type="submit">Post Bike</button>
            </section>
        </>
    );
};

export default RentBikeForm;
