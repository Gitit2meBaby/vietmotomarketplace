import { useEffect, useState } from "react";
import { collection, orderBy, doc, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAppContext } from '../../context';
import { v4 as uuidv4 } from 'uuid';

const Message = () => {
    const { currentUser, roomChosen, shouldFetchMessages } = useAppContext();
    const [messageList, setMessageList] = useState([]);

    // create a better UX for time display
    function timeDifference(current, previous) {
        const elapsed = current - previous;

        const secondsAgo = Math.round(elapsed / 1000);
        const minutesAgo = Math.round(elapsed / (60 * 1000));
        const hoursAgo = Math.round(elapsed / (60 * 60 * 1000));
        const daysAgo = Math.round(elapsed / (24 * 60 * 60 * 1000));

        if (secondsAgo < 60) {
            return `${secondsAgo} ${secondsAgo === 1 ? 'second' : 'seconds'}`;
        } else if (minutesAgo < 60) {
            return `${minutesAgo} ${minutesAgo === 1 ? 'm' : 'm'}`;
        } else if (hoursAgo < 24) {
            return `${hoursAgo} ${hoursAgo === 1 ? 'hr' : 'hrs'}`;
        } else {
            return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'}`;
        }
    }

    const currentTimestamp = new Date().getTime();

    console.log("db:", db);
    console.log("roomChosen.docId:", roomChosen.docId);

    const getMessages = query(
        collection(db, "conversations", roomChosen.docId, "messages"),
        orderBy('timestamp')
    );

    useEffect(() => {
        const unsubscribe = onSnapshot(getMessages, (querySnapshot) => {
            const newMessageList = [];

            querySnapshot.forEach((doc) => {
                const messages = doc.data();
                console.log("messages:", messages);
                if (messages) {
                    newMessageList.push(messages);
                }
            });

            setMessageList(newMessageList);
        });

        return unsubscribe;
    }, [shouldFetchMessages]);

    console.log("messageList:", messageList);


    return (
        <div>
            {messageList.map(({ message, senderId, recipientId, status, timestamp }) => (
                <div
                    className={`chat-bubble ${senderId === currentUser.id ? "right" : "left"}`}
                    key={uuidv4()}
                >
                    <p className="user-message">{message}</p>
                    <p className="message-timestamp">{timeDifference(currentTimestamp, timestamp.seconds * 1000)}</p>

                </div>
            ))}
        </div>
    );
}
export default Message;