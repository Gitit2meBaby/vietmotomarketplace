import { useEffect, useState } from "react";
import { collection, orderBy, query, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAppContext } from '../../context';
import { v4 as uuidv4 } from 'uuid';

const Message = () => {
    const { currentUser, roomChosen, shouldFetchMessages } = useAppContext();
    const [messageList, setMessageList] = useState([]);

    // create a better UX for time display
    const currentTimestamp = new Date().getTime();

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
        } else if (previous.seconds) {
            return `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'}`;
        } else {
            return "Now";  // Or handle this case as needed
        }
    }

    // console.log("db:", db);
    // console.log("roomChosen.docId:", roomChosen.docId);
    // console.log("roomChosen", roomChosen);

    const getMessages = query(
        collection(db, "conversations", roomChosen.docId, "messages"),
        orderBy('timestamp', 'asc'),
    );

    useEffect(() => {
        const unsubscribe = onSnapshot(getMessages, (querySnapshot) => {
            const newMessageList = [];

            querySnapshot.forEach((doc) => {
                const messages = doc.data();
                // console.log("messages:", messages);
                if (messages) {
                    newMessageList.push(messages);
                }
            });

            setMessageList(newMessageList);
        });

        return unsubscribe;
    }, [shouldFetchMessages, roomChosen]);

    // console.log("messageList:", messageList);


    return (
        <div className="message-list">
            {messageList.map(({ message, senderId, recipientId, status, timestamp }) => (
                <div
                    className={`chat-bubble ${senderId === currentUser.id ? "right" : "left"}`}
                    key={uuidv4()}
                >
                    <p>{message}</p>
                    <p className="message-timestamp">
                        {timestamp ? timeDifference(currentTimestamp, timestamp.seconds * 1000) : "Now"}
                    </p>


                </div>
            ))}
        </div>
    );
}
export default Message;