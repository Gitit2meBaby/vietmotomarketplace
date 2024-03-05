import { useState } from "react";
import { db } from "../../firebase";
import { serverTimestamp, setDoc, doc, collection } from "firebase/firestore";
import { useAppContext } from "../../context";

const SendMessage = ({ scroll }) => {
    const { roomChosen, currentUser } = useAppContext()
    const [message, setMessage] = useState("");

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
        await setDoc(doc(collection(db, 'conversations')), newMessageFields, { merge: true });

        await setDoc(messageRef, newMessageFields, { merge: true });

        const messageRef = collection(db, 'conversations', messageRef.id, 'messages');
        const newMessageRef = doc(messageRef);

        setDoc(newMessageRef, messageDoc)
            .then(() => {
                setMessage('')

            })
            .catch((error) => {
                console.error("Error adding message:", error);
            });
        scroll.current.scrollIntoView({ behavior: "smooth" });
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