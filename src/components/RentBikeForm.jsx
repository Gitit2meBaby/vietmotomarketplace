import { useState } from 'react'
import { db, auth, storage } from '../firebase'
import {
    collection,
    addDoc,
    serverTimestamp,
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
    const [prevImageUrls, setPrevImageUrls] = useState([]);

    const [showPreview, setShowPreview] = useState(false)

    const [currencyError, setCurrencyError] = useState(false)
    const [modelError, setModelError] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [priceErrors, setPriceErrors] = useState({
        day: false,
        week: false,
        month: false,
    });
    const [currencyErrors, setCurrencyErrors] = useState({
        day: false,
        week: false,
        month: false,
    });

    const handlePriceChange = (value, type) => {
        setCurrencyError(false)
        switch (type) {
            case 'day':
                setPricePerDay(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, day: false }));
                break;
            case 'week':
                setPricePerWeek(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, week: false }));
                break;
            case 'month':
                setPricePerMonth(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, month: false }));
                break;
            default:
                break;
        }
    };

    const checkPriceFields = () => {
        const errors = {};
        const currencyErrors = {};

        if (pricePerDay === '') {
            errors.day = true;
        } else if (pricePerDay > 1 && pricePerDay < 10000) {
            currencyErrors.day = true;
        }

        if (pricePerWeek === '') {
            errors.week = true;
        } else if (pricePerWeek > 1 && pricePerWeek < 10000) {
            currencyErrors.week = true;
        }

        if (pricePerMonth === '') {
            errors.month = true;
        } else if (pricePerMonth > 1 && pricePerMonth < 10000) {
            currencyErrors.month = true;
        }

        setPriceErrors(errors);
        setCurrencyErrors(currencyErrors);

        // Return true only if there are no errors in both price and currency
        return (
            Object.values(errors).every((error) => !error) &&
            Object.values(currencyErrors).every((error) => !error)
        );
    };


    const handleModelChange = (e) => {
        setModelRental(e.target.value)
        setModelError(false)
    }

    const checkModelField = () => {
        if (modelRental === '') {
            setModelError(true);
            return false;
        }
        return true;
    };

    const checkImageField = () => {
        if (featureRentalImageUpload == undefined || featureRentalImageUpload == null) {
            setImageError(true);
            return true;
        }
        return false;
    };

    const handleImageUpload = async (image) => {
        try {
            if (!image) {
                console.error('No file selected for upload.');
                return;
            }

            const imageName = image.name + v4();
            const userFolderRef = ref(storage, `rentImages/${auth?.currentUser?.uid}`);

            // Log the upload result
            const uploadResult = await uploadBytes(ref(userFolderRef, imageName), image);
            console.log('Upload result:', uploadResult);

            // Fetch the updated file list
            try {
                const newResponse = await listAll(userFolderRef);
                const newUrls = await Promise.all(
                    newResponse.items.map(async (itemRef) => getDownloadURL(itemRef))
                );

                // Find the newly added URLs
                const addedUrls = newUrls.filter(url => !prevImageUrls.includes(url));

                // Use the previous state and add only the new URLs
                setImageUrls(prevUrls => [...prevUrls, ...addedUrls]);
                setPrevImageUrls(newUrls);
                setImageError(false);
            } catch (error) {
                console.error('Error listing files:', error);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const handleDropLocationChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setDropLocationRental((prevSelected) => [...prevSelected, ...selectedOptions]);
    };


    const handleSaleSubmit = async (e) => {
        e.preventDefault();

        checkPriceFields();
        checkModelField();
        checkImageField();

        if (!checkPriceFields() || !checkModelField()) {
            return;
        }

        if (!featureRentalImageUpload) {
            console.error('Feature image is not selected.');
            return;
        }

        const rentRef = collection(db, 'listings');

        try {
            const filteredImageUrls = imageUrls.filter(url => url);

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
                featureRentalImageUpload: filteredImageUrls[0],
                secondRentalImageUpload: filteredImageUrls[1] !== undefined ? filteredImageUrls[1] : null,
                thirdRentalImageUpload: filteredImageUrls[2] !== undefined ? filteredImageUrls[2] : null,
                userId: auth?.currentUser?.uid,
                createdAt: serverTimestamp(),
            });

            // Clear form fields after successful submission
            setTypeRental('automatic');
            setPricePerDay('');
            setPricePerWeek('');
            setPricePerMonth('');
            setLocationRental('');
            setDropLocationRental([])
            setModelRental('')
            setDescriptionRental('')
            setContactRental('')
            setIsOneWay(false)
            setImageUrls([])
            setPrevImageUrls([])
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
                            onChange={(e) => handleModelChange(e)}
                        />Make and Model
                    </label>

                    {modelError && (
                        <div className="form-error">
                            <p>Must include a model!</p>
                        </div>
                    )}

                    <label>
                        <input
                            name='priceDay'
                            type="number"
                            placeholder="Price"
                            value={pricePerDay}
                            onChange={(e) => handlePriceChange(e.target.value, 'day')}
                        />Price /Day
                    </label>

                    {(priceErrors.day || currencyErrors.day) && (
                        <div className="form-error">
                            <p>{priceErrors.day ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                        </div>
                    )}

                    <label>
                        <input
                            name='priceWeek'
                            type="number"
                            placeholder="Price"
                            value={pricePerWeek}
                            onChange={(e) => handlePriceChange(e.target.value, 'week')}
                        />Price /Week
                    </label>

                    {(priceErrors.week || currencyErrors.week) && (
                        <div className="form-error">
                            <p>{priceErrors.week ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                        </div>
                    )}

                    <label>
                        <input
                            name='priceMonth'
                            type="number"
                            placeholder="Price"
                            value={pricePerMonth}
                            onChange={(e) => handlePriceChange(e.target.value, 'month')}
                        />Price /Month
                    </label>

                    {(priceErrors.month || currencyErrors.month) && (
                        <div className="form-error">
                            <p>{priceErrors.month ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                        </div>
                    )}


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
                    <button type='button' onClick={() => handleImageUpload(featureRentalImageUpload)}>
                        {imageUrls.length == 0 ? 'Upload File' : 'Change'}</button>

                    {imageError && (
                        <div className="form-error">
                            <p>Must include an Image</p>
                        </div>
                    )}
                </div>


                {featureRentalImageUpload != null && (
                    <div>
                        <label>
                            <input type='file' onChange={(e) => setRentalSecondImageUpload(e.target.files[0])} />
                        </label>
                        <button type='button' onClick={() => handleImageUpload(secondRentalImageUpload)}>
                            {imageUrls.length > 0 ? 'Change' : 'Upload File'}</button>
                    </div>
                )}

                {secondRentalImageUpload != null && (

                    <div>
                        <label>
                            <input type='file' onChange={(e) => setRentalThirdImageUpload(e.target.files[0])} />
                        </label>
                        <button type='button' onClick={() => handleImageUpload(thirdRentalImageUpload)}>
                            {imageUrls.length > 1 ? 'Change' : 'Upload File'}</button>
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

                <button type="submit" onClick={handleSaleSubmit}>Post</button>
            </section>
        </>
    );
};

export default RentBikeForm;
