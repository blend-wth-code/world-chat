import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useFirestore } from "reactfire";

const ChatInput = ({ friend, user }) => {
  const [message, setMessage] = useState("");
  const firestore = useFirestore();

  const handleMessageSend = async (e) => {
    e.preventDefault();

    try {
      // Create a reference to the users collection
      const usersCollectionRef = collection(firestore, "users");

      // Create a query to find the user document with the matching email
      const querySnapshot = await getDocs(
        query(usersCollectionRef, where("email", "==", user.email))
      );

      if (!querySnapshot.empty) {
        const userDocData = querySnapshot.docs[0].data();
        const userDocRef = doc(firestore, "users", querySnapshot.docs[0].id);

        // Get the current messages array from the user's document
        const userMessagesData = userDocData[friend.email] || [];

        // Create a new message object
        const newMessage = {
          id: Date.now(),
          sender: user.email,
          text: message,
          timestamp: new Date().toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZoneName: "short",
          }),
        };

        // Add the new message to the user's messages array
        userMessagesData.push(newMessage);

        // Update the user's document with the new messages array
        await setDoc(
          userDocRef,
          {
            [friend.email]: userMessagesData,
          },
          { merge: true }
        );

        // Check if the friend document exists
        const friendDocSnapshot = await getDocs(
          query(usersCollectionRef, where("email", "==", friend.email))
        );

        if (!friendDocSnapshot.empty) {
          const friendDocData = friendDocSnapshot.docs[0].data();
          const friendDocRef = doc(
            firestore,
            "users",
            friendDocSnapshot.docs[0].id
          );

          // Get the current messages array from the friend's document
          const friendMessagesData = friendDocData[user.email] || [];

          // Add the new message to the friend's messages array
          friendMessagesData.push(newMessage);

          // Update the friend's document with the new messages array
          await setDoc(
            friendDocRef,
            {
              [user.email]: friendMessagesData,
            },
            { merge: true }
          );
        } else {
          console.log("Friend not found.");
        }

        // Clear the message input field
        setMessage("");
      } else {
        console.log("User not found.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="chat-input p-3 border-top border-dark">
      <Form onSubmit={handleMessageSend} className="d-flex align-items-center">
        <Form.Control
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow-1 me-2"
          style={{ width: "95%" }}
        />
        <Button className="btn custom-btn" type="submit">
          Send
        </Button>
      </Form>
    </div>
  );
};

export default ChatInput;
