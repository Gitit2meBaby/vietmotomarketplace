import { useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';


const Authentication = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Check local storage for user data
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
        }
    }, []);

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const storeUserInLocalStorage = (user) => {
        // Store user data in local storage
        localStorage.setItem('user', JSON.stringify(user));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Additional data to store in Firestore
            const userData = {
                displayName: user.displayName,
                email: user.email,
                uid: user.uid,
            };

            await setDoc(doc(db, 'users', user.uid), userData);
            setCurrentUser(user);
            storeUserInLocalStorage(user);
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
        } catch (err) {
            console.error(err);
        }
        handleClose();
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setCurrentUser(null);
            // Remove user data from local storage on logout
            localStorage.removeItem('user');
        } catch (err) {
            console.error(err);
        }
        handleClose();
    };

    return (
        <div>
            {currentUser && (
                <div>
                    <h4>Signed in as {currentUser.displayName || currentUser.email}</h4>
                    {currentUser.photoURL && <img src={currentUser.photoURL} alt={currentUser.email}></img>}
                </div>
            )}

            <button onClick={handleOpen}>Open Sign In</button>
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
                            <button type="submit">Sign In</button>
                        </form>
                    </div>
                    <button onClick={handleClose}>Close</button>
                </div>
            )}

            <button onClick={() => signInWithGoogle()}>Sign in with Google</button>
            <button onClick={() => logout()}>Log Out</button>
        </div>
    );
};

export default Authentication;