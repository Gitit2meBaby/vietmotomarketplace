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
import '../sass/postBikeForm.css'

const SellBikeForm = () => {
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

    const [imageUrls, setImageUrls] = useState([]);

    const [showPreview, setShowPreview] = useState(false)

    const [priceError, setPriceError] = useState(false)
    const [currencyError, setCurrencyError] = useState(false)
    const [modelError, setModelError] = useState(false)
    const [imageError, setImageError] = useState(false)

    const [showTooltip, setShowTootltip] = useState(false)

    const [selectedFileName, setSelectedFileName] = useState('No file chosen');
    const [secondFileName, setSecondFileName] = useState('No file chosen')
    const [thirdFileName, setThirdFileName] = useState('No file chosen')

    const handlePriceChange = (e) => {
        setPrice(e.target.value)
        setPriceError(false)
        setCurrencyError(false)
    }

    const handleModelChange = (e) => {
        setModel(e.target.value)
        setModelError(false)
    }

    const handleSaleSubmit = async (e) => {
        e.preventDefault();

        checkPriceField();
        checkModelField();
        checkImageField();

        if (!checkPriceField() || !checkModelField()) {
            return;
        }

        if (!featureImageUpload) {
            console.error('Feature image is not selected.');
            return;
        }

        const sellRef = collection(db, 'listings');

        try {
            const filteredImageUrls = imageUrls.filter(url => url);

            await addDoc(sellRef, {
                type: type,
                price: price,
                model: model,
                location: location,
                seller: seller,
                transaction: 'sell',
                description: description,
                contact: contact,
                featureImage: filteredImageUrls[0],
                secondImage: filteredImageUrls[1] !== undefined ? filteredImageUrls[1] : null,
                thirdImage: filteredImageUrls[2] !== undefined ? filteredImageUrls[2] : null,
                userId: auth?.currentUser?.uid,
                createdAt: serverTimestamp(),
            });

            // Clear form fields after successful submission
            setType('automatic');
            setPrice('');
            setLocation('');
            setSeller('');
            setModel('')
            setDescription('')
            setContact('')
            setImageUrls([])
            setFeatureImageUpload(null);
            setSecondImageUpload(null);
            setThirdImageUpload(null);

        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const checkPriceField = () => {
        if (price === '') {
            setPriceError(true);
            return false;
        } else if (price > 1 && price < 100000) {
            setCurrencyError(true);
            return false;
        }
        return true;
    };

    const checkModelField = () => {
        if (model === '') {
            setModelError(true);
            return false;
        }
        return true;
    };

    const handleFeatureFileChange = (e) => {
        const fileName = e.target.files[0]?.name || 'No file chosen';
        setSelectedFileName(fileName);
        setFeatureImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)
    };

    const handleSecondFileChange = (e) => {
        const secondFileName = e.target.files[0]?.name || 'No file chosen';
        setSecondFileName(secondFileName);
        setSecondImageUpload(e.target.files[0])
    };

    const handleThirdFileChange = (e) => {
        const thirdFileName = e.target.files[0]?.name || 'No file chosen';
        setThirdFileName(thirdFileName);
        setThirdImageUpload(e.target.files[0])
    };

    const checkImageField = () => {
        if (featureImageUpload == undefined || featureImageUpload == null) {
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

            const imageName = `${image.name}_${v4()}`;
            const userFolderRef = ref(storage, `sellImages/${auth?.currentUser?.uid}`);

            // Log the upload result
            const uploadResult = await uploadBytes(ref(userFolderRef, imageName), image);
            console.log('Upload result:', uploadResult);

            // Fetch the updated file list and update the state
            try {
                const response = await listAll(userFolderRef);

                const urls = await Promise.all(
                    response.items.map(async (itemRef) => getDownloadURL(itemRef))
                );

                // Use the previous state to ensure correct updates
                setImageUrls(prevUrls => [...prevUrls, ...urls]);
                setImageError(false);
                console.log('Image URLs after listing files:', urls);

            } catch (error) {
                console.error('Error listing files:', error);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    console.log(showTooltip);

    return (
        <>
            <section className='sale-section'>
                <form onSubmit={handleSaleSubmit}>
                    <div className="input-wrapper">
                        <label className='main-label'>Make and Model
                            <input
                                name='model'
                                type="text"
                                placeholder="ie Honda Wave 2010"
                                value={model}
                                onChange={(e) => handleModelChange(e)}
                            />
                        </label>

                        {modelError && (
                            <div className="form-error">
                                <p>Must include a model!</p>
                            </div>
                        )}
                    </div>

                    <div className="input-wrapper">
                        <label className='main-label'>Price
                            <div>
                                <input
                                    name='price'
                                    type="number"
                                    placeholder="VND"
                                    value={price}
                                    onChange={(e) => handlePriceChange(e)}
                                />
                                <svg onClick={() => setShowTootltip(true)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height=".8em" width=".8em" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 16A8 8 0 108 0a8 8 0 000 16zm.93-9.412l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM8 5.5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>

                                {showTooltip && (
                                    <div className="tooltip">
                                        <div>
                                            <svg onClick={() => setShowTootltip(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>
                                            <p>Price must be in Vietnamese Dong.</p>
                                        </div>
                                        <a href='https://www.xe.com/currencyconverter/'>Need help converting?</a>
                                    </div>
                                )}
                            </div>
                        </label>

                        {(priceError || currencyError) && (
                            <div className="form-error">
                                <p>{priceError ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                            </div>
                        )}
                    </div>

                    <div className="input-wrapper dropdown-wrapper">
                        <label className='main-label' htmlFor="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onClick={() => setShowTootltip(false)}
                        >Location
                            <select name="location" id="location">
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

                    <div className='radio-wrapper'>
                        <label className='main-label'>Transmission</label>
                        <div>
                            <label>
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
                            <label>
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
                            <label>
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

                    <div className="radio-wrapper">
                        <label className='main-label'>Seller</label>
                        <div>
                            <label>
                                <input
                                    name='seller'
                                    type="radio"
                                    value="private"
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
                                    onChange={(e) => setSeller(e.target.value)}
                                />
                                Business
                            </label>
                        </div>
                    </div>

                    <div className="input-wrapper">
                        <label className='main-label' htmlFor='description'
                            onChange={(e) => setDescription(e.target.value)}>
                            Description
                            <textarea name="description" id="description" cols="30" rows="10"
                                placeholder=''></textarea>
                        </label>
                    </div>

                    <div className="input-wrapper">
                        <label className='main-label' htmlFor='contact'
                            onChange={(e) => setContact(e.target.value)}>
                            Contact
                            <textarea name="contact" id="contact" cols="30" rows="5"
                                placeholder='Preffered contact method...'></textarea>
                        </label>
                    </div>
                </form>

                <div className='file-btn-wrapper'>
                    <label className="main-label">Images</label>

                    <div>
                        <input type='file' onChange={(e) => handleFeatureFileChange(e)} />
                        <label className="custom-file-button">Choose Feature</label>
                        <span>{selectedFileName}</span>
                    </div>

                    <button className='upload-btn' onClick={() => handleImageUpload(featureImageUpload)}>
                        {imageUrls.length === 0 ? 'Upload' : 'Change'}</button>

                    {imageError && (
                        <div className="form-error">
                            <p>Must include an Image</p>
                        </div>
                    )}
                </div>

                {featureImageUpload != null && (
                    <div className='file-btn-wrapper'>
                        <div>
                            <input type='file' onChange={(e) => handleSecondFileChange(e)} />
                            <label className="custom-file-button">Another..</label>
                            <span>{secondFileName}</span>
                        </div>

                        <button className='upload-btn' onClick={() => handleImageUpload(secondImageUpload)}>
                            {imageUrls.length === 1 ? 'Change' : 'Upload'}
                        </button>

                    </div>
                )}

                {secondImageUpload != null && (
                    <div className='file-btn-wrapper'>
                        <div>
                            <input type='file' onChange={(e) => handleThirdFileChange(e)} />
                            <label className="custom-file-button">Choose Final</label>
                            <span>{thirdFileName}</span>
                        </div>

                        <button className='upload-btn' onClick={() => handleImageUpload(thirdImageUpload)}>
                            {imageUrls.length === 2 ? 'Change' : 'Upload'}</button>
                    </div>
                )}

                <div className="final-form-btns">
                    <button type="button" onClick={() => setShowPreview(true)}>Preview</button>
                    <button className='post-btn' type="submit" onClick={handleSaleSubmit}>Post</button>
                </div>

                {showPreview && (
                    <Preview
                        type={type}
                        price={price}
                        location={location}
                        seller={seller}
                        description={description}
                        contact={contact}
                        model={model}
                        featureImage={featureImageUpload}
                        secondImage={secondImageUpload}
                        thirdImage={thirdImageUpload}
                        setShowPreview={setShowPreview}
                    />
                )}
            </section>
        </>
    );
};

export default SellBikeForm;
