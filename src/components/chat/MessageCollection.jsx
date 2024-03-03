import { useEffect, useState } from 'react';
import { useAppContext } from '../../context';
import { collection, getDocs, doc, query, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ChatBox from './ChatBox';

const Messages = () => {
    const { currentUser, showMessenger, setShowMessenger, showChatBox, setShowChatBox, roomChosen, setRoomChosen } = useAppContext()
    const [userRooms, setUserRooms] = useState([]);
    const [usersList, setUsersList] = useState([])

    // return an array of all the user Ids that have sent a message
    useEffect(() => {
        const fetchUserRooms = async () => {
            if (currentUser) {
                const userDocRef = doc(db, `users/${currentUser.uid}`);
                const roomsCollectionRef = collection(userDocRef, 'rooms');
                const roomsSnapshot = await getDocs(roomsCollectionRef);

                const roomsData = [];
                roomsSnapshot.forEach((roomDoc) => {
                    const roomData = {
                        id: roomDoc.id,
                        ...roomDoc.data(),
                    };
                    roomsData.push(roomData);
                });

                setUserRooms(roomsData);
            }
        };

        fetchUserRooms();
    }, [currentUser]);

    useEffect(() => {
        console.log('userRooms', userRooms);
    }, [userRooms])

    // Find User Data for matching roomIds
    useEffect(() => {
        const fetchUserList = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const usersQuery = query(usersCollection);
                const snapshot = await getDocs(usersQuery);

                const usersData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUsersList(usersData);
            } catch (error) {
                console.error('Error fetching listings:', error);
            }
        };
        fetchUserList();
        filterUserData()
    }, [userRooms]);

    useEffect(() => {
        console.log('usersList', usersList);
    }, [usersList])

    const filterUserData = async () => {
        const matchedUsers = usersList.filter(item => userRooms.includes(item));
        console.log('matchedUsers', matchedUsers);
    }


    const handleRoomClick = (roomId) => {
        setRoomChosen(roomId);
        setShowChatBox(true)
    };

    const handleMessengerClose = () => {
        setShowMessenger(false)
    }

    return (
        <div>
            <button onClick={() => handleMessengerClose()}>Close</button>
            <h1>Your Messages</h1>
            <ul>
                {userRooms.map((room) => (
                    <li key={room.uid}>
                        <button onClick={() => handleRoomClick(room.uid)}>
                            <img src={room.avatar} alt={room.name} />
                            <h2>{room.name}</h2>
                        </button>
                        {/* <p>{room.text[0]}</p> */}
                    </li>
                ))}
            </ul>

            {showChatBox && (
                <ChatBox />
            )}
        </div>
    );
};

export default Messages;
