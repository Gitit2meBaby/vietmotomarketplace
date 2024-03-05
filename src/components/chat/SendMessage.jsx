import { useState } from "react";
import { db } from "../../firebase";
import { serverTimestamp, setDoc, doc, collection } from "firebase/firestore";
import { useAppContext } from "../../context";

const SendMessage = ({ scroll }) => {
    const { roomChosen, currentUser } = useAppContext()
    const [message, setMessage] = useState("");

    const roomId = roomChosen.id
    const postCreator = roomChosen.name
    const postAvatar = roomChosen.avatar

    const newMessageFields = {
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

    const handleMessageSend = async (e) => {
        e.preventDefault();

        // Create a new document and get the reference
        const conversationRef = doc(collection(db, 'conversations'));
        await setDoc(conversationRef, newMessageFields, { merge: true });

        // Get the ID of the newly created document
        const conversationId = conversationRef.id;

        // Use the document reference to create the sub-collection 'messages'
        const messageRef = collection(db, 'conversations', conversationId, 'messages');
        const newMessageRef = doc(messageRef);

        // Set the message document in the 'messages' sub-collection
        await setDoc(newMessageRef, messageDoc);

        // Clear the message input
        setMessage('');

        // Scroll to the bottom
        scroll.current.scrollIntoView({ behavior: 'smooth' });
    };




    return (
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
            <button type="submit">Send</button>
        </form>
    );
};

export default SendMessage;