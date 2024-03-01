import { useState, useRef, useEffect } from 'react';
import ReactCrop, {
    centerCrop,
    makeAspectCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import { canvasPreview } from './canvasPreview';
import { useDebounceEffect } from './useDebounceEffect';
import { useAppContext } from '../../context';
import '../../sass/cropper.css'

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    );
}

export default function Cropper() {
    const [imgSrc, setImgSrc] = useState('');
    const previewCanvasRef = useRef(null);
    const imgRef = useRef(null);
    const hiddenAnchorRef = useRef(null);
    const blobUrlRef = useRef('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState(16 / 9);

    const { featureImageUpload, setFeatureImageUpload,
        secondImageUpload, setSecondImageUpload,
        thirdImageUpload, setThirdImageUpload, featureRentalImageUpload, setFeatureRentalImageUpload,
        secondRentalImageUpload, setSecondRentalImageUpload,
        thirdRentalImageUpload, setThirdRentalImageUpload, cropper,
        setCropper, chosenImage, setChosenImage } = useAppContext()

    const [why, setWhy] = useState(false)

    useEffect(() => {
        if (chosenImage instanceof File) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result || ''));
            reader.readAsDataURL(chosenImage);
        } else {
            setImgSrc(chosenImage);
        }
    }, [chosenImage]);

    // function onSelectFile(e) {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setCrop(undefined);
    //         const reader = new FileReader();
    //         reader.addEventListener('load', () => setImgSrc(reader.result || ''));
    //         reader.readAsDataURL(e.target.files[0]);
    //         console.log('imgSrc', imgSrc);
    //     }
    // }

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    async function onDownloadCropClick() {
        const image = imgRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist');
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const targetWidth = 400;
        const targetHeight = 225;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;

        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('No 2d context');
        }

        ctx.drawImage(
            previewCanvas,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            targetWidth,
            targetHeight
        );

        const blob = await new Promise((resolve) => {
            tempCanvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
        }
        blobUrlRef.current = URL.createObjectURL(blob);

        if (hiddenAnchorRef.current) {
            hiddenAnchorRef.current.href = blobUrlRef.current;

            // Instead of triggering download, set the cropped image to the global state
            chooseStateUpload(blobUrlRef.current)
        }
    }

    function chooseStateUpload(blobUrl) {
        if (featureImageUpload === 'current') {
            setFeatureImageUpload(blobUrl);
        } else if (secondImageUpload === 'current') {
            setSecondImageUpload(blobUrl);
        } else if (thirdImageUpload === 'current') {
            setThirdImageUpload(blobUrl);
        } else if (featureRentalImageUpload === 'current') {
            setFeatureRentalImageUpload(blobUrl);
        } else if (secondRentalImageUpload === 'current') {
            setSecondRentalImageUpload(blobUrl);
        } else if (thirdRentalImageUpload === 'current') {
            setThirdRentalImageUpload(blobUrl);
        }
        setCropper(false);
    }

    useDebounceEffect(
        async () => {
            if (
                completedCrop?.width &&
                completedCrop?.height &&
                imgRef.current &&
                previewCanvasRef.current
            ) {
                canvasPreview(
                    imgRef.current,
                    previewCanvasRef.current,
                    completedCrop,
                    scale,
                    rotate
                );
            }
        },
        100,
        [completedCrop, scale, rotate]
    );

    return (
        <div className="cropper">
            <div className="Crop-Controls">
                {/* <input id='file-input' type="file" accept="image/*" onChange={onSelectFile} /> */}

                <h2>Edit Image <span onClick={() => setWhy(true)}>why?</span></h2>
                <div>
                    <label htmlFor="scale-input">Scale</label>
                    <input
                        id="scale-input"
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={Math.log10(scale)}
                        disabled={!imgSrc}
                        onChange={(e) => setScale(10 ** Number(e.target.value))}
                    />
                </div>


                <div>
                    <label htmlFor="rotate-input">Rotate</label>
                    <input
                        id="rotate-input"
                        type="range"
                        value={rotate}
                        disabled={!imgSrc}
                        onChange={(e) =>
                            setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
                        }
                    />
                </div>

                {why && (
                    <>
                        <div className="pointer img-edit-pointer"></div>
                        <div className="tooltip img edit-tooltip">

                            <svg onClick={() => setWhy(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M685.4 354.8c0-4.4-3.6-8-8-8l-66 .3L512 465.6l-99.3-118.4-66.1-.3c-4.4 0-8 3.5-8 8 0 1.9.7 3.7 1.9 5.2l130.1 155L340.5 670a8.32 8.32 0 0 0-1.9 5.2c0 4.4 3.6 8 8 8l66.1-.3L512 564.4l99.3 118.4 66 .3c4.4 0 8-3.5 8-8 0-1.9-.7-3.7-1.9-5.2L553.5 515l130.1-155c1.2-1.4 1.8-3.3 1.8-5.2z"></path><path d="M512 65C264.6 65 64 265.6 64 513s200.6 448 448 448 448-200.6 448-448S759.4 65 512 65zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path></svg>
                            <p>In order to provide</p>
                            <p> a clean interface for all users each image must be stored with a uniform height, width & aspect ratio...</p>
                            <a href="https://www.calm.com/" target="_blank" rel="noopener noreferrer">Complain here</a>
                        </div>
                    </>
                )}
            </div>

            {imgSrc && (
                <ReactCrop
                    className='react-crop'
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            {completedCrop && (
                <>
                    <div>
                        <canvas
                            ref={previewCanvasRef}
                            style={{
                                border: '1px solid black',
                                objectFit: 'contain',
                                width: completedCrop.width,
                                height: completedCrop.height,
                            }}
                        />
                    </div>
                    <div>
                        <button onClick={onDownloadCropClick}>Save</button>
                        <a
                            href="#hidden"
                            ref={hiddenAnchorRef}
                            download
                            style={{
                                position: 'absolute',
                                top: '-200vh',
                                visibility: 'hidden',
                            }}
                        >
                            Hidden download
                        </a>
                    </div>
                </>
            )}
        </div>
    );
}
