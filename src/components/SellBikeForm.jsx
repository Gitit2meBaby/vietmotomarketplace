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
                thirdImage: filteredImageUrls[2],
                userId: filteredImageUrls[2] !== undefined ? filteredImageUrls[2] : null,
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

            console.log('Type:', type);
            console.log('Price:', price);
            console.log('Location:', location);
            console.log('Seller:', seller);
            console.log('Model:', model);
            console.log('Description:', description);
            console.log('Contact:', contact);
            console.log('Image URLs:', imageUrls);
            console.log('Feature Image Upload:', featureImageUpload);
            console.log('Second Image Upload:', secondImageUpload);
            console.log('Third Image Upload:', thirdImageUpload);
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

    return (
        <>
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

                    <label>
                        <input
                            name='model'
                            type="text"
                            placeholder="ie Honda Wave 2010"
                            value={model}
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
                            name='price'
                            type="number"
                            placeholder="in Vietnamese Dong"
                            value={price}
                            onChange={(e) => handlePriceChange(e)}
                        />Price
                    </label>

                    {(priceError || currencyError) && (
                        <div className="form-error">
                            <p>{priceError ? 'Must include a price' : 'Seems too cheap.. are you using VND?'}</p>
                        </div>
                    )}

                    <label htmlFor="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
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

                    <label htmlFor='description'
                        onChange={(e) => setDescription(e.target.value)}>
                        Description
                        <textarea name="description" id="description" cols="30" rows="10"></textarea>
                    </label>

                    <label htmlFor='contact'
                        onChange={(e) => setContact(e.target.value)}>
                        Contact
                        <textarea name="contact" id="contact" cols="30" rows="10"></textarea>
                    </label>
                </form>

                <div>
                    <label>
                        <input type='file' onChange={(e) => setFeatureImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)} />
                    </label>
                    <button onClick={() => handleImageUpload(featureImageUpload)}>
                        {imageUrls.length === 0 ? 'Upload File' : 'Change'}</button>

                    {imageError && (
                        <div className="form-error">
                            <p>Must include an Image</p>
                        </div>
                    )}
                </div>

                {featureImageUpload != null && (
                    <div>
                        <label>
                            <input type='file' onChange={(e) => setSecondImageUpload(e.target.files[0])} />
                        </label>
                        <button onClick={() => handleImageUpload(secondImageUpload)}>
                            {imageUrls.length > 0 ? 'Change' : 'Upload File'}
                        </button>

                    </div>
                )}

                {secondImageUpload != null && (
                    <div>
                        <label>
                            <input type='file' onChange={(e) => setThirdImageUpload(e.target.files.length > 0 ? e.target.files[0] : null)} />
                        </label>
                        <button onClick={() => handleImageUpload(thirdImageUpload)}>
                            {imageUrls.length > 1 ? 'Change' : 'Upload File'}</button>
                    </div>
                )}

                <button type="submit" onClick={handleSaleSubmit}>Post</button>


                <button type="button" onClick={() => setShowPreview(true)}>Preview</button>

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
