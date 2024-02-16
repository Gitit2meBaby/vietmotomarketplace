import { useState, useEffect } from 'react';
import { ref, get, child } from "firebase/database";
import { db } from '../firebase';

const BikeList = () => {
    const [bikes, setBikes] = useState([]);
    const [filter, setFilter] = useState({ sortBy: 'price', sortOrder: 'asc' });

    useEffect(() => {
        // Reference to the "motorbike" collection using the 'db' instance
        const bikesRef = ref(db, 'motorbike');

        // Fetch the data when the component mounts
        fetchData(bikesRef);
    }, []);

    const fetchData = async (bikesRef) => {
        try {
            const snapshot = await get(child(bikesRef));
            const bikeData = [];

            // Iterate through the data and push it into the array
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                bikeData.push(data);
            });

            // Apply sorting based on the filter
            const sortedBikes = sortBikes(bikeData, filter);

            // Update the state with the sorted data
            setBikes(sortedBikes);
        } catch (error) {
            console.error("Error fetching data: ", error);
        }
    };

    const sortBikes = (data, filter) => {
        const { sortBy, sortOrder } = filter;

        // Sort the data based on the selected filter
        const sortedData = [...data].sort((a, b) => {
            if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
            if (a[sortBy] > b[sortBy]) return sortOrder === 'desc' ? 1 : -1;
            return 0;
        });

        return sortedData;
    };

    const handleSortChange = (event) => {
        const { name, value } = event.target;
        setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
    };

    return (
        <div>
            <label>
                Sort by:
                <select name="sortBy" value={filter.sortBy} onChange={handleSortChange}>
                    <option value="price">Price</option>
                    <option value="location">Location</option>
                    {/* Add more sorting options as needed */}
                </select>
            </label>

            <label>
                Sort order:
                <select name="sortOrder" value={filter.sortOrder} onChange={handleSortChange}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </label>

            <ul>
                {bikes.map((bike) => (
                    <li key={bike.timestamp}>
                        <p>Type: {bike.type}</p>
                        <p>Price: {bike.price}</p>
                        <p>Location: {bike.location}</p>
                        <p>Seller: {bike.seller}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BikeList;
