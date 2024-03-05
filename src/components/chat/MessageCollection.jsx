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
    const [isNoMessages, setIsNoMessages] = useState(true)

    const scroll = useRef();

    const getRooms = query(
        collection(db, "conversations"),
        where('participantsIds', 'array-contains', currentUser.uid),
        orderBy('lastUpdatedAt', 'desc')
    );


    useEffect(() => {
        const unsubscribe = onSnapshot(getRooms, (querySnapshot) => {
            const rooms = [];
            querySnapshot.forEach((doc) => {
                const roomData = doc.data();

                rooms.push({
                    lastUpdatedAt: roomData.lastUpdatedAt,
                    lastMessage: {
                        message: roomData.lastMessage.message,
                        recipientId: roomData.lastMessage.recipientId,
                        senderId: roomData.lastMessage.senderId,
                        timeStamp: roomData.lastMessage.timeStamp,
                    },
                    participants: {
                        recipientId: roomData.participants.recipientId,
                        recipientName: roomData.participants.recipientName,
                        recipientAvatar: roomData.participants.recipientAvatar,
                        senderId: roomData.participants.senderId,
                        senderName: roomData.participants.senderName,
                        senderAvatar: roomData.participants.senderAvatar,
                    },
                });
            });
            setUserRooms(rooms);

            if (rooms.length === 0) {
                setIsNoMessages(true);
            } else {
                setIsNoMessages(false);
            }
        });

        return unsubscribe;
    }, []);

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
                    <div key={room.id}
                        onClick={() => handleRoomClick(room.participants.senderId)}>
                        <img src={room.participants.senderAvatar} alt="user avatar" />
                        <h2>{room.participants.senderName}</h2>
                        <p>{room.lastMessage.message}</p>
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