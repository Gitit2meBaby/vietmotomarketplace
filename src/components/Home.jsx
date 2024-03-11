import React from 'react'
import { useAppContext } from '../context';


const Home = () => {
    const { currentUser } = useAppContext()
    // console.log('currentUser', currentUser);

    console.log('Home rendered');
    return (
        <>
            <div>Home</div>
        </>
    )
}

export default Home