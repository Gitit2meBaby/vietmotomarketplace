import { useState, useEffect } from 'react';
import { useAppContext } from '../context';

const Sorter = ({ fetchListings, setListings }) => {
    const { buyOrRent, setBuyOrRent, orderType, setOrderType, price, setPrice, location, setLocation, setTransmission, direction, setDirection } = useAppContext();

    const [showRefine, setShowRefine] = useState(false);
    const [newSearch, setNewSearch] = useState(false);

    useEffect(() => {
        fetchListings(null)
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
        // console.log('orderType in Function', option);
        // console.log('direction in Function', value);
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
    }

    const handleMinPriceChange = (e) => {
        setPrice({
            ...price,
            minPrice: e.target.value
        })
    }

    const handleMaxPriceChange = (e) => {
        setPrice({
            ...price,
            maxPrice: e.target.value
        })
    }

    const handleTransmissionChange = (e) => {
        setTransmission(e.target.value)
    }

    const handleFilterBtn = () => {
        setShowRefine(false)
        setListings([])
        setNewSearch(!newSearch)
    }

    return (
        <section className='sorter'>
            <div>
                <div className="sort-dropdown-wrapper">
                    <label>
                        Sort
                        <select onChange={(e) => handleSortChange(e.target.value, e.target.options[e.target.selectedIndex].getAttribute('data-sort-type'))}>

                            <option value="asc" data-sort-type="price">Price (Low to High)</option>
                            <option value="desc" data-sort-type="price">Price (High to Low)</option>
                            <option value="desc" data-sort-type="createdAt">Time (Newest first)</option>
                            <option value="asc" data-sort-type="createdAt">Time (Oldest first)</option>
                        </select>
                    </label>
                </div>

                <div>
                    <button onClick={() => handleBuyOrRentChange('sell')}>Buy</button>
                    <button onClick={() => handleBuyOrRentChange('rent')}>Rent</button>
                </div>

                <button onClick={() => setShowRefine(true)} className="refine-btn">Refine</button>
            </div>

            {showRefine && (
                <aside className="refine-sidebar">
                    <div>
                        <label htmlFor="location">Location</label>
                        <select
                            name="location"
                            id="location"
                            value={location}
                            onChange={(e) => handleLocationChange(e.target.value)}
                        >
                            <option value="HCMC">HCMC</option>
                            <option value="Hanoi">Hanoi</option>
                            <option value="Danang">Danang</option>
                            <option value="Dalat">Dalat</option>
                            <option value="Hoi An">Hoi An</option>
                            <option value="Mui Ne">Mui Ne</option>
                            <option value="Nha Trang">Nha Trang</option>
                        </select>
                    </div>

                    {(buyOrRent === 'sell') && (
                        <div>
                            <label htmlFor="min">
                                Min:
                                <input
                                    type="number"
                                    id="min"
                                    placeholder="e.g., 2000000"
                                    value={price.minPrice}
                                    aria-label="Minimum Price"
                                    aria-live="polite"
                                    onChange={(e) => handleMinPriceChange(e)}
                                />
                            </label>

                            <label htmlFor="max">
                                Max:
                                <input
                                    type="number"
                                    id="max"
                                    placeholder="e.g., 80000000"
                                    value={price.maxPrice}
                                    aria-label="Maximum Price"
                                    aria-live="polite"
                                    onChange={(e) => handleMaxPriceChange(e)}
                                />
                            </label>
                        </div>
                    )}


                    <div>
                        <fieldset>
                            <legend>Transmission</legend>

                            <div>
                                <input
                                    type="checkbox"
                                    id="automatic"
                                    name="transmission"
                                    value="automatic"
                                    onChange={(e) => handleTransmissionChange(e)}
                                />
                                <label htmlFor="automatic">Automatic</label>
                            </div>

                            <div>
                                <input
                                    type="checkbox"
                                    id="semiAuto"
                                    name="transmission"
                                    value="semi-auto"
                                    onChange={(e) => handleTransmissionChange(e)}
                                />
                                <label htmlFor="semiAuto">Semi-Auto</label>
                            </div>

                            <div>
                                <input
                                    type="checkbox"
                                    id="manual"
                                    name="transmission"
                                    value="manual"
                                    onChange={(e) => handleTransmissionChange(e)}
                                />
                                <label htmlFor="manual">Manual</label>
                            </div>
                        </fieldset>
                    </div>

                    <button onClick={() => handleFilterBtn()} className="set-filter-btn">Filter</button>

                </aside>
            )}
        </section>
    );
};

export default Sorter;
