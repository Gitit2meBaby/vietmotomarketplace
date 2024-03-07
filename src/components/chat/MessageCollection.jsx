import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../../context';
import Message from "./Message";
import SendMessage from "./SendMessage";
import { collection, orderBy, where, query, onSnapshot, serverTimestamp, getDocs, doc, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { v4 as uuidv4 } from 'uuid';
import anonAvatar from '../../assets/anonAvatar.webp'


const MessageCollection = () => {
    const { currentUser, showMessenger, setShowMessenger, roomChosen, setRoomChosen, setShouldFetchMessages } = useAppContext();
    const [showSidebar, setShowSidebar] = useState(true);
    const [userRooms, setUserRooms] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [isNoMessages, setIsNoMessages] = useState(true)

    const scroll = useRef();

    // useEffect(() => {
    //     const handleInitialMessage = async (e) => {
    //         e.preventDefault();

    //         // Check if the conversation with the recipient already exists
    //         const participantIds = [roomChosen.id, currentUser.uid];
    //         const conversationQuery = query(collection(db, 'conversations'), where('participantsIds', 'array-contains-any', participantIds));

    //         const conversationSnapshot = await getDocs(conversationQuery);
    //         let newMessageRef;

    //         if (conversationSnapshot.empty) {
    //             // Create a new conversation document and get the reference
    //             const conversationRef = doc(collection(db, 'conversations'));
    //             console.log('Conversation ID:', conversationRef.id);

    //             // Use the document reference to create the sub-collection 'messages'
    //             const messageRef = collection(db, 'conversations', conversationRef.id, 'messages');
    //             console.log('Message Collection Path:', messageRef.path);

    //             // Get the ID of the newly created document
    //             const conversationId = conversationRef.id;

    //             const newMessageFields = {
    //                 docId: conversationId,

    //                 initiatedAt: serverTimestamp(),
    //                 initiatedBy: currentUser.uid,
    //                 lastMessage: {
    //                     message: 'Hi!',
    //                     recipientId: roomChosen.id,
    //                     senderId: currentUser.uid,
    //                     status: "sent",
    //                     timeStamp: serverTimestamp(),
    //                 },
    //                 lastUpdatedAt: serverTimestamp(),
    //                 participants: {
    //                     recipientId: roomChosen.id,
    //                     recipientName: roomChosen.name,
    //                     recipientAvatar: roomChosen.avatar,
    //                     senderId: currentUser.uid,
    //                     senderName: currentUser.displayName,
    //                     senderAvatar: currentUser.photoURL,
    //                 },
    //                 participantsIds: [roomChosen.id, currentUser.uid],
    //             };

    //             const messageDoc = {
    //                 message: 'Hi!',
    //                 senderId: currentUser.uid,
    //                 recipientId: roomChosen.id,
    //                 status: 'sent',
    //                 timestamp: serverTimestamp()
    //             }

    //             // Set the conversation document with the obtained ID
    //             await setDoc(conversationRef, newMessageFields, { merge: true });

    //             // Set the message document in the 'messages' sub-collection
    //             await setDoc(newMessageRef, messageDoc);
    //         } else {
    //             // Get the ID of the existing conversation
    //             const conversationId = conversationSnapshot.docs[0].id;

    //             const messageDoc = {
    //                 message: 'Hi!',
    //                 senderId: currentUser.uid,
    //                 recipientId: roomChosen.id,
    //                 status: 'sent',
    //                 timestamp: serverTimestamp()
    //             }

    //             // Use the existing conversation document reference to create the sub-collection 'messages'
    //             const messageRef = collection(db, 'conversations', conversationId, 'messages');
    //             newMessageRef = doc(messageRef);

    //             // Set the message document in the 'messages' sub-collection
    //             await setDoc(newMessageRef, messageDoc, { merge: true });
    //         }

    //         setShouldFetchMessages(true);

    //         scroll.current.scrollIntoView({ behavior: 'smooth' });
    //     };
    //     if (roomChosen.docId === '') {
    //         handleInitialMessage();
    //     }
    // }, [])

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
                console.log('roomData', roomData);

                const previousTimestamp = roomData.lastMessage.timeStamp.seconds * 1000 + roomData.lastMessage.timeStamp.nanoseconds / 1000000;

                rooms.push({
                    docId: roomData.docId,
                    lastUpdatedAt: roomData.lastUpdatedAt,
                    lastMessage: {
                        message: roomData.lastMessage.message,
                        recipientId: roomData.lastMessage.recipientId,
                        senderId: roomData.lastMessage.senderId,
                        timeStamp: previousTimestamp,
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

                console.log(previousTimestamp);
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

    const handleRoomClick = (room) => {
        setRoomChosen({
            docId: room.docId,
            id: room.participants.recipientId,
            name: room.participants.recipientName,
            avatar: room.participants.recipientAvatar
        });
        setShowSidebar(false)
        console.log('roomChosen', roomChosen);
    };

    const handleMessengerClose = () => {
        setShowMessenger(false)
    }

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


    const displayNameChoice = (room) => {
        let displayName;

        if (currentUser.uid === room.participants.recipientId) {
            displayName = room.participants.senderName;
        } else {
            displayName = room.participants.recipientName;
        }

        return displayName;
    };


    return (
        <main className='messager'>
            <header className='messager-header'>
                <button onClick={() => handleMessengerClose()}>Close</button>
                <h1>Messages</h1>
            </header>

            <aside className='message-sidebar'>
                {userRooms.map((room) => (
                    <div key={uuidv4()}
                        onClick={() => handleRoomClick(room)}>
                        <img src={displayAvatarChoice(room)} alt="user avatar" />
                        <p>{timeDifference(currentTimestamp, room.lastMessage.timeStamp)}</p>
                        <h2>{displayNameChoice(room)}</h2>
                        <p>{room.lastMessage.message}</p>
                    </div>
                ))}
                <svg className={showMessenger ? '' : 'rotate'}
                    stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M12,20c-4.411,0-8-3.589-8-8s3.589-8,8-8 s8,3.589,8,8S16.411,20,12,20z"></path><path d="M9.293 7.707L13.586 12 9.293 16.293 10.707 17.707 16.414 12 10.707 6.293z"></path></svg>
            </aside>

            {(roomChosen.id !== '') && (
                <section className="chatbox">
                    <Message />
                    <span ref={scroll}></span>
                    <SendMessage scroll={scroll} />
                </section>
            )}

        </main>
    );
};

export default MessageCollection;