import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db, auth, storage } from '../firebase'
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage'
import { v4 } from 'uuid'
import Preview from './Preview'
import { useAppContext } from '../context';
// icon imports
import whatsAppLogo from '../assets/socials/whatsApp.svg'
import faceBookLogo from '../assets/socials/facebook.svg'
import zaloLogo from '../assets/socials/zalo.svg'

const RentBikeForm = () => {
    const { imageUrls, setImageUrls, featureRentalImageUpload, setFeatureRentalImageUpload,
        secondRentalImageUpload, setSecondRentalImageUpload,
        thirdRentalImageUpload, setThirdRentalImageUpload, cropper,
        setCropper, setChosenImage, chosenImage } = useAppContext()

    // states to be passed to firestore DB
    const [typeRental, setTypeRental] = useState('');
    const [pricePerDay, setPricePerDay] = useState('')
    const [pricePerWeek, setPricePerWeek] = useState('')
    const [pricePerMonth, setPricePerMonth] = useState('')
    const [locationRental, setLocationRental] = useState('');
    const [dropLocationRental, setDropLocationRental] = useState([]);
    const [descriptionRental, setDescriptionRental] = useState('')
    const [modelRental, setModelRental] = useState('')
    const [isOneWay, setIsOneWay] = useState(false)

    // multiple contact options
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [facebook, setFacebook] = useState('');
    const [zalo, setZalo] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');

    // urls to store in array for firebase storage
    const [prevImageUrls, setPrevImageUrls] = useState([]);

    const [showPreview, setShowPreview] = useState(false)

    // Error states to show tooltips
    const [modelError, setModelError] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [noUpload, setNoUpload] = useState(false)
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

    // info tooltip
    const [showTooltip, setShowTootltip] = useState(false)
    const [showContactTooltip, setShowContactTootltip] = useState(false)

    // array to store drop off locations for one way rentals
    const locations = ["Hanoi", "HCMC", "Danang", "Hoi An", "Nha Trang", "Mui Ne", "Dalat"];

    // local states just to show file name on custom file input
    const [selectedFileName, setSelectedFileName] = useState('No file chosen');
    const [secondFileName, setSecondFileName] = useState('No file chosen')
    const [thirdFileName, setThirdFileName] = useState('No file chosen')

    // refs used for scrollTo after errors
    const modelInputRef = useRef(null);
    const priceInputRef = useRef(null);
    const dayInputRef = useRef(null)
    const weekInputRef = useRef(null)
    const monthInputRef = useRef(null)
    const previewRef = useRef(null)

    // set a submitting state to stop unwanted scrolling on input changes
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false)

    //UI indication of image uploading
    const [imageUploadStatus, setImageUploadStatus] = useState({
        feature: false,
        second: false,
        third: false,
    });

    // clear the url array required if same user makes multiple posts
    useEffect(() => {
        setImageUrls([]);
        setSubmitSuccess(false)
    }, []);

    // store prices in state and validate no input, scroll and focus on errors
    const handlePriceChange = (value, type) => {
        switch (type) {
            case 'day':
                setPricePerDay(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, day: false }));
                setCurrencyErrors((prevErrors) => ({ ...prevErrors, day: false }));
                break;
            case 'week':
                setPricePerWeek(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, week: false }));
                setCurrencyErrors((prevErrors) => ({ ...prevErrors, week: false }));
                break;
            case 'month':
                setPricePerMonth(value);
                setPriceErrors((prevErrors) => ({ ...prevErrors, month: false }));
                setCurrencyErrors((prevErrors) => ({ ...prevErrors, month: false }));
                break;
            default:
                break;
        }
    };

    // validations done on submission
    const checkPriceFields = () => {
        const errors = {};
        const currencyErrors = {};

        if (pricePerMonth === '') {
            errors.month = true;
            monthInputRef.current.focus()
        } else if (pricePerMonth >= 1 && pricePerMonth < 10000) {
            currencyErrors.month = true;
            monthInputRef.current.focus()
        }

        if (pricePerWeek === '') {
            errors.week = true;
            weekInputRef.current.focus()
        } else if (pricePerWeek >= 1 && pricePerWeek < 10000) {
            currencyErrors.week = true;
            weekInputRef.current.focus()
        }

        if (pricePerDay === '') {
            errors.day = true;
            dayInputRef.current.focus()
        } else if (pricePerDay >= 1 && pricePerDay < 10000) {
            currencyErrors.day = true;
            dayInputRef.current.focus()
        }

        setSubmitting(true);
        setPriceErrors(errors);
        setCurrencyErrors(currencyErrors);

        return (
            Object.values(errors).every((error) => !error) &&
            Object.values(currencyErrors).every((error) => !error)
        );
    };

    // scroll to errors
    useEffect(() => {
        if (modelError) {
            const modelOffsetTop = modelInputRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: modelOffsetTop,
                behavior: 'smooth',
            });

            modelInputRef.current.focus();

        } else if (submitting && (priceErrors.day || priceErrors.week || priceErrors.month || currencyErrors.day || currencyErrors.week || currencyErrors.month)) {

            const priceOffsetTop = priceInputRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: priceOffsetTop,
                behavior: 'smooth',
            });

            priceInputRef.current.focus();
        }

        // Reset submitting to false after the effect runs
        setSubmitting(false);
    }, [modelError, priceErrors, currencyErrors, submitting]);



    // information regarding price input
    const handleTooltip = () => {
        setShowTootltip(!showTooltip)
        setCurrencyErrors(false)
        setPriceErrors(false)
    }

    // information regarding contact details
    const handleContactTooltip = () => {
        setShowContactTootltip(!showContactTooltip)
    }

    // clear errors and set state on model input change
    const handleModelChange = (e) => {
        setModelRental(e.target.value)
        setModelError(false)
    }

    // model field validation
    const checkModelField = () => {
        if (modelRental === '') {
            setModelError(true);
            return false;
        }
        return true;
    };

    // Make the filenames short enough to not force a second line
    const truncateFileName = (fileName, charLimit) => {
        if (fileName.length <= charLimit) {
            return fileName;
        }

        const truncatedName = fileName.slice(0, charLimit) + '...';
        return truncatedName;
    };

    // setting images and names into local state (not URLS for firestore) 
    const handleFeatureFileChange = (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        const truncatedFileName = truncateFileName(fileName, 15);

        setSelectedFileName(truncatedFileName);
        setFeatureRentalImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)
        setImageError(false)
    };

    const handleSecondFileChange = (e) => {
        const secondFileName = e.target.files[0]?.name || 'No file chosen';
        const truncatedFileName = truncateFileName(secondFileName, 15);

        setSecondFileName(truncatedFileName);
        setSecondRentalImageUpload(e.target.files[0])
    };

    const handleThirdFileChange = (e) => {
        const thirdFileName = e.target.files[0]?.name || 'No file chosen';
        const truncatedFileName = truncateFileName(thirdFileName, 15);

        setThirdFileName(truncatedFileName);
        setThirdRentalImageUpload(e.target.files[0])
    };

    // Validate atleast one image has been uploaded
    const checkImageField = () => {
        if (imageUrls.length === 0) {
            setImageError(true);
            return false;
        }
        return true;
    };

    // Make sure they actually pressed the upload button
    const checkNoUpload = () => {
        if (featureRentalImageUpload && imageUrls.length === 0) {
            setNoUpload(true);
            return false;
        }
        return true;
    };

    const generatePostID = () => {
        return v4();
    };

    // push the image url into the array for firebase
    const handleImageUpload = async (imageKey, image) => {
        try {
            if (!image) {
                console.error('No file selected for upload.');
                return;
            }

            // Generate a unique post ID for each post
            const postID = generatePostID();

            // Update the upload status for the specific image
            setImageUploadStatus((prevStatus) => ({
                ...prevStatus,
                [imageKey]: true,
            }));

            // Generate a unique image name with post ID
            const imageName = `${postID}_${image.name}`;

            // Create a reference to the user's folder in rentImages
            const userFolderRef = ref(storage, `rentImages/${auth?.currentUser?.uid}/${postID}`);

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
                const addedUrls = newUrls.filter((url) => !prevImageUrls.includes(url));

                // Use the previous state and add only the new URLs
                setImageUrls((prevUrls) => [...prevUrls, ...addedUrls]);
                setPrevImageUrls(newUrls);
                setImageError(false);
                setNoUpload(false)
            } catch (error) {
                console.error('Error listing files:', error);
            } finally {
                // Update the upload status for the specific image to false
                setImageUploadStatus((prevStatus) => ({
                    ...prevStatus,
                    [imageKey]: false,
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    // update drop location array
    const handleDropLocationChange = (e) => {
        const { value } = e.target;

        setDropLocationRental((prevLocations) => {
            if (prevLocations.includes(value)) {
                return prevLocations.filter((location) => location !== value);
            } else {
                return [...prevLocations, value];
            }
        });
    };

    // final submission, validations from previous functions and submit to DB
    const handleSaleSubmit = async (e) => {
        e.preventDefault();

        const isPriceValid = checkPriceFields();
        const isModelValid = checkModelField();
        const isImageValid = checkImageField();
        const isUpload = checkNoUpload()

        if (!isPriceValid || !isModelValid || !isImageValid || !isUpload) {
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
                phone: phone,
                whatsapp: whatsapp,
                facebook: facebook,
                zalo: zalo,
                website: website,
                address: address,
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
            setIsOneWay(false)
            setImageUrls([])
            setPrevImageUrls([])
            setPhone('')
            setWhatsapp('')
            setFacebook('')
            setZalo('')
            setWebsite('')
            setAddress('')

            setSubmitSuccess(true)
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    // format the price to use 'mil' and remove excessive zeros
    function formatPrice(price) {
        const priceStr = price.toString();
        const length = priceStr.length;

        if (length >= 7 && price % 1000000 === 0) {
            // Remove the last 6 digits and replace with ' mil'
            return priceStr.slice(0, length - 6) + 'mil';
        } else if (length >= 7 && price % 100000 === 0 && priceStr[length - 6] !== '0') {
            // Insert a decimal between digit 7 and 6 and replace the remaining 5 digits with ' mil'
            return priceStr.slice(0, length - 6) + '.' + priceStr.slice(length - 6, length - 5) + 'mil';
        }

        // Default case: return the original number
        return price;
    }

    //show preview modal
    const handlePreviewBtn = () => {
        setShowPreview(!showPreview);

        if (previewRef.current) {
            const previewOffsetTop = previewRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: previewOffsetTop,
                behavior: 'smooth',
            });
        }
    };

    // Exit successfull post modal
    const handlePostAgain = () => {
        setSubmitSuccess(false)
        setImageUrls([])
    }

    return (
        <section className='rent-section'>
            <form
                className='post-bike-form'
                onSubmit={handleSaleSubmit}>

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
                            <div id="model-error" className="form-error model-error" role="alert">
                                <p>Must include a model!</p>
                            </div>
                        </>
                    )}
                </div>

                <div className='radio-wrapper'>
                    <label className='main-label'>Transmission</label>
                    <div>
                        <label className='small-label'>
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
                        <label className='small-label'>
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
                        <label className='small-label'>
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
                    <label className='small-label'>
                        <input
                            name='priceDay'
                            type="number"
                            placeholder="VND"
                            value={pricePerDay}
                            ref={dayInputRef}
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
                    <label className='small-label'>
                        <input
                            name='priceWeek'
                            type="number"
                            placeholder="VND"
                            value={pricePerWeek}
                            ref={weekInputRef}
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
                    <label className='small-label'>
                        <input
                            name='priceMonth'
                            type="number"
                            placeholder="VND"
                            value={pricePerMonth}
                            ref={monthInputRef}
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
                            <option disabled>Please select..</option>
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
                                    <label className='small-label' htmlFor={location}>{location}</label>
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
                        placeholder='Information about the rental...'></textarea>
                </label>

                <div className="contact-heading-wrapper">
                    <label htmlFor="contact" className="main-label">Contact Details</label>
                    <svg onClick={() => handleContactTooltip()} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>

                    {showContactTooltip && (
                        <>
                            <div className="pointer contact-pointer"></div>
                            <div className="tooltip contact-tooltip">
                                <div>
                                    <svg onClick={() => setShowContactTootltip(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="4.8em" width="4.8em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>
                                    <p>All fields are optional, in app messaging is always enabled.</p>
                                </div>
                                <a href='#'>See how your data is kept private</a>
                            </div>
                            <div className="pointer contact-bottom-pointer"></div>
                        </>
                    )}
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='phone'>
                        <span className="hidden">Phone:</span>
                        <div className="svg-wrapper">
                            <svg stroke="currentColor" fill="#000" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </div>
                        <input
                            type="text"
                            name="phone"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder='Phone number...'
                        />
                    </label>
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='whatsapp'>
                        <span className="hidden">WhatsApp</span>
                        <img src={whatsAppLogo} alt="WhatsApp Logo" />
                        <input
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder='WhatsApp number...'
                        />
                    </label>
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='facebook'>
                        <span className="hidden">Facebook:</span>
                        <img src={faceBookLogo} alt="Facebook Logo" />
                        <input
                            type="text"
                            name="facebook"
                            id="facebook"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder='Facebook profile...'
                        />
                    </label>
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='zalo'>
                        <span className="hidden">Zalo:</span>
                        <img src={zaloLogo} alt="Zalo Logo" />
                        <input
                            type="text"
                            name="zalo"
                            id="zalo"
                            value={zalo}
                            onChange={(e) => setZalo(e.target.value)}
                            placeholder='Zalo ID...'
                        />
                    </label>
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='website'>
                        <span className="hidden">Website:</span>
                        <div className="svg-wrapper">
                            <svg stroke="currentColor" fill="#0000FF" strokeWidth="0" viewBox="0 0 512 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>
                        </div>
                        <input
                            type="text"
                            name="website"
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder='Website URL...'
                        />
                    </label>
                </div>

                <div className="contact-wrapper">
                    <label htmlFor='address'>
                        <span className="hidden">Address:</span>
                        <div className="svg-wrapper">
                            <svg stroke="#DB4437" fill="#FF0000" strokeWidth="0" viewBox="0 0 288 512" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M112 316.94v156.69l22.02 33.02c4.75 7.12 15.22 7.12 19.97 0L176 473.63V316.94c-10.39 1.92-21.06 3.06-32 3.06s-21.61-1.14-32-3.06zM144 0C64.47 0 0 64.47 0 144s64.47 144 144 144 144-64.47 144-144S223.53 0 144 0zm0 76c-37.5 0-68 30.5-68 68 0 6.62-5.38 12-12 12s-12-5.38-12-12c0-50.73 41.28-92 92-92 6.62 0 12 5.38 12 12s-5.38 12-12 12z"></path></svg>
                        </div>
                        <input
                            type="text"
                            name="address"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder='Pickup address...'
                        />
                    </label>
                </div>
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

                {noUpload && (
                    <>
                        <div className="pointer upload-pointer"></div>
                        <div className="form-error upload-error">
                            <p>Your need to upload the image!</p>
                        </div>
                    </>
                )}

                {featureRentalImageUpload != null && (
                    <button className='upload-btn' onClick={() => handleImageUpload('feature', featureRentalImageUpload)}>
                        {imageUploadStatus.feature ? 'Uploading now...' : (imageUrls.length === 0 ? 'Upload' : 'Change')}
                    </button>
                )}
            </div>

            {imageUrls.length >= 1 && (
                <div className='file-btn-wrapper'>
                    <div>
                        <input type='file'
                            value={secondRentalImageUpload ? null : ''}
                            onChange={(e) => handleSecondFileChange(e)} />
                        <label className="custom-file-button">Another..</label>
                        <span>{secondFileName}</span>
                    </div>

                    {secondRentalImageUpload != null && (
                        <button className='upload-btn' onClick={() => handleImageUpload('second', secondRentalImageUpload)}>
                            {imageUploadStatus.second ? 'Uploading now...' : (imageUrls.length <= 1 ? 'Upload' : 'Change')}
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
                        <button className='upload-btn' onClick={() => handleImageUpload('third', thirdRentalImageUpload)}>
                            {imageUploadStatus.third ? 'Uploading now...' : (imageUrls.length <= 2 ? 'Upload' : 'Change')}
                        </button>
                    )}
                </div>
            )}


            <div className="final-form-btns">
                <button type="button" onClick={() => handlePreviewBtn()}>Preview</button>
                <button className='post-btn' type="submit" onClick={handleSaleSubmit}>Post</button>
            </div>


            {showPreview && (
                <Preview
                    ref={previewRef}
                    type={typeRental}
                    pricePerDay={formatPrice(pricePerDay)}
                    pricePerWeek={formatPrice(pricePerWeek)}
                    pricePerMonth={formatPrice(pricePerMonth)}
                    location={locationRental}
                    dropLocation={dropLocationRental}
                    description={descriptionRental}
                    phone={phone}
                    whatsapp={whatsapp}
                    facebook={facebook}
                    zalo={zalo}
                    website={website}
                    address={address}
                    model={modelRental}
                    featureImage={featureRentalImageUpload}
                    secondImage={secondRentalImageUpload}
                    thirdImage={thirdRentalImageUpload}
                    setShowPreview={setShowPreview}
                />
            )}

            {submitSuccess && (
                <div className="submit-success-modal">
                    <h2>Success!</h2>
                    <p>Your {model} has been posted</p>
                    <button onClick={() => handlePostAgain()} className="post-again-btn">Make Another Post</button>
                    <Link to="/list" className="go-to-list-btn">See it Live</Link>
                </div>
            )}
        </section>

    );
};

export default RentBikeForm;
