import { useEffect, useState } from "react";
import { db } from "../../firebase";
import {
    serverTimestamp,
    setDoc,
    doc,
    collection,
    where,
    getDocs,
    query,
    updateDoc
} from "firebase/firestore";
import { useAppContext } from "../../context";

const SendMessage = ({ scroll, showMessageInput }) => {
    const { roomChosen, currentUser, setShouldFetchMessages, setShowMessenger, showMessenger } = useAppContext()
    const [message, setMessage] = useState("");
    const [messageSent, setMessageSent] = useState(false);
    const [showButton, setShowButton] = useState(false);

    // In case user has sent direct message from Post.jsx
    useEffect(() => {
        setMessageSent(false)
    }, [])

    const handleInputChange = (e) => {
        setMessage(e.target.value);
        setShowButton(true)
        if (e.target.value === "") {
            setShowButton(false)
        }
    };

    // Send message of input value
    const handleMessageSend = async (e) => {
        e.preventDefault();

        if (message.trim() === "") {
            return;
        }

        const participantIds = [roomChosen.id, currentUser.uid];
        const concatenatedIds = participantIds.join('_');
        const reversedIds = [...participantIds].reverse().join('_');
        const existingIds = currentUser.uid + '_' + roomChosen.initiatedBy
        const existingIdsReverse = roomChosen.initiatedBy + '_' + currentUser.uid

        const conversationQuery = query(
            collection(db, 'conversations'),
            where('concatIds', 'in', [concatenatedIds, reversedIds, existingIds, existingIdsReverse]));

        console.log('conversationQuery:', conversationQuery);
        console.log('participantIds:', participantIds);
        console.log('currentUser:', currentUser.uid);
        console.log('roomChosen:', roomChosen.id)
        console.log('concatenatedIds:', concatenatedIds);
        console.log('reversedIds:', reversedIds);
        console.log('existingIds:', existingIds);
        console.log('existingIdsReverse:', existingIdsReverse);


        const conversationSnapshot = await getDocs(conversationQuery);
        console.log('conversationSnapshot:', conversationSnapshot);
        let newMessageRef;

        if (conversationSnapshot.empty) {
            console.log('No conversation found. Creating new one...');

            // Create a new conversation document and get the reference
            const conversationRef = doc(collection(db, 'conversations'));

            // Use reference to create the sub-collection 'messages'
            const messageRef = collection(db, 'conversations', conversationRef.id, 'messages');
            newMessageRef = doc(messageRef);

            // Get the ID of the newly created document
            const conversationId = conversationRef.id;

            const newMessageFields = {
                docId: conversationId,

                initiatedAt: serverTimestamp(),
                initiatedBy: currentUser.uid,
                lastMessage: {
                    message: message,
                    recipientId: roomChosen.id,
                    senderId: currentUser.uid,
                    status: "sent",
                    timeStamp: serverTimestamp(),
                },
                lastUpdatedAt: serverTimestamp(),
                participants: {
                    recipientId: roomChosen.id,
                    recipientName: roomChosen.name,
                    recipientAvatar: roomChosen.avatar,
                    senderId: currentUser.uid,
                    senderName: currentUser.displayName,
                    senderAvatar: currentUser.photoURL,
                },
                participantsIds: [roomChosen.id, currentUser.uid],
                concatIds: [roomChosen.id, currentUser.uid].sort().join('_'),
            };

            const messageDoc = {
                message: message,
                senderId: currentUser.uid,
                recipientId: roomChosen.id,
                status: 'sent',
                timestamp: serverTimestamp()
            }

            // Set the conversation document with the obtained ID
            await setDoc(conversationRef, newMessageFields, { merge: true });

            // Set the message document in the 'messages' sub-collection
            await setDoc(newMessageRef, messageDoc);
        } else {
            console.log('conversation found... updating existing one...');
            // Get the ID of the existing conversation
            const conversationId = conversationSnapshot.docs[0].id;
            console.log('conversationId:', conversationId);
            console.log('conversationSnapshot.docs[0]:', conversationSnapshot.docs[0]);
            console.log('conversationSnapshot.docs:', conversationSnapshot.docs);

            const messageDoc = {
                message: message,
                senderId: currentUser.uid,
                recipientId: roomChosen.id,
                status: 'sent',
                timestamp: serverTimestamp()
            }

            // Update the 'lastMessage' field in the existing conversation document
            await updateDoc(doc(db, 'conversations', conversationId), {
                lastMessage: {
                    message: message,
                    timestamp: serverTimestamp()
                },
            });

            // Use the existing conversation document, create 'messages'
            const messageRef = collection(db, 'conversations', conversationId, 'messages');
            newMessageRef = doc(messageRef);

            // Set the message document in the 'messages' sub-collection
            await setDoc(newMessageRef, messageDoc, { merge: true });
        }

        setMessage('');
        setShowButton(false)
        setShouldFetchMessages(true);
        setMessageSent(true)
        if (!showMessageInput) {
            scroll.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleMessagerOpen = () => {
        setMessageSent(false)
        setShowMessenger(true)
        showMessageInput(false)
    }

    // console.log('showMessenger', showMessenger);

    return (
        <section className={showMessenger ? 'in-message-input-wrapper' : 'in-post-input-wrapper'}>
            {(!messageSent || showMessenger) && (
                <form onSubmit={(e) => handleMessageSend(e)}
                    className={showMessenger ? 'in-message-input' : 'in-post-input'}>
                    <label htmlFor="messageInput" hidden>
                        Enter Message
                    </label>
                    <input
                        id="messageInput"
                        name="messageInput"
                        type="text"
                        className="form-input__input"
                        placeholder="type message..."
                        value={message}
                        autoComplete="off"
                        onChange={(e) => handleInputChange(e)}
                    />
                    <button type="submit"
                        disabled={(roomChosen.id === '' || showButton === false)}
                        className={'send-btn' + (!showButton ? ' send-btn-disabled' : '')}
                    ><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="2.2em" width="2.2em" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 17.707L16.414 12 10.707 6.293 9.293 7.707 13.586 12 9.293 16.293z"></path></svg></button>
                </form>
            )}

            {(messageSent && !showMessenger) && (
                <div className="message-sent-wrapper">
                    <p className="message-sent">Message sent!</p>
                    <button onClick={() => handleMessagerOpen()} className="open-messager-btn">Messager</button>
                </div>
            )}
        </section>
    );
};

export default SendMessage;