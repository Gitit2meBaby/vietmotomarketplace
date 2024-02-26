import { useState, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import '../sass/cropper.css'
import { useAppContext } from '../context';


const CropperWindow = ({ image,
  onClose,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  // const onCropComplete = (croppedArea, croppedAreaPixels) => {
  //   console.log(croppedArea, croppedAreaPixels)
  // }

  const { storedImageUrl, setStoredImageUrl } = useAppContext()
  const { cropper, setCropper } = useAppContext()
  const { imageUrls, setImageUrls } = useAppContext()
  const { storedImageBlob, setStoredImageBlob } = useAppContext()
  const [readyImage, setReadyImage] = useState('')

  useEffect(() => {
    const imageUrl = storedImageUrl ? URL.createObjectURL(storedImageUrl) : null;
    setReadyImage(imageUrl);
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [storedImageUrl]);

  const handleImageEdit = async () => {
    try {
      // Get the cropped image as a blob
      const croppedBlob = await getCroppedImageBlob(readyImage, crop, zoom);

      // Convert blob to webp
      const webpBlob = await convertToWebP(croppedBlob);

      // Set the cropped blob in the global context
      setStoredImageBlob(webpBlob);

      // Close the cropper
      setCropper(false);
    } catch (error) {
      console.error('Error handling image:', error);
    }
  };

  const getCroppedImageBlob = async (imageUrl, crop, zoom) => {
    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const targetWidth = 400;
        const targetHeight = 300;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Convert canvas to blob directly
        canvas.toBlob(resolve, 'image/jpeg');
      };

      image.onerror = (error) => {
        console.error('Image Load Error:', error);
      };
    });
  };


  const convertToWebP = (blob) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const image = new Image();
      image.onload = () => {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        // Convert canvas to blob directly
        canvas.toBlob((webpBlob) => {
          resolve(webpBlob);
          setStoredImageUrl(URL.createObjectURL(webpBlob)); // Move it here
        }, 'image/webp');
      };

      image.src = URL.createObjectURL(blob);
      console.log('image.src', image.src);
    });
  };


  useEffect(() => {
    console.log(storedImageUrl);
  }, [storedImageUrl])


  const cleanImageUrl = (imageUrl) => {
    // Remove 'blob:' from the beginning of the URL
    const cleanedUrl = imageUrl.replace(/^blob:/, '');

    // Surround the URL with double quotes
    setStoredImageUrl(`"${cleanedUrl}"`)
  };

  return (
    <main className='cropper-wrapper'>
      <div className="cropper-modal">
        <div className="crop-container">
          <Cropper
            image={`${readyImage}`}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={(newCrop) => {
              setCrop(newCrop);
              console.log('Updated crop:', newCrop);
            }}
            onZoomChange={(newZoom) => {
              setZoom(newZoom);
              console.log('Updated zoom:', newZoom);
            }}
          />

        </div>
        <div className="controls">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => {
              setZoom(e.target.value)
            }}
            className="zoom-range"
          />
          <button onClick={() => handleImageEdit()}>Done</button>
          <button onClick={() => setCropper(false)}>FUCK OFF!!!!</button>
        </div>
      </div>
    </main>
  )
}

export default CropperWindow