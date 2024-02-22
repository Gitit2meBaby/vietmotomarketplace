import { useState, useRef, useEffect } from 'react'
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

    const [showTooltip, setShowTootltip] = useState(false)

    const locations = ["Hanoi", "HCMC", "Danang", "Hoi An", "Nha Trang", "Mui Ne", "Dalat"];

    const [selectedFileName, setSelectedFileName] = useState('No file chosen');
    const [secondFileName, setSecondFileName] = useState('No file chosen')
    const [thirdFileName, setThirdFileName] = useState('No file chosen')

    const modelInputRef = useRef(null);
    const priceInputRef = useRef(null);

    useEffect(() => {
        setImageUrls([]);
    }, []);

    const handlePriceChange = (value, type) => {
        setCurrencyError(false)
        switch (type) {
            case 'day':
                setPricePerDay(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, day: false }));
                priceInputRef.current.focus()
                break;
            case 'week':
                setPricePerWeek(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, week: false }));
                priceInputRef.current.focus()
                break;
            case 'month':
                setPricePerMonth(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, month: false }));
                priceInputRef.current.focus()
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

    useEffect(() => {
        if (modelError) {
            modelInputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        } else if (priceErrors) {
            priceInputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        } else if (currencyError) {
            priceInputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }, [modelError, priceErrors, currencyError]);

    const handleTooltip = () => {
        setShowTootltip(!showTooltip)
        setCurrencyError(false)
        setPriceErrors(false)
    }

    const handleModelChange = (e) => {
        setModelRental(e.target.value)
        setModelError(false)
    }

    const checkModelField = () => {
        if (modelRental === '') {
            setModelError(true);
            modelInputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
            modelInputRef.current.focus()
            return false;
        }
        return true;
    };

    const handleFeatureFileChange = (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        setSelectedFileName(fileName);
        setRentalFeatureImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)
        setImageError(false)
    };

    const handleSecondFileChange = (e) => {
        const secondFileName = e.target.files[0]?.name || 'No file chosen';
        setSecondFileName(secondFileName);
        setRentalSecondImageUpload(e.target.files[0])
    };

    const handleThirdFileChange = (e) => {
        const thirdFileName = e.target.files[0]?.name || 'No file chosen';
        setThirdFileName(thirdFileName);
        setRentalThirdImageUpload(e.target.files[0])
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
        const { value } = e.target;

        setDropLocationRental((prevLocations) => {
            if (prevLocations.includes(value)) {
                return prevLocations.filter((location) => location !== value);
            } else {
                return [...prevLocations, value];
            }
        });
        console.log(dropLocationRental);
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
                transaction: 'rent',
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
        <section className='rent-section'>
            <form onSubmit={handleSaleSubmit}>

                <div className="input-wrapper">
                    <label ref={modelInputRef} className='main-label'>Make and Model<span className='required-span'> *</span>                        <input
                        name='model'
                        type="text"
                        placeholder="ie Honda Wave 2010"
                        value={modelRental}
                        aria-describedby="model-error"
                        onChange={(e) => handleModelChange(e)}
                        style={modelError ? { border: '1px solid red' } : {}}
                    />
                    </label>

                    {modelError && (
                        <>
                            <div className="pointer model-pointer"></div>
                            <div id="model-error" className="form-error" role="alert">
                                <p>Must include a model!</p>
                            </div>
                        </>
                    )}
                </div>

                <div className='radio-wrapper'>
                    <label className='main-label'>Transmission</label>
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

                <div className="rent-price-label">
                    <label ref={priceInputRef} htmlFor="price" className="main-label">Prices<span className='required-span'> *</span></label>
                    <svg onClick={() => handleTooltip()} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>

                    {showTooltip && (
                        <>
                            <div className="pointer rent-tooltip-pointer"></div>
                            <div className="tooltip rent-tooltip">
                                <div>
                                    <svg onClick={() => setShowTootltip(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>
                                    <p>Price must be in Vietnamese Dong.</p>
                                </div>
                                <a href='https://www.xe.com/currencyconverter/'>Need help converting?</a>
                            </div>
                        </>
                    )}
                </div>

                <div className="rent-inputs">
                    <label>
                        <input
                            name='priceDay'
                            type="number"
                            placeholder="VND"
                            value={pricePerDay}
                            style={{
                                border: (priceErrors.day || currencyErrors.day) ? `1px solid red` : 'none'
                            }}
                            onChange={(e) => handlePriceChange(e.target.value, 'day')}
                        />/Day
                    </label>

                    {(priceErrors.day || currencyErrors.day) && (
                        <>
                            <div className={`pointer ${priceErrors.day ? 'rent-price-pointer' : 'rent-currency-pointer'}`}></div>
                            <div className="form-error rent-price-error">
                                <p>{priceErrors.day ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="rent-inputs">
                    <label>
                        <input
                            name='priceWeek'
                            type="number"
                            placeholder="VND"
                            value={pricePerWeek}
                            style={{
                                border: (priceErrors.week || currencyErrors.week) ? `1px solid red` : 'none'
                            }}
                            onChange={(e) => handlePriceChange(e.target.value, 'week')}
                        />/Week
                    </label>

                    {(priceErrors.week || currencyErrors.week) && (
                        <>
                            <div className={`pointer ${priceErrors.week ? 'rent-price-pointer' : 'rent-currency-pointer'}`}></div>

                            <div className="form-error rent-price-error">
                                <p>{priceErrors.week ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="rent-inputs">
                    <label>
                        <input
                            name='priceMonth'
                            type="number"
                            placeholder="VND"
                            value={pricePerMonth}
                            style={{
                                border: (priceErrors.month || currencyErrors.month) ? `1px solid red` : 'none'
                            }}
                            onChange={(e) => handlePriceChange(e.target.value, 'month')}
                        />/Month
                    </label>

                    {(priceErrors.month || currencyErrors.month) && (
                        <>
                            <div className={`pointer ${priceErrors.month ? 'rent-price-pointer' : 'rent-currency-pointer'}`}></div>                            <div className="form-error rent-price-error">
                                <p>{priceErrors.month ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="input-wrapper dropdown-wrapper">
                    <label className='main-label' htmlFor="locationRental"
                        value={locationRental}
                        onClick={() => setShowTootltip(false)}
                        onChange={(e) => setLocationRental(e.target.value)}
                    >Pick Up Location
                        <select
                            name="location"
                            id="locationRental">
                            <option value="Hanoi">Hanoi</option>
                            <option value="HCMC">HCMC</option>
                            <option value="Danang">Danang</option>
                            <option value="Hoi An">Hoi An</option>
                            <option value="Nha Trang">Nha Trang</option>
                            <option value="Mui Ne">Mui Ne</option>
                            <option value="Dalat">Dalat</option>
                        </select>
                    </label>
                </div>

                <div className="checkbox-wrapper">
                    <input type='checkbox' checked={isOneWay} onChange={(e) => setIsOneWay(e.target.checked)} />
                    <label className='main-label'>One Way rental available?</label>
                </div>

                {isOneWay && (
                    <div className='drop-locations-wrapper'>
                        <div className="drop-locations">
                            <label className='main-label' htmlFor="dropLocation">Select drop off locations -</label>
                        </div>
                        <div className="checkbox-options">
                            {locations.map((location) => (
                                <div key={location}>
                                    <input
                                        type="checkbox"
                                        id={location}
                                        value={location}
                                        checked={dropLocationRental.includes(location)}
                                        onChange={handleDropLocationChange}
                                    />
                                    <label htmlFor={location}>{location}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <label className='main-label' htmlFor='description'
                    onChange={(e) => setDescriptionRental(e.target.value)}>
                    Description
                    <textarea name="description" id="descriptionRental" cols="30" rows="10"
                        value={descriptionRental}
                        placeholder='Information about the rental'></textarea>
                </label>

                <label className='main-label' htmlFor='contact'
                    onChange={(e) => setContactRental(e.target.value)}>
                    Contact
                    <textarea name="contact" id="contactRental" cols="30" rows="10"
                        value={contactRental}
                        placeholder='Preferred contact method...'></textarea>
                </label>
            </form>

            <div className='file-btn-wrapper'>
                <label className="main-label">Images<span className='required-span'> * <span>(atleast 1 required)</span></span></label>

                <div>
                    <input type='file' onChange={(e) => handleFeatureFileChange(e)} />
                    <label className="custom-file-button"
                        value={featureRentalImageUpload ? null : ''}
                        style={imageError ? {
                            backgroundColor: 'rgba(255, 0, 0, 0.858)'
                        } : {}}
                    >Choose Feature</label>
                    <span>{selectedFileName}</span>
                </div>

                {imageError && (
                    <>
                        <div className="pointer image-pointer"></div>
                        <div className="form-error image-error">
                            <p>Must include an Image!</p>
                        </div>
                    </>
                )}

                {featureRentalImageUpload != null && (
                    <button className='upload-btn' onClick={() => handleImageUpload(featureRentalImageUpload)}>
                        {imageUrls.length === 0 ? 'Upload' : 'Change'}</button>
                )}
            </div>

            {imageUrls.length == 1 && (
                <div className='file-btn-wrapper'>
                    <div>
                        <input type='file'
                            value={secondRentalImageUpload ? null : ''}
                            onChange={(e) => handleSecondFileChange(e)} />
                        <label className="custom-file-button">Another..</label>
                        <span>{secondFileName}</span>
                    </div>

                    {secondRentalImageUpload != null && (
                        <button className='upload-btn' onClick={() => handleImageUpload(secondRentalImageUpload)}>
                            {imageUrls.length <= 1 ? 'Upload' : 'Change'}
                        </button>
                    )}
                </div>
            )}

            {imageUrls.length >= 2 && (
                <div className='file-btn-wrapper'>
                    <div>
                        <input type='file'
                            value={thirdRentalImageUpload ? null : ''}
                            onChange={(e) => handleThirdFileChange(e)} />
                        <label className="custom-file-button">Choose Final</label>
                        <span>{thirdFileName}</span>
                    </div>

                    {thirdRentalImageUpload != null && (
                        <button className='upload-btn' onClick={() => handleImageUpload(thirdRentalImageUpload)}>
                            {imageUrls.length <= 2 ? 'Upload' : 'Change'}</button>
                    )}
                </div>
            )}

            <div className="final-form-btns">
                <button type="button" onClick={() => setShowPreview(!showPreview)}>Preview</button>
                <button className='post-btn' type="submit" onClick={handleSaleSubmit}>Post</button>
            </div>


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
        </section>

    );
};

export default RentBikeForm;
