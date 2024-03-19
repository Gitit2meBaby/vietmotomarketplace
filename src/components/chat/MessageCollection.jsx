import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context';
import Message from "./Message";
import SendMessage from "./SendMessage";
import { collection, orderBy, where, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import anonAvatar from '../../assets/anonAvatar.webp'
import '../../sass/messenger.css'


const MessageCollection = () => {
    const { currentUser, showMessenger, setShowMessenger, roomChosen, setRoomChosen } = useAppContext();
    const [showSidebar, setShowSidebar] = useState(true);
    const [userRooms, setUserRooms] = useState([]);
    const [isNoMessages, setIsNoMessages] = useState(true)
    const [showRoom, setShowRoom] = useState(false)
    const [chosenName, setChosenName] = useState('');
    const [chosenAvatar, setChosenAvatar] = useState('');

    const scroll = useRef();
    const messageInputRef = useRef();

    console.log('Message Collection rendered');

    // check for any conversations that contain the current user
    const getRooms = query(
        collection(db, "conversations"),
        where('participantsIds', 'array-contains', currentUser.uid),
        orderBy('lastUpdatedAt', 'asc')
    );

    // populate the userRooms array by fetching all documents in messages folder
    useEffect(() => {
        const unsubscribe = onSnapshot(getRooms, (querySnapshot) => {
            const rooms = [];
            querySnapshot.forEach((doc) => {
                const roomData = doc.data();
                console.log('roomData', roomData);

                const previousTimestamp = roomData.lastMessage.timestamp
                    ? roomData.lastMessage.timestamp.seconds * 1000 + roomData.lastMessage.timestamp.nanoseconds / 1000000
                    : 0;


                rooms.push({
                    docId: roomData.docId,
                    initiatedBy: roomData.initiatedBy,
                    lastUpdatedAt: roomData.lastUpdatedAt,
                    lastMessage: {
                        message: roomData.lastMessage.message,
                        recipientId: roomData.lastMessage.recipientId,
                        senderId: roomData.lastMessage.senderId,
                        timestamp: previousTimestamp,
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

    // create a better UX for time display
    function timeDifference(current, previous) {
        const millisecondsPerMinute = 60 * 1000;
        const millisecondsPerHour = millisecondsPerMinute * 60;
        const millisecondsPerDay = millisecondsPerHour * 24;

        const elapsed = current - previous;

        if (elapsed < millisecondsPerMinute) {
            const secondsAgo = Math.round(elapsed / 1000);
            return `${secondsAgo} ${secondsAgo === 1 ? 'second' : 'seconds'} ago`;
        } else if (elapsed < millisecondsPerHour) {
            const minutesAgo = Math.round(elapsed / millisecondsPerMinute);
            return `${minutesAgo} ${minutesAgo === 1 ? 'm' : 'm'}`;
        } else if (elapsed < millisecondsPerDay) {
            const hoursAgo = Math.round(elapsed / millisecondsPerHour);
            return `${hoursAgo} ${hoursAgo === 1 ? 'hr' : 'hrs'}`;
        } else {
            const daysAgo = Math.round(elapsed / millisecondsPerDay);
            return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'}`;
        }
    }

    const currentTimestamp = new Date().getTime();

    // Enter into a room/user to user chat
    const handleRoomClick = (room, name, avatar) => {
        setRoomChosen({
            docId: room.docId,
            id: room.participants.recipientId,
            name: room.participants.recipientName,
            avatar: room.participants.recipientAvatar,
            initiatedBy: room.initiatedBy
        });
        setChosenName(name);
        setChosenAvatar(avatar);
        setShowSidebar(false);
        setShowRoom(true);
        console.log('roomChosen', roomChosen);
        // messageInputRef.current.scrollIntoView({ behavior: 'smooth' });
        // messageInputRef.current.focus()
    };

    const handleMessengerClose = () => {
        setShowMessenger(false)
        setShowRoom(false)
    }

    // render the correct image depending on who is accessing the conversation
    const displayAvatarChoice = (room) => {
        let displayAvatar;

        if (room.participants.senderAvatar === null) {
            displayAvatar = anonAvatar;
        } else if (room.participants.recipientAvatar === null) {
            displayAvatar = anonAvatar;
        } else if (currentUser.uid === room.participants.recipientId) {
            displayAvatar = room.participants.senderAvatar;
        } else {
            displayAvatar = room.participants.recipientAvatar;
        }

        return displayAvatar;
    };

    // render the correct name depending on who is accessing the conversation
    const displayNameChoice = (room) => {
        let displayName;
        if (currentUser.uid === room.participants.recipientId) {
            displayName = room.participants.senderName;
        } else {
            displayName = room.participants.recipientName;
        }

        return displayName;
    };

    // get first 15 words of message
    const trimMessage = (fullMessage) => {
        const words = fullMessage.split(' ');
        const truncatedMessage = words.slice(0, 6).join(' ');

        return {
            trimmedMessage: truncatedMessage,
        };
    }
    return (
        <main className='messenger'>
            <header className='messager-header'>
                <h1>Messages</h1>
                <button onClick={() => handleMessengerClose()}>
                    <svg width="3em" zoomAndPan="magnify" viewBox="0 0 60 60" height="3em" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="08fb594ddf"><path d="M 0 1 L 60 1 L 60 59.699219 L 0 59.699219 Z M 0 1 " clipRule="nonzero" /></clipPath></defs><g clipPath="url(#08fb594ddf)"><path fill="#000" d="M 3.460938 57.113281 C 5.183594 58.835938 7.4375 59.699219 9.695312 59.699219 C 11.949219 59.699219 14.203125 58.835938 15.921875 57.113281 L 30 43 L 44.078125 57.113281 C 45.796875 58.835938 48.050781 59.699219 50.304688 59.699219 C 52.5625 59.699219 54.816406 58.835938 56.539062 57.113281 C 59.976562 53.664062 59.976562 48.070312 56.539062 44.621094 L 42.460938 30.507812 L 56.539062 16.394531 C 59.976562 12.945312 59.976562 7.351562 56.539062 3.902344 C 53.097656 0.453125 47.515625 0.453125 44.078125 3.902344 L 30 18.015625 L 15.921875 3.902344 C 12.484375 0.453125 6.902344 0.453125 3.460938 3.902344 C 0.0234375 7.351562 0.0234375 12.945312 3.460938 16.394531 L 17.539062 30.507812 L 3.460938 44.621094 C 0.0234375 48.070312 0.0234375 53.664062 3.460938 57.113281 " fillOpacity="1" fillRule="nonzero"></path></g></svg>
                </button>
            </header>

            <aside className='message-sidebar'>
                {userRooms.map((room) => (
                    <div
                        key={uuidv4()}
                        onClick={() => handleRoomClick(room, displayNameChoice(room), displayAvatarChoice(room))}
                        className='sidebar-room'
                    >
                        <img src={displayAvatarChoice(room)} alt="user avatar" />
                        <div className='room-info'>
                            <div>
                                <h2>{displayNameChoice(room)}</h2>
                                <p>{timeDifference(currentTimestamp, room.lastMessage.timestamp)}</p>
                            </div>
                            <p>
                                {trimMessage(room.lastMessage.message).trimmedMessage}
                                {trimMessage(room.lastMessage.message).trimmedMessage !== room.lastMessage.message && '...'}
                            </p>
                        </div>
                    </div>
                ))}
                <svg className={showMessenger ? '' : 'rotate'}
                    stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z"></path><path d="M9.293 7.707L13.586 12 9.293 16.293 10.707 17.707 16.414 12 10.707 6.293z"></path></svg>
            </aside>

            {showRoom && (
                <section className="chatbox">
                    <div className='chatbox-header'>
                        <img src={chosenAvatar} alt="user avatar" />
                        <h2>{chosenName}</h2>
                        <button>
                            <svg stroke="#fff" fill="#fff" strokeWidth="0" viewBox="0 0 24 24" height="2em" width="2em" xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M5.828 7l2.536 2.536L6.95 10.95 2 6l4.95-4.95 1.414 1.414L5.828 5H13a8 8 0 1 1 0 16H4v-2h9a6 6 0 1 0 0-12H5.828z"></path></g></svg></button>
                    </div>
                    <Message />
                    <span ref={scroll}></span>
                    <SendMessage scroll={scroll}
                        ref={messageInputRef} />
                </section>
            )}

        </main>
    );
};

export default MessageCollection;