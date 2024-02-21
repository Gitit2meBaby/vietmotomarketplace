import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context';


const Authentication = () => {
    const { isLoggedIn, setIsLoggedIn } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
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
    const handleClose = () => setIsOpen(false);

    const storeUserInLocalStorage = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
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
            setIsLoggedIn(true)
        } catch (err) {
            console.error(err);
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
        <div>
            {currentUser && (
                <div>
                    <h4>{currentUser.displayName || currentUser.email}</h4>
                    {currentUser.photoURL && <img src={currentUser.photoURL} alt={currentUser.email}></img>}
                </div>
            )}

            {currentUser == null && (
                <button onClick={handleOpen}>Sign In</button>
            )}

            {isOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit}>
                            <h2>Sign In</h2>

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
                    </div>
                    <button onClick={() => signInWithGoogle()}>Sign in with Google</button>
                    <button onClick={handleClose}>Close</button>
                </div>
            )}

            {currentUser && (
                <button onClick={() => logout()}>Log Out</button>
            )}
        </div>
    );
};

export default Authentication;