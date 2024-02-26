import React from 'react'
import CropperWindow from './CropperWindow'
import { useAppContext } from '../context';


const Home = () => {
    const { storedImageUrls, setStoredImageUrls } = useAppContext()

    return (
        <>
            <div>Home</div>
        </>
    )
}

export default Home