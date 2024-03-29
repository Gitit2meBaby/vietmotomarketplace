import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db, auth, storage } from '../firebase'
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid';
import Preview from './Preview'
import { useAppContext } from '../context';
// icon imports
import whatsAppLogo from '../assets/socials/whatsApp.svg'
import faceBookLogo from '../assets/socials/facebook.svg'
import zaloLogo from '../assets/socials/zalo.svg'

const SellBikeForm = () => {
    const { imageUrls, setImageUrls, featureImageUpload, setFeatureImageUpload,
        secondImageUpload, setSecondImageUpload,
        thirdImageUpload, setThirdImageUpload, cropper,
        setCropper, setChosenImage, chosenImage, isLoggedIn, currentUser } = useAppContext()

    const [postId, setPostId] = useState(null)

    // states to be passed to firestore DB
    const [type, setType] = useState('');
    const [price, setPrice] = useState('');
    const [localLocation, setLocalLocation] = useState('');
    const [description, setDescription] = useState('')
    const [model, setModel] = useState('')

    // multiple contact options
    const [phone, setPhone] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [facebook, setFacebook] = useState('');
    const [zalo, setZalo] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');

    // Error states to show error tooltips
    const [priceError, setPriceError] = useState(false)
    const [currencyError, setCurrencyError] = useState(false)
    const [modelError, setModelError] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [noUpload, setNoUpload] = useState(false)
    const [locationError, setLocationError] = useState(false)

    // information tooltips
    const [showTooltip, setShowTootltip] = useState(false)
    const [showContactTooltip, setShowContactTootltip] = useState(false)

    // local states just to show file name on custom file input
    const [selectedFileName, setSelectedFileName] = useState('No file chosen');
    const [secondFileName, setSecondFileName] = useState('No file chosen')
    const [thirdFileName, setThirdFileName] = useState('No file chosen')

    // set a submitting state to stop unwanted scrolling on input changes
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false)

    //UI indication of image uploading
    const [imageUploadStatus, setImageUploadStatus] = useState({
        feature: false,
        second: false,
        third: false,
    });

    const [showPreview, setShowPreview] = useState(false)

    // refs used for scrollTo after errors
    const modelInputRef = useRef(null);
    const priceInputRef = useRef(null);
    const locationInputRef = useRef(null);

    // clear the url array required if same user makes multiple posts, reset submission state, create a new postId
    useEffect(() => {
        setImageUrls([]);
        setSubmitSuccess(false)
        setPostId(generatePostID())
    }, []);

    // Generate a Post ID
    const generatePostID = () => {
        return uuidv4();
    };

    // price input
    const handlePriceChange = (e) => {
        setPrice(e.target.value)
        setPriceError(false)
        setCurrencyError(false)
        setShowTootltip(false)
    }

    // price info tooltip
    const handleTooltip = () => {
        setShowTootltip(!showTooltip)
        setCurrencyError(false)
        setPriceError(false)
    }

    // contact info tooltip
    const handleContactTooltip = () => {
        setShowContactTootltip(!showContactTooltip)
    }

    // model input
    const handleModelChange = (e) => {
        setModel(e.target.value)
        setModelError(false)
    }

    // Location Input
    const handleLocationChange = (e) => {
        setLocalLocation(e.target.value)
        setLocationError(false)
    }

    // Final submission function
    const handleSaleSubmit = async (e) => {
        e.preventDefault();
        const isPriceValid = checkPriceField();
        const isModelValid = checkModelField();
        const isUpload = checkNoUpload()
        const isImageValid = checkImageField();
        const isLocationValid = checkLocationField();

        if (!isPriceValid || !isModelValid || !isImageValid || !isUpload || !isLocationValid) {
            return;
        }

        const sellRef = collection(db, 'listings');

        try {
            const filteredImageUrls = imageUrls.filter(url => url);

            await addDoc(sellRef, {
                postID: postId,
                userId: currentUser.uid,
                avatar: currentUser.photoURL,
                name: currentUser.displayName,
                type: type,
                price: parseFloat(price),
                model: model,
                location: localLocation,
                transaction: 'sell',
                description: description,
                phone: phone,
                whatsapp: whatsapp,
                facebook: facebook,
                zalo: zalo,
                website: website,
                address: address,
                featureImage: filteredImageUrls[0],
                secondImage: filteredImageUrls[1] !== undefined ? filteredImageUrls[1] : null,
                thirdImage: filteredImageUrls[2] !== undefined ? filteredImageUrls[2] : null,
                createdAt: serverTimestamp(),
            });

            // Clear form fields after successful submission
            setType('');
            setPrice('');
            setLocalLocation('');
            setModel('')
            setDescription('')
            setPhone('')
            setWhatsapp('')
            setFacebook('')
            setZalo('')
            setWebsite('')
            setAddress('')
            setImageUrls([])
            setFeatureImageUpload(null);
            setSecondImageUpload(null);
            setThirdImageUpload(null);
            setSelectedFileName('')
            setSecondFileName('')
            setThirdFileName('')

            setSubmitSuccess(true)

        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    // validations done on submission
    const checkPriceField = () => {
        if (price === '') {
            setPriceError(true);
            priceInputRef.current.focus()
            return false;
        } else if (price > 1 && price < 100000) {
            setCurrencyError(true);
            priceInputRef.current.focus()
            return false;
        }

        setSubmitting(true);
        return true;
    };

    const checkModelField = () => {
        if (model === '') {
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

    const checkLocationField = () => {
        if (localLocation === '') {
            setLocationError(true);
            return false;
        }
        return true;
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

        } else if (priceError && submitting) {
            const priceOffsetTop = priceInputRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: priceOffsetTop,
                behavior: 'smooth',
            });

            priceInputRef.current.focus();

        } else if (currencyError && submitting) {
            const priceOffsetTop = priceInputRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: priceOffsetTop,
                behavior: 'smooth',
            });

            priceInputRef.current.focus();
        } else if (locationError) {
            const locationOffsetTop = locationInputRef.current.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
                top: locationOffsetTop,
                behavior: 'smooth',
            });
        }
        setSubmitting(false);
    }, [modelError, priceError, currencyError, submitting, locationError]);


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
        setFeatureImageUpload('current');
        setImageError(false);
        setChosenImage(e.target.files.length > 0 ? e.target.files[0] : null)
        setCropper(true)
    };

    const handleSecondFileChange = (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        const truncatedFileName = truncateFileName(fileName, 15);

        setSecondFileName(truncatedFileName);
        setSecondImageUpload('current');
        setChosenImage(e.target.files.length > 0 ? e.target.files[0] : null)
        setCropper(true)
    };

    const handleThirdFileChange = (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        const truncatedFileName = truncateFileName(fileName, 15);

        setThirdFileName(truncatedFileName);
        setThirdImageUpload('current');
        setChosenImage(e.target.files.length > 0 ? e.target.files[0] : null)
        setCropper(true)
    };

    // Validate atleast one image has been uploaded
    const checkImageField = () => {
        if (imageUrls.length === 0) {
            setImageError(true);
            return false;
        }
        return true;
    };

    const checkNoUpload = () => {
        if (featureImageUpload && imageUrls.length === 0) {
            setNoUpload(true);
            return false;
        }
        return true;
    };

    // push the image url into the array for firebase
    const handleImageUpload = async (imageKey, image) => {
        try {
            if (!image) {
                console.error('No file selected for upload.');
                setImageError(true);
                return;
            }

            // Convert Blob URL to Blob object
            const blob = await fetch(image).then((response) => response.blob());

            // Update the upload status for the specific image
            setImageUploadStatus(prevStatus => ({
                ...prevStatus,
                [imageKey]: true,
            }));

            const imageName = imageKey;
            const userFolderRef = ref(storage, `sellImages/${postId}`);

            // Log the upload result
            const uploadResult = await uploadBytes(ref(userFolderRef, imageName), blob, {
                contentType: image.type,
            });
            console.log('Upload result:', uploadResult);

            // Fetch the updated file list and update the state
            try {
                const response = await listAll(userFolderRef);

                const urlPromises = response.items.map(async (itemRef) => getDownloadURL(itemRef));
                const urls = await Promise.all(urlPromises);

                // Use the previous state to ensure correct updates
                setImageUrls(urls);
                setImageError(false);
                setNoUpload(false);
            } catch (error) {
                console.error('Error listing files:', error);
            } finally {
                // Update the upload status for the specific image to false
                setImageUploadStatus(prevStatus => ({
                    ...prevStatus,
                    [imageKey]: false,
                }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };


    // format the price to use 'mil' and remove excessive zeros
    function formatPrice(price) {
        const priceStr = price.toString();
        const length = priceStr.length;

        if (length >= 7 && price % 1000000 === 0) {
            return priceStr.slice(0, length - 6) + 'mil';
        } else if (length >= 7 && price % 100000 === 0 && priceStr[length - 6] !== '0') {
            return priceStr.slice(0, length - 6) + '.' + priceStr.slice(length - 6, length - 5) + 'mil';
        }
        return price;
    }

    // show preview popup
    const handlePreviewBtn = () => {
        setShowPreview(!showPreview);
    };

    // Exit successfull post modal
    const handlePostAgain = () => {
        setSubmitSuccess(false)
        setImageUrls([])
        setPostId(generatePostID())
    }

    return (
        <>
            <section className='sale-section'>
                <form
                    className='post-bike-form'
                    onSubmit={handleSaleSubmit}>

                    <div className="input-wrapper">
                        <label ref={modelInputRef} className='main-label'>Make and Model<span className='required-span'> *</span>
                            <input
                                name='model'
                                type="text"
                                placeholder="ie Honda Wave 2010"
                                value={model}
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

                    <div className="input-wrapper">
                        <label ref={priceInputRef} className='main-label'>Price<span className='required-span'> *</span>
                            <div>
                                <input
                                    name='price'
                                    type="number"
                                    placeholder="VND"
                                    value={price}
                                    autoComplete="off"
                                    aria-describedby="price-error"
                                    onChange={(e) => handlePriceChange(e)}
                                    style={(priceError || currencyError) ? { border: '1px solid red' } : {}}
                                />
                                <svg onClick={() => handleTooltip()} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height=".8em" width=".8em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>

                                {showTooltip && (
                                    <>
                                        <div className="pointer tooltip-pointer"></div>
                                        <div className="tooltip sell-tooltip">
                                            <div>
                                                <svg onClick={() => setShowTootltip(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>
                                                <p>Price must be in Vietnamese Dong.</p>
                                            </div>
                                            <a target='/blank' href='https://www.xe.com/currencyconverter/'>Need help converting?</a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </label>

                        {priceError && (
                            <>
                                <div className="pointer price-pointer"></div>
                                <div id="price-error" className="form-error price-error" role="alert">                                  <p>Must include a price!</p>
                                </div>
                            </>
                        )}

                        {currencyError && (
                            <>
                                <div className="pointer currency-pointer"></div>
                                <div className="form-error currency-error" role="alert">
                                    <p>Seems too cheap.. are you using VND?</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="input-wrapper dropdown-wrapper">
                        <label className='main-label' htmlFor="location" ref={locationInputRef}>
                            Location
                            <select
                                name="location"
                                id="location"
                                value={location}
                                onChange={(e) => handleLocationChange(e)}
                                onClick={() => setShowTootltip(false)}
                                aria-label="Select location"
                            >
                                <option value="">Please select..</option>
                                <option value="Hanoi">Hanoi</option>
                                <option value="HCMC">HCMC</option>
                                <option value="Danang">Danang</option>
                                <option value="Hoi An">Hoi An</option>
                                <option value="Nha Trang">Nha Trang</option>
                                <option value="Mui Ne">Mui Ne</option>
                                <option value="Dalat">Dalat</option>
                            </select>
                        </label>


                        {locationError && (
                            <>
                                <div className="pointer location-pointer"></div>
                                <div className="form-error location-error" role="alert">
                                    <p>Must Include a location.</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className='radio-wrapper'>
                        <label className='main-label'>Transmission</label>
                        <div>
                            <label className='small-label'>
                                <input
                                    name='type'
                                    type="radio"
                                    value="automatic"
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Automatic
                            </label>
                        </div>

                        <div>
                            <label className='small-label'>
                                <input
                                    name='type'
                                    type="radio"
                                    value="semi-automatic"
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Semi-Automatic
                            </label>
                        </div>
                        <div>
                            <label className='small-label'>
                                <input
                                    name='type'
                                    type="radio"
                                    value="manual"
                                    onChange={(e) => setType(e.target.value)}
                                />
                                Manual
                            </label>
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className='main-label' htmlFor='description'
                            onChange={(e) => setDescription(e.target.value)}>
                            Description
                            <textarea name="description" id="description" cols="30" rows="10" value={description}
                                placeholder='Tell us about your ride...'></textarea>
                        </label>
                    </div>

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
                            value={featureImageUpload ? null : ''}
                            style={imageError ? {
                                backgroundColor: 'rgba(255, 0, 0, 0.858)'
                            } : {}}
                        >Choose Feature</label>
                        <span>{selectedFileName}</span>
                    </div>

                    {(imageError && !noUpload) && (
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

                    {featureImageUpload != null && (
                        <button className='upload-btn' onClick={() => handleImageUpload('feature', featureImageUpload)}
                        >
                            {imageUploadStatus.feature ? 'Uploading now...' : (imageUrls.length === 0 ? 'Upload' : 'Change')}
                        </button>
                    )}
                </div>

                {imageUrls.length >= 1 && (
                    <div className='file-btn-wrapper'>
                        <div>
                            <input type='file'
                                value={secondImageUpload ? null : ''}
                                onChange={(e) => handleSecondFileChange(e)} />
                            <label className="custom-file-button">Another..</label>
                            <span>{secondFileName}</span>
                        </div>

                        {secondImageUpload != null && (
                            <button className='upload-btn' onClick={() => handleImageUpload('second', secondImageUpload)}>
                                {imageUploadStatus.second ? 'Uploading now...' : (imageUrls.length <= 1 ? 'Upload' : 'Change')}
                            </button>

                        )}
                    </div>
                )}

                {imageUrls.length >= 2 && (
                    <div className='file-btn-wrapper'>
                        <div>
                            <input type='file'
                                value={thirdImageUpload ? null : ''}
                                onChange={(e) => handleThirdFileChange(e)} />
                            <label className="custom-file-button">Choose Final</label>
                            <span>{thirdFileName}</span>
                        </div>

                        {thirdImageUpload != null && (
                            <button className='upload-btn' onClick={() => handleImageUpload('third', thirdImageUpload)}>
                                {imageUploadStatus.third ? 'Uploading now...' : (imageUrls.length <= 2 ? 'Upload' : 'Change')}
                            </button>
                        )}
                    </div>
                )}

                <div className="final-form-btns">
                    <button type="button" onClick={() => handlePreviewBtn()}>Preview</button>
                    <button
                        className='post-btn'
                        type="submit"
                        onClick={(e) => handleSaleSubmit(e)}
                        disabled={!isLoggedIn}
                    >
                        Post
                    </button>
                </div>

            </section>

            {showPreview && (
                <>
                    <Preview
                        type={type}
                        price={formatPrice(price)}
                        location={location}
                        description={description}
                        phone={phone}
                        whatsapp={whatsapp}
                        facebook={facebook}
                        zalo={zalo}
                        website={website}
                        address={address}
                        model={model}
                        featureImage={featureImageUpload}
                        secondImage={secondImageUpload}
                        thirdImage={thirdImageUpload}
                        setShowPreview={setShowPreview}
                    />
                </>
            )}

            {submitSuccess && (
                <div className="submit-success-modal">
                    <h2>Success!</h2>
                    <p>Your {model} has been posted</p>
                    <button onClick={() => handlePostAgain()} className="post-again-btn">Make Another Post</button>
                    <Link to="/list" className="go-to-list-btn">See it Live</Link>
                </div>
            )}
        </>
    );
};

export default SellBikeForm;
