import { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, signOut, updateProfile, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import anonAvatar from '../assets/anonAvatar.webp'
import { useAppContext } from '../context';
import '../sass/authentication.css'


const Authentication = () => {
    // global state for recognised user
    const { isLoggedIn, setIsLoggedIn, isAuthOpen, setIsAuthOpen, currentUser, setCurrentUser } = useAppContext();

    const [emailLogIn, setEmailLogIn] = useState(false)

    // stored input values
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('')

    // error states
    const [emptyEmail, setEmptyEmail] = useState(false)
    const [emptyPassword, setEmptyPassword] = useState(false)
    // signup
    const [emptyDisplayName, setEmptyDisplayName] = useState(false)
    const [emailExists, setEmailExists] = useState(false)
    const [emailFormatError, setEmailFormatError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    // login
    const [emailLoginError, setEmailLoginError] = useState(false)
    const [passwordLoginError, setPasswordLoginError] = useState(false)
    // password reset
    const [passwordModal, setPasswordModal] = useState(false)
    const [passwordReset, setPasswordReset] = useState(false)
    const [passwordResetError, setPasswordResetError] = useState(false)

    const [signUpSuccess, setSignUpSuccess] = useState(false)

    // refs for focus after errors
    const emailSignUpRef = useRef(null)
    const passwordSignUpRef = useRef(null)
    const displayNameSignUpRef = useRef(null)
    const emailLoginRef = useRef(null)
    const passwordLoginRef = useRef(null)
    const emailPasswordResetRef = useRef(null)


    // Check local storage for user data
    useEffect(() => {
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            setIsLoggedIn(true)
            console.log('user', user);
        }
    }, []);

    // modal opening
    const handleOpen = () => setIsAuthOpen(true);
    const handleClose = () => {
        setIsAuthOpen(false)
        setEmailLogIn(false)
        // Reset all relevant states when closing the modal
        setEmail('');
        setPassword('');
        setDisplayName('');
        setEmptyEmail(false);
        setEmptyPassword(false);
        setEmailExists(false);
        setEmailFormatError(false);
        setPasswordError(false);
        setEmailLoginError(false);
        setPasswordLoginError(false);
        setPasswordModal(false);
        setPasswordReset(false);
        setPasswordResetError(false);
        setSignUpSuccess(false);
    };

    const storeUserInLocalStorage = (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value)
        setEmailExists(false)
        setEmailLoginError(false)
        setEmailFormatError(false)
        setEmptyEmail(false)
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value)
        setPasswordLoginError(false)
        setEmptyPassword(false)
        setPasswordError(false)
    }

    const handleDisplayNameChange = (e) => {
        setDisplayName(e.target.value)
        setEmptyDisplayName(false)
    }

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email) {
            setEmailLoginError(true);
            emailLoginRef.current.focus();
            return;
        }

        if (!password) {
            setPasswordLoginError(true);
            passwordLoginRef.current.focus();
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                setEmailLoginError(true);
                emailLoginRef.current.focus();
                return;
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setPasswordLoginError(true);
                passwordLoginRef.current.focus();
                return;
            } else {
                console.error(error.message);
            }
        }
        setEmptyEmail(false);
        setPasswordLoginError(false);
        setEmptyPassword(false);
        handleClose();
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);

            if (email === '') {
                setEmptyEmail(true);
                emailSignUpRef.current.focus();
                return;
            } else if (password === '') {
                setEmptyPassword(true);
                passwordSignUpRef.current.focus();
                return;
            } else if (displayName === '') {
                setEmptyDisplayName(true);
                displayNameSignUpRef.current.focus();
                return;
            } else if (methods && methods.length > 0) {
                console.log('User already exists');
                setEmailExists(true);
                emailSignUpRef.current.focus();
                return;
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(user, {
                    displayName: displayName,
                });

                const userData = {
                    displayName: displayName,
                    email: user.email,
                    uid: user.uid,
                };

                await setDoc(doc(db, 'users', user.uid), userData);
                setCurrentUser(user);
                storeUserInLocalStorage(user);
                setIsLoggedIn(true);

                handleSignUpSuccess()
                setEmptyEmail(false);
                setEmptyPassword(false);
                setEmptyDisplayName(false);
                setEmailExists(false);
                setEmailFormatError(false);
                setPasswordError(false);
                handleClose();
            }
        } catch (error) {
            if (error.code === 'auth/invalid-email') {
                setEmailFormatError(true);
                emailSignUpRef.current.focus();
            } else if (error.code === 'auth/weak-password') {
                setPasswordError(true);
                passwordSignUpRef.current.focus();
            } else if (error.code === 'auth/email-already-in-use') {
                setEmailExists(true);
                emailSignUpRef.current.focus();
            } else {
                console.error(error.message);
            }
        }
    };

    const handleSignUpSuccess = () => {
        setSignUpSuccess(true);

        setTimeout(() => {
            setSignUpSuccess(false);
        }, 2000);
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

    const handleForgotPasswordLink = () => {
        setPasswordModal(true)
        setEmailExists(false)
        setPasswordLoginError(false)
        setEmptyEmail(false);
        setPasswordReset(false);
        setPasswordResetError(false);
    }

    // Send password reset email
    const handleForgotPassword = async (email) => {
        setIsAuthOpen(false);

        if (email === '') {
            setEmptyEmail(true);
            emailPasswordResetRef.current.focus();
            return;
        }

        try {
            // Use firebase.auth() to access the authentication methods
            await sendPasswordResetEmail(auth, email);
            setPasswordReset(true);
        } catch (error) {
            console.error(error.message);
            setPasswordResetError(true);
            return;
        }
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
                {currentUser == null && !isAuthOpen && (
                    <button onClick={handleOpen}
                        className='header-signin-btn'>Sign In</button>
                )}

                {currentUser && (
                    <img
                        src={currentUser.photoURL || anonAvatar}
                        alt={currentUser.email}
                        onClick={() => setIsAuthOpen(true)}
                    />
                )}
            </div>


            {isAuthOpen && (
                <div className="sign-in-modal">
                    <svg className='close-modal-btn' onClick={handleClose} stroke="#3d3d3d" fill="#3d3d3d" strokeWidth="0" viewBox="0 0 24 24" height="1.8em" width="1.8em" xmlns="http://www.w3.org/2000/svg"><path d="M16.3956 7.75734C16.7862 8.14786 16.7862 8.78103 16.3956 9.17155L13.4142 12.153L16.0896 14.8284C16.4802 15.2189 16.4802 15.8521 16.0896 16.2426C15.6991 16.6331 15.0659 16.6331 14.6754 16.2426L12 13.5672L9.32458 16.2426C8.93405 16.6331 8.30089 16.6331 7.91036 16.2426C7.51984 15.8521 7.51984 15.2189 7.91036 14.8284L10.5858 12.153L7.60436 9.17155C7.21383 8.78103 7.21383 8.14786 7.60436 7.75734C7.99488 7.36681 8.62805 7.36681 9.01857 7.75734L12 10.7388L14.9814 7.75734C15.372 7.36681 16.0051 7.36681 16.3956 7.75734Z" fill="#3d3d3d"></path><path fillRule="evenodd" clipRule="evenodd" d="M4 1C2.34315 1 1 2.34315 1 4V20C1 21.6569 2.34315 23 4 23H20C21.6569 23 23 21.6569 23 20V4C23 2.34315 21.6569 1 20 1H4ZM20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3Z" fill="#3d3d3d"></path></svg>
                    {!currentUser && (
                        <>
                            <div className="modal-content">

                                {!emailLogIn && (
                                    <>
                                        <h2>Sign Up</h2>
                                        <form onSubmit={(e) => handleSignUp(e)}>

                                            <div className="input-wrapper-signup">
                                                <label htmlFor="email">Email<span className='required-span'> *</span></label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="banhMiBandit@email.com"
                                                    className={(emptyEmail || emailExists || emailFormatError) ? 'error-state' : ''}
                                                    ref={emailSignUpRef}
                                                    onChange={(e) => handleEmailChange(e)}
                                                />

                                                {emailExists && (
                                                    <>
                                                        <div className="pointer auth-email-exists-pointer"></div>
                                                        <div className="form-error auth-email-exists-error">
                                                            <p>Email already exists</p>
                                                            <a href="#"
                                                                onClick={() =>
                                                                    handleForgotPasswordLink()}>Forgot Password?</a>
                                                        </div>
                                                    </>
                                                )}

                                                {emptyEmail && (
                                                    <>
                                                        <div className="pointer auth-email-pointer"></div>
                                                        <div className="form-error auth-email-error">
                                                            <p>Please provide an Email</p>
                                                        </div>
                                                    </>
                                                )}

                                                {emailFormatError && (
                                                    <>
                                                        <div className="pointer auth-email-pointer"></div>
                                                        <div className="form-error auth-email-error">
                                                            <p>Invalid Email</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="input-wrapper-signup">
                                                <label htmlFor="password">Password<span className='required-span'> *</span></label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder='6-12 characters'
                                                    className={(emptyPassword || passwordError) ? 'error-state' : ''}
                                                    ref={passwordSignUpRef}
                                                    onChange={(e) => handlePasswordChange(e)}
                                                />

                                                {emptyPassword && (
                                                    <>
                                                        <div className="pointer auth-password-pointer"></div>
                                                        <div className="form-error auth-password-error">
                                                            <p>Password required</p>
                                                        </div>
                                                    </>
                                                )}

                                                {passwordError && (
                                                    <>
                                                        <div className="pointer auth-password-format-pointer"></div>
                                                        <div className="form-error auth-password-error">
                                                            <p>Must be atleast 6 characters</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="input-wrapper-signup">
                                                <label htmlFor="username">Username<span className='required-span'> *</span></label>
                                                <input type="text"
                                                    name='username'
                                                    placeholder='Crash Bandicoot'
                                                    className={emptyDisplayName ? 'error-state' : ''}
                                                    ref={displayNameSignUpRef}
                                                    onChange={(e) =>
                                                        handleDisplayNameChange(e)}
                                                />

                                                {emptyDisplayName && (
                                                    <>
                                                        <div className="pointer auth-display-name-pointer"></div>
                                                        <div className="form-error auth-display-name-error">
                                                            <p>Please create a Username</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <button className='signup-btn' type="submit">Sign Up</button>
                                        </form>

                                        <div className="have-account-wrapper">
                                            <p>Already Have an Account?</p>
                                            <button
                                                className='have-account-btn'
                                                onClick={() => setEmailLogIn(true)}>Login</button>
                                        </div>
                                    </>
                                )}

                                {emailLogIn && (
                                    <>
                                        <h2>Login</h2>
                                        <form onSubmit={(e) => handleLogin(e)}>

                                            <div className="input-wrapper-signup">
                                                <label htmlFor="email">Email<span className='required-span'> *</span></label>
                                                <input
                                                    type="text"
                                                    name="email"
                                                    placeholder='ie. donkeykong@boxmail.com'
                                                    className={(emptyEmail || emailLoginError) ? 'error-state' : ''}
                                                    ref={emailLoginRef}
                                                    onChange={(e) => handleEmailChange(e)}
                                                />

                                                {emptyEmail && (
                                                    <>
                                                        <div className="pointer email-login-pointer"></div>
                                                        <div className="form-error email-login-error">
                                                            <p>Invalid Email</p>
                                                        </div>
                                                    </>
                                                )}

                                                {emailLoginError && (
                                                    <>
                                                        <div className="pointer email-login-pointer"></div>
                                                        <div className="form-error email-login-error">
                                                            <p>Email not recognised</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="input-wrapper-signup">
                                                <label htmlFor="password">Password<span className='required-span'> *</span></label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    placeholder='******'
                                                    className={(emptyPassword || passwordLoginError) ? 'error-state' : ''}
                                                    ref={passwordLoginRef}
                                                    onChange={(e) => handlePasswordChange(e)}
                                                />

                                                {emptyPassword && (
                                                    <>
                                                        <div className="pointer"></div>
                                                        <div className="form-error">
                                                            <p>Password required</p>
                                                        </div>
                                                    </>
                                                )}

                                                {passwordLoginError && (
                                                    <>
                                                        <div className="pointer incorrect-password-pointer"></div>
                                                        <div className="form-error incorrect-password-error">
                                                            <p>Incorrect Password</p>
                                                            <a href="#"
                                                                onClick={() => handleForgotPasswordLink()}>Forgot Password?</a>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <button className='forgot-pass-btn' type='button'
                                                onClick={() => handleForgotPasswordLink()}>forgot password?</button>

                                            <button className='signup-btn login-btn' type="submit">Login</button>
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
                                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" x="0px" y="0px" viewBox="0 0 48 48" enableBackground="new 0 0 48 48" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
	c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
	c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
	C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                                        Login with Google</button>

                                    <button className='login-social-btns facebook-btn'>
                                        <svg stroke="#fff" fill="#fff" strokeWidth="0" viewBox="0 0 512 512" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path></svg>
                                        Login with Facebook</button>

                                </>
                            )}

                            <div className="fine-print">
                                <a href='#'>Terms & Conditions</a>
                                <a href='#'>Privacy policy</a>
                            </div>
                        </>
                    )}

                    {currentUser && (
                        <>
                            <h2>Log Out?</h2>
                            <button className='logout-btn' onClick={() => logout()}>Confirm</button>
                        </>
                    )}
                </div>
            )
            }

            {passwordModal && (
                <div className="password-reset-modal">
                    <svg className='close-modal-btn' onClick={() => handleClose()} stroke="#3d3d3d" fill="#3d3d3d" strokeWidth="0" viewBox="0 0 24 24" height="1.8em" width="1.8em" xmlns="http://www.w3.org/2000/svg"><path d="M16.3956 7.75734C16.7862 8.14786 16.7862 8.78103 16.3956 9.17155L13.4142 12.153L16.0896 14.8284C16.4802 15.2189 16.4802 15.8521 16.0896 16.2426C15.6991 16.6331 15.0659 16.6331 14.6754 16.2426L12 13.5672L9.32458 16.2426C8.93405 16.6331 8.30089 16.6331 7.91036 16.2426C7.51984 15.8521 7.51984 15.2189 7.91036 14.8284L10.5858 12.153L7.60436 9.17155C7.21383 8.78103 7.21383 8.14786 7.60436 7.75734C7.99488 7.36681 8.62805 7.36681 9.01857 7.75734L12 10.7388L14.9814 7.75734C15.372 7.36681 16.0051 7.36681 16.3956 7.75734Z" fill="#3d3d3d"></path><path fillRule="evenodd" clipRule="evenodd" d="M4 1C2.34315 1 1 2.34315 1 4V20C1 21.6569 2.34315 23 4 23H20C21.6569 23 23 21.6569 23 20V4C23 2.34315 21.6569 1 20 1H4ZM20 3H4C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V4C21 3.44772 20.5523 3 20 3Z" fill="#3d3d3d"></path></svg>

                    {(!passwordReset && !passwordResetError) && (
                        <>
                            <h3>Please enter your email</h3>
                            <div className="input-wrapper-signup">
                                <label htmlFor="email">Email<span className='required-span'> *</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    placeholder={email}
                                    ref={emailPasswordResetRef}
                                    className={emptyEmail ? 'error-state' : ''}
                                    onChange={(e) => handleEmailChange(e)}
                                />

                                {emptyEmail && (
                                    <>
                                        <div className="pointer auth-pass-reset-pointer"></div>
                                        <div className="form-error auth-pass-reset-error">
                                            <p>Please provide an Email</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <p>You should receive a message to update your details.</p>

                            <button onClick={() => handleForgotPassword(email)}>Submit</button>
                        </>
                    )}

                    {passwordReset && (
                        <>
                            <div className="approval-wrapper"
                                style={{ backgroundColor: '#229922' }}>
                                <svg stroke="#fff" fill="#fff" strokeWidth="1" viewBox="0 0 24 24" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg>
                            </div>
                            <h3 style={{ color: '#229922' }}>Success!</h3>
                            <p>An email has been sent to {email}. Please check your inbox to reset your password.</p>
                        </>
                    )}

                    {passwordResetError && (
                        <>
                            <div className="approval-wrapper"
                                style={{ backgroundColor: '#e20000' }}>
                                <svg stroke="#fff" fill="#fff" strokeWidth="1" viewBox="0 0 24 24" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#fff" strokeWidth="2" d="M3,3 L21,21 M3,21 L21,3"></path></svg>
                            </div>
                            <h4 style={{ color: '#e20000' }}>Whoops!!</h4>
                            <p>Can't find '{email}' in the database, please try an alternative option.</p>
                        </>
                    )}
                </div>
            )}

            {signUpSuccess && (
                <div className="signup-success-modal">
                    <div className="approval-wrapper"
                        style={{ backgroundColor: '#229922' }}>
                        <svg stroke="#fff" fill="#fff" strokeWidth="1" viewBox="0 0 24 24" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg>
                    </div>
                    <h4 style={{ color: '#229922' }}>Success!!!</h4>
                    <p className='success-text'>Signed up as...</p>
                    <h2>{displayName}!</h2>
                </div>
            )}
        </main >
    );
};

export default Authentication;