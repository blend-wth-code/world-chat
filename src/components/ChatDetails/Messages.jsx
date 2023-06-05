import React, { useEffect, useState, useRef } from "react";
import Message from "./Message";
import { collection, query, getDocs, onSnapshot } from "firebase/firestore";
import { useFirestore, useUser } from "reactfire";

const ChatMessages = ({ friend }) => {
  const firestore = useFirestore();
  const [messages, setMessages] = useState([]);
  const { data: user } = useUser();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (friend.email) {
      fetchMessages(friend.email);

      // Subscribe to real-time updates
      const unsubscribe = onSnapshot(
        collection(firestore, "users"),
        (snapshot) => {
          const userData = snapshot.docs.map((doc) => doc.data());

          const friendData = userData.find(
            (userObj) => userObj.email === user.email
          );

          if (friendData) {
            const messagesData = friendData[friend.email];
            setMessages(messagesData || []);
          } else {
            console.log("Friend not found.");
          }
        }
      );

      // Cleanup the subscription when component unmounts
      return () => unsubscribe();
    }
  }, [friend.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (friendEmail) => {
    try {
      const usersCollectionRef = collection(firestore, "users");
      const usersQuery = query(usersCollectionRef);
      const usersSnapshot = await getDocs(usersQuery);
      const userData = usersSnapshot.docs.map((doc) => doc.data());

      const friendData = userData.find(
        (userObj) => userObj.email === user.email
      );

      if (friendData) {
        const messagesData = friendData[friendEmail];
        setMessages(messagesData || []);
      } else {
        console.log("Friend not found.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ block: "end" });
  };

  return (
    <div className="chat-messages p-3 pe-0 overflow-y-scroll">
      {messages.length === 0 ? (
        <div className="text-center">No messages</div>
      ) : (
        messages.map((message, i) => (
          <Message key={i} message={message} currentUser={user.email} />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
