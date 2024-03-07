import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { useAppContext } from "../context";
const OnAuthQuery = () => {
    const { currentUser } = useAppContext();
    const [newMessages, setNewMessages] = useState([]);

    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const getUnreadConversations = query(
                collection(db, "conversations"),
                where('participantIds', 'array-contains', currentUser.uid)
            );

            const unsubscribe = onSnapshot(getUnreadConversations, async (querySnapshot) => {
                console.log("Snapshot received:", querySnapshot);

                const messages = [];

                for (const doc of querySnapshot.docs) {
                    const conversationDoc = await getDoc(doc.ref);
                    const conversationData = conversationDoc.data();
                    console.log("conversationData:", conversationData);

                    if (conversationData) {
                        const messagesRef = collection(doc.ref, 'messages');
                        const messagesQuery = query(messagesRef, where('status', '==', 'sent'));
                        console.log("messagesQuery:", messagesQuery);

                        const messagesSnapshot = await getDocs(messagesQuery);
                        console.log("messagesSnapshot:", messagesSnapshot);

                        messagesSnapshot.forEach((messageDoc) => {
                            const messageData = messageDoc.data();
                            messages.push(messageData);
                        });
                    }
                }


                setNewMessages(messages);
            });

            return unsubscribe;
        }
    }, [currentUser]);

    useEffect(() => {
        console.log("newMessages Updated:", newMessages);
    }, [newMessages]);

    return (
        <div>
            <h1 style={{ color: 'white' }}>{newMessages.length}</h1>
        </div>
    );
}

export default OnAuthQuery;
