import { useState } from "react";
import { auth, db } from "../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import avatar from '../../assets/anonAvatar.webp'
import { useAppContext } from "../../context";

const SendMessage = ({ scroll }) => {
    const { roomChosen, setRoomChosen } = useAppContext()
    const [message, setMessage] = useState("");

    const sendMessage = async (event) => {
        event.preventDefault();
        if (message.trim() === "") {
            alert("Enter valid message");
            return;
        }

        const { uid, displayName, photoURL } = auth.currentUser;

        // Construct the correct path in the database
        const messagePath = `users/${roomChosen}/rooms/${uid}/messages`;

        await addDoc(collection(db, messagePath), {
            text: message,
            name: displayName,
            avatar: photoURL ? photoURL : avatar,
            createdAt: serverTimestamp(),
            uid,
        });
        setMessage("");
        scroll.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <form onSubmit={(event) => sendMessage(event)} className="send-message">
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