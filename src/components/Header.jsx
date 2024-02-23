import { useState } from 'react'
import Authentication from './Authentication'
import { useAppContext } from '../context';
import { Link } from 'react-router-dom'
import "../sass/header.css"

const Header = () => {
    const [navOpen, setNavOpen] = useState(false)
    const { isLoggedIn, setIsLoggedIn } = useAppContext();
    const [activeLink, setActiveLink] = useState(null);

    const navStyles = {
        opacity: navOpen ? 1 : 0,
        transform: navOpen ? 'translateX(0)' : 'translateX(-100%)',
    };

    const navItemStyles = {
        opacity: navOpen ? 1 : 0,
        transform: navOpen ? 'translateY(0)' : 'translateY(-80%)',
        transitionProperty: 'opacity, transform',
        transitionDuration: '.3s, .5s',
        transitionTimingFunction: 'ease-in, ease-in',
    };

    const burgerMenuStyles = {
        transform: navOpen ? 'translateX(0) rotate(720deg)' : 'translateX(-500%) rotate(0)',
        transitionProperty: 'transform',
        transitionDuration: '1s',
        transitionTimingFunction: 'ease-in',
    };

    const handleLinkClick = (e) => {
        setNavOpen(false)
    }

    return (
        <header>
            <div className="menu-toggle">
                <svg onClick={() => setNavOpen(true)} stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" height="3em" width="3em" xmlns="http://www.w3.org/2000/svg"><path d="M19 17h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zM19 10h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zM19 3h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2z"></path></svg>
            </div>


            <Authentication />

            <nav style={navStyles}>
                <svg style={burgerMenuStyles} onClick={() => setNavOpen(false)} xmlns="http://www.w3.org/2000/svg" width="50" zoomAndPan="magnify" viewBox="0 0 60 60" height="50" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="08fb594ddf"><path d="M 0 1 L 60 1 L 60 59.699219 L 0 59.699219 Z M 0 1 " clipRule="nonzero" /></clipPath></defs><g clipPath="url(#08fb594ddf)"><path fill="#000000" d="M 3.460938 57.113281 C 5.183594 58.835938 7.4375 59.699219 9.695312 59.699219 C 11.949219 59.699219 14.203125 58.835938 15.921875 57.113281 L 30 43 L 44.078125 57.113281 C 45.796875 58.835938 48.050781 59.699219 50.304688 59.699219 C 52.5625 59.699219 54.816406 58.835938 56.539062 57.113281 C 59.976562 53.664062 59.976562 48.070312 56.539062 44.621094 L 42.460938 30.507812 L 56.539062 16.394531 C 59.976562 12.945312 59.976562 7.351562 56.539062 3.902344 C 53.097656 0.453125 47.515625 0.453125 44.078125 3.902344 L 30 18.015625 L 15.921875 3.902344 C 12.484375 0.453125 6.902344 0.453125 3.460938 3.902344 C 0.0234375 7.351562 0.0234375 12.945312 3.460938 16.394531 L 17.539062 30.507812 L 3.460938 44.621094 C 0.0234375 48.070312 0.0234375 53.664062 3.460938 57.113281 " fillOpacity="1" fillRule="nonzero" /></g></svg>

                <Link onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '0.2s' }} to="/">Home</Link>
                <Link onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '0.4s' }} to="/list">Buy</Link>
                <Link onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '0.6s' }} to="/post">Sell</Link>
                <Link onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '0.8s' }} to="/list">Rent</Link>
                <Link onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '1s' }} to="/guides">Guides</Link>

                {isLoggedIn ? (
                    <>
                        <div className="msg-nav-item"
                            onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '1.2s' }} >
                            <a href="">Messages</a>
                            <div className="msg-counter">3</div>
                        </div>

                        <a onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '1.4s' }} href="">Log Out</a>
                    </>
                ) : (
                    <a onClick={(e) => handleLinkClick(e)} style={{ ...navItemStyles, transitionDelay: '1.2s' }} href="">Log In</a>
                )}
            </nav>
        </header >
    )
}

export default Header