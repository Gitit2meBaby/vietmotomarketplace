import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import anonAvatar from '../assets/anonAvatar.webp'
import { useAppContext } from '../context';
import '../sass/authentication.css'


const Authentication = () => {
    const { isLoggedIn, setIsLoggedIn } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const [emailLogIn, setEmailLogIn] = useState(false)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [displayName, setDisplayName] = useState('')

    useEffect(() => {
        // Check local storage for user data
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsLoggedIn(true)
        }
    }, []);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => {
        setIsOpen(false)
        setEmailLogIn(false)
    };

    const storeUserInLocalStorage = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    };

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // User signed in successfully
        } catch (error) {
            // Handle sign-in errors
            console.error(error.message);
        }
        handleClose();
    };

    const handleSignUp = async () => {
        try {
            // Check if the user with the provided email already exists
            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (methods && methods.length > 0) {
                // User already exists, handle accordingly
                console.log('User already exists');
            } else {
                // User does not exist, proceed with sign-up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Set the display name using the updateProfile method
                await updateProfile(user, {
                    displayName: displayName,
                });

                // Additional data to store in Firestore
                const userData = {
                    displayName: displayName,
                    email: user.email,
                    uid: user.uid,
                };

                await setDoc(doc(db, 'users', user.uid), userData);
                setCurrentUser(user);
                storeUserInLocalStorage(user);
                setIsLoggedIn(true);
            }
        } catch (err) {
            // Handle sign-up errors
            console.error(err.message);
        }
        handleClose();
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Additional data to store in Firestore
            const userData = {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid,
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            setCurrentUser(user);
            storeUserInLocalStorage(user);
            setIsLoggedIn(true)
        } catch (err) {
            console.error(err);
        }
        handleClose();
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            localStorage.removeItem('user');
            setIsLoggedIn(false)
        } catch (err) {
            console.error(err);
        }
        handleClose();
    };

    return (
        <main className="auth">
            <div>
                {currentUser == null && !isOpen && (
                    <button onClick={handleOpen}>Sign In</button>
                )}

                {currentUser && (
                    <img
                        src={currentUser.photoURL || anonAvatar}
                        alt={currentUser.email}
                        onClick={() => setIsOpen(true)}
                    />
                )}
            </div>


            {isOpen && (
                <div className="sign-in-modal">
                    {!currentUser && (
                        <>
                            <div className="modal-content">

                                {!emailLogIn && (
                                    <>
                                        <h2>Sign Up</h2>
                                        <form onSubmit={handleSignUp}>

                                            <label htmlFor="email">Email:</label>
                                            <input
                                                type="text"
                                                name="email"
                                                onChange={(e) => setEmail(e.target.value)}
                                            />

                                            <label htmlFor="password">Password:</label>
                                            <input
                                                type="password"
                                                name="password"
                                                onChange={(e) => setPassword(e.target.value)}
                                            />

                                            <label htmlFor="username">Username</label>
                                            <input type="text"
                                                name='username'
                                                onChange={(e) => setDisplayName(e.target.value)}
                                            />

                                            <button type="submit">Sign In</button>
                                        </form>

                                        <p>Already Have an Account?</p> <button onClick={() => setEmailLogIn(true)}>Login</button>
                                    </>
                                )}

                                {emailLogIn && (
                                    <>
                                        <h2>Login</h2>
                                        <form onSubmit={handleSignIn}>
                                            <label htmlFor="email">Email:</label>
                                            <input
                                                type="text"
                                                name="email"
                                                onChange={(e) => setEmail(e.target.value)}
                                            />

                                            <label htmlFor="password">Password:</label>
                                            <input
                                                type="password"
                                                name="password"
                                                onChange={(e) => setPassword(e.target.value)}
                                            />

                                            <button type="submit">Sign In</button>
                                        </form>
                                    </>
                                )}
                            </div>

                            {!emailLogIn && (
                                <>
                                    <div className="signup-dividers">
                                        <div className="or-divider"></div>
                                        <p>Or</p>
                                        <div className="or-divider"></div>
                                    </div>

                                    <button className='login-social-btns' onClick={() => signInWithGoogle()}>
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                                        Login with Google</button>

                                    <button className='login-social-btns facebook-btn'>
                                        <svg stroke="#fff" fill="#fff" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
                                        Login with Facebook</button>

                                </>
                            )}
                        </>
                    )}
                    {currentUser && (
                        <button onClick={() => logout()}>Log Out</button>
                    )}

                    <button onClick={handleClose}>Close</button>

                </div>
            )}

        </main>
    );
};

export default Authentication;