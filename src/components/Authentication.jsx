import { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

const Authentication = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password)
        } catch (err) {
            console.error(err)
        }
        handleClose();
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (err) {
            console.error(err)
        }
        handleClose();
    };

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (err) {
            console.error(err)
        }
        handleClose();
    };

    return (
        <div>
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