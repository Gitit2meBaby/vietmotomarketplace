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

    // In case user has sent direct message from Post.jsx
    useEffect(() => {
        setMessageSent(false)
    }, [])

    // Send message of input value
    const handleMessageSend = async (e) => {
        e.preventDefault();

        if (message.trim() === "") {
            return;
        }

        // Check if the conversation with the recipient already exists
        const participantIds = [roomChosen.id, currentUser.uid];
        const conversationQuery = query(collection(db, 'conversations'), where('participantsIds', 'array-contains-any', participantIds));

        const conversationSnapshot = await getDocs(conversationQuery);
        let newMessageRef;

        if (conversationSnapshot.empty) {
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
            // Get the ID of the existing conversation
            const conversationId = conversationSnapshot.docs[0].id;

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
        setShouldFetchMessages(true);
        setMessageSent(true)
        if (!showMessageInput) {
            scroll.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleMessagerOpen = () => {
        setMessageSent(false)
        setShowMessenger(true)
    }

    console.log('showMessenger', showMessenger);

    return (
        <>
            {(!messageSent || showMessenger) && (
                <form onSubmit={(e) => handleMessageSend(e)} className="send-message">
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
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" disabled={roomChosen.id === ''}>Send</button>
                </form>
            )}

            {(messageSent && !showMessenger) && (
                <div className="message-sent-wrapper">
                    <p className="message-sent">Message sent!</p>
                    <button onClick={() => handleMessagerOpen()} className="open-messager-btn">Messager</button>
                </div>
            )}
        </>
    );
};

export default SendMessage;