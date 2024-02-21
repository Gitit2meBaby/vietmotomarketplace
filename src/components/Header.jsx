import { useState } from 'react'
import Authentication from './Authentication'
import { useAppContext } from '../context';
import { Link } from 'react-router-dom'
import "../sass/header.css"

const Header = () => {
    const [navOpen, setNavOpen] = useState(false)
    const { isLoggedIn, setIsLoggedIn } = useAppContext();

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



    return (
        <header>
            <svg onClick={() => setNavOpen(true)} stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M19 17h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zM19 10h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2zM19 3h-14c-1.103 0-2 .897-2 2s.897 2 2 2h14c1.103 0 2-.897 2-2s-.897-2-2-2z"></path></svg>

            <Authentication />

            <nav style={navStyles}>
                <svg style={burgerMenuStyles} onClick={() => setNavOpen(false)} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="2.5em" width="2.5em" xmlns="http://www.w3.org/2000/svg"><path d="M354 671h58.9c4.7 0 9.2-2.1 12.3-5.7L512 561.8l86.8 103.5c3 3.6 7.5 5.7 12.3 5.7H670c6.8 0 10.5-7.9 6.1-13.1L553.8 512l122.4-145.9c4.4-5.2.7-13.1-6.1-13.1h-58.9c-4.7 0-9.2 2.1-12.3 5.7L512 462.2l-86.8-103.5c-3-3.6-7.5-5.7-12.3-5.7H354c-6.8 0-10.5 7.9-6.1 13.1L470.2 512 347.9 657.9A7.95 7.95 0 0 0 354 671z"></path><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 728H184V184h656v656z"></path></svg>

                <Link onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '0.2s' }} to="/">Home</Link>
                <Link onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '0.4s' }} to="/list">Buy</Link>
                <Link onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '0.6s' }} to="/post">Sell</Link>
                <Link onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '0.8s' }} to="/list">Rent</Link>
                <Link onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '1s' }} to="/guides">Guides</Link>

                {isLoggedIn ? (
                    <a onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '1.2s' }} href="">Log Out</a>
                ) : (
                    <a onClick={() => setNavOpen(false)} style={{ ...navItemStyles, transitionDelay: '1.2s' }} href="">Log In</a>
                )}
            </nav>
        </header >
    )
}

export default Header