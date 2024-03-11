import { useState } from 'react';
import { useAppContext } from '../context';

const Sorter = () => {
    const { buyOrRent, setBuyOrRent, sortBy, setSortBy, location, setLocation, price, setPrice, transmission, setTransmission, newSearch, setNewSearch } = useAppContext();

    const [showRefine, setShowRefine] = useState(false);

    const handleSortChange = (value) => {
        setSortBy(value);
    };

    const handleBuyOrRentChange = (type) => {
        setBuyOrRent(type);
    };

    const handleLocationChange = (value) => {
        setLocation(value)
    }

    let minPrice = 0;
    let maxPrice = 20000000;

    const handlePriceChange = (min, max) => {
        setPrice({
            minPrice: min,
            maxPrice: max
        })
    }

    const handleTransmissionChange = (e) => {
        setTransmission(e.target.value)
    }

    const handleFilterBtn = () => {
        setNewSearch(true);
        setShowRefine(false)
    }

    return (
        <section className='sorter'>
            <div>
                <div className="sort-dropdown-wrapper">
                    <label>
                        Sort
                        <select value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}>
                            <option value="priceLowHigh">Price (Low to High)</option>
                            <option value="priceHighLow">Price (High to Low)</option>
                            <option value="newest">Time (Newest first)</option>
                            <option value="oldest">Time (Oldest first)</option>
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
                            <option value="hcmc">HCMC</option>
                            <option value="hanoi">Hanoi</option>
                            <option value="danang">Danang</option>
                            <option value="dalat">Dalat</option>
                            <option value="hoi an">Hoi An</option>
                            <option value="mui ne">Mui Ne</option>
                            <option value="nha trang">Nha Trang</option>
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
                                    value={minPrice}
                                    aria-label="Minimum Price"
                                    aria-live="polite"
                                />
                            </label>

                            <label htmlFor="max">
                                Max:
                                <input
                                    type="number"
                                    id="max"
                                    placeholder="e.g., 80000000"
                                    value={maxPrice}
                                    aria-label="Maximum Price"
                                    aria-live="polite"
                                />
                            </label>

                            <button className="set-price-btn" onClick={() => handlePriceChange(minPrice, maxPrice)}>
                                Set
                            </button>
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
