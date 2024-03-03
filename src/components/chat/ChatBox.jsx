import { useEffect, useRef, useState } from "react";
import {
    query,
    collection,
    orderBy,
    onSnapshot,
    limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import Message from "./Message";
import SendMessage from "./SendMessage";
import { useAppContext } from "../../context";

const ChatBox = () => {
    const { roomChosen, setShowChatBox, currentUser } = useAppContext()
    const [messages, setMessages] = useState([]);
    const scroll = useRef();

    useEffect(() => {
        const q = query(
            collection(db, `/users/${roomChosen}/rooms/${currentUser.uid}/messages`),
            orderBy("createdAt", "desc"),
            limit(25)
        );

        console.log('currentUser.uid', currentUser.uid);
        console.log('roomChosen', roomChosen);

        const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
            const fetchedMessages = [];
            QuerySnapshot.forEach((doc) => {
                fetchedMessages.push({ ...doc.data(), id: doc.id });
            });
            const sortedMessages = fetchedMessages.sort(
                (a, b) => a.createdAt - b.createdAt
            );
            setMessages(sortedMessages);
            console.log('messages', messages);
        });
        return () => unsubscribe;
    }, []);

    const handleExitChatBox = () => {
        setShowChatBox(false)
    }

    return (
        <main className="chat-box">
            <div className="chat-box-header">
                {/* {roomChosen.avatar && (
                    <img src={roomChosen.avatar} alt={roomChosen.name} />
                )} */}
                <h2>{roomChosen.name}</h2>
            </div>
            <button onClick={() => handleExitChatBox()}>Back</button>
            <div className="messages-wrapper">
                {messages?.map((message) => (
                    <Message key={message.id} message={message} />
                ))}
            </div>
            <span ref={scroll}></span>
            <SendMessage scroll={scroll} />
        </main>
    );
};

export default ChatBox;