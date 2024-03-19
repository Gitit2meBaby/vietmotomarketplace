import { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import '../sass/sorter.css';

const Sorter = ({ fetchListings, setListings }) => {
    const { buyOrRent, setBuyOrRent, orderType, setOrderType, location, setLocation, direction, setDirection } = useAppContext();

    const [newSearch, setNewSearch] = useState(false);

    useEffect(() => {
        if (newSearch) {
            fetchListings(null)
        }
    }, [newSearch]);

    // takes in value(asc or desc) and option(price or createdAt) from dropdown
    const handleSortChange = (value, option) => {
        if (option === "price") {
            handlePriceOrder(value);
            setOrderType('price')
        } else {
            handleTimeOrder(value);
            setOrderType('createdAt')
        }
    };

    const handlePriceOrder = (value) => {
        setDirection(value)
        setListings([])
        setNewSearch(!newSearch)
    }

    const handleTimeOrder = (value) => {
        setDirection(value)
        setListings([])
        setNewSearch(!newSearch)
    }

    const handleBuyOrRentChange = (type) => {
        setBuyOrRent(type)
        setListings([])
        setNewSearch(!newSearch)
    };

    const handleLocationChange = (value) => {
        setLocation(value)
        setListings([])
        setNewSearch(!newSearch)
    }

    return (
        <section className='sorter'>
            <div className="sort-dropdown-wrapper">
                <label>
                    <select onChange={(e) => handleSortChange(e.target.value, e.target.options[e.target.selectedIndex].getAttribute('data-sort-type'))}
                        aria-label="Sort"
                        name='sort'
                        id='sort'>
                        <option value="">Sort</option>
                        <option value="desc" data-sort-type="createdAt">Time (Newest first)</option>
                        <option value="asc" data-sort-type="createdAt">Time (Oldest first)</option>
                        <option value="asc" data-sort-type="price">Price (Low to High)</option>
                        <option value="desc" data-sort-type="price">Price (High to Low)</option>

                    </select>
                </label>
            </div>

            <button onClick={() => handleBuyOrRentChange('sell')}>Buy</button>
            <button onClick={() => handleBuyOrRentChange('rent')}>Rent</button>

            <div>
                <label htmlFor="location">
                    <select
                        name="location"
                        id="location"
                        value={location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        aria-label='Select location'
                    >
                        <option value="">Location</option>
                        <option value="HCMC">HCMC</option>
                        <option value="Hanoi">Hanoi</option>
                        <option value="Danang">Danang</option>
                        <option value="Dalat">Dalat</option>
                        <option value="Hoi An">Hoi An</option>
                        <option value="Mui Ne">Mui Ne</option>
                        <option value="Nha Trang">Nha Trang</option>
                    </select>
                </label>
            </div>

        </section>
    );
};

export default Sorter;
