import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context';
import Message from "./Message";
import SendMessage from "./SendMessage";
import { collection, orderBy, where, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const MessageCollection = () => {
    const { currentUser, showMessenger, setShowMessenger, roomChosen, setRoomChosen } = useAppContext();
    const [showSidebar, setShowSidebar] = useState(true);
    const [userRooms, setUserRooms] = useState([]);
    const [usersList, setUsersList] = useState([]);

    const scroll = useRef();

    const getRooms = query(collection(db, "conversations"), where('participantsIds', 'arrayContains', 'userId'), orderBy('lastUpdatedAt', 'desc'));

    useEffect(() => {
        const unsubscribe = onSnapshot(getRooms, (querySnapshot) => {
            const rooms = [];
            querySnapshot.forEach((doc) => {
                // Ensure your data structure has the required fields
                const roomData = doc.data();
                rooms.push({
                    // Access relevant fields from roomData
                    uid: roomData.uid, // Assuming this exists in your data
                    participants: {
                        avatar: roomData.participants.avatar, // Assuming this exists
                        name: roomData.participants.name // Assuming this exists
                    },
                    // ...other relevant information
                });
            });
            setUserRooms(rooms);
        });

        return unsubscribe; // Clean up the listener when the component unmounts
    }, [getRooms]); // Run the effect only when userId changes

    useEffect(() => {
        console.log('userRooms', userRooms);
    }, [userRooms])


    const handleRoomClick = (roomId) => {
        setRoomChosen(roomId);
        setShowSidebar(false)
    };

    const handleMessengerClose = () => {
        setShowMessenger(false)
    }

    return (
        <main className='messager'>
            <header className='messager-header'>
                <button onClick={() => handleMessengerClose()}>Close</button>
                <h1>Messages</h1>
            </header>

            <aside>
                {userRooms.map((room) => (
                    <div key={room.uid}
                        onClick={() => handleRoomClick(room.uid)}>
                        <img src={room.participants.avatar} alt="user avatar" />
                        <h2>{room.participants.name}</h2>
                        <p>{room.lastMessage}</p>
                    </div>
                ))}
                <svg className={showMessenger ? '' : 'rotate'}
                    stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z"></path><path d="M9.293 7.707L13.586 12 9.293 16.293 10.707 17.707 16.414 12 10.707 6.293z"></path></svg>
            </aside>

            <section className="chatbox">
                {/* <div className="messages-wrapper">
                {messages?.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
                </div> */}
                <span ref={scroll}></span>
                <SendMessage scroll={scroll} />
            </section>
        </main>
    );
};

export default MessageCollection;