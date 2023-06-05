import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
import { BsFillPersonFill, BsTrash } from "react-icons/bs";
import { useFirestore, useUser } from "reactfire";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  FieldValue,
} from "firebase/firestore";
import moment from "moment";
import Input from "./Input";
import ChatMessages from "./Messages";

const Chat = () => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [limitValue, setLimitValue] = useState(50);
  const [loadingMore, setLoadingMore] = useState(false);
  const firestore = useFirestore();
  const bottomRef = useRef();
  const { data: user } = useUser();

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsCollectionRef = collection(firestore, "users");
        const friendsQuery = query(
          friendsCollectionRef,
          where("email", ">=", searchQuery),
          where("email", "<=", searchQuery + "\uf8ff"),
          where("email", "!=", user.email),
          orderBy("email"),
          orderBy("lastLogin", "desc"), // Order by lastLogin in descending order
          limit(limitValue)
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsData = friendsSnapshot.docs.map((doc) => {
          return { ...doc.data(), id: doc.id };
        });
        setFriends(friendsData);
        if (friendsData.length > 0) {
          setSelectedFriend(friendsData[0]);
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    if (user?.email) {
      loadFriends();
    }
  }, [searchQuery, limitValue, firestore, user?.email]);

  useEffect(() => {
    // Update last login timestamp every 20 seconds
    const updateLastLogin = async () => {
      try {
        const usersCollectionRef = collection(firestore, "users");
        const querySnapshot = await getDocs(
          query(usersCollectionRef, where("email", "==", user.email))
        );
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userRef = doc(firestore, "users", userDoc.id);
          await updateDoc(userRef, { lastLogin: new Date().toISOString() });
        }
      } catch (error) {
        console.error("Error updating last login:", error);
      }
    };

    const intervalId = setInterval(updateLastLogin, 20000); // Every 20 seconds

    return () => {
      clearInterval(intervalId); // Clean up the interval on component unmount
    };
  }, [firestore, user?.email]);

  const handleSelect = (friend) => {
    setSelectedFriend(friend);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFriends([]);
    setLimitValue(50);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (loadingMore) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
      setLoadingMore(false);
    }
  }, [loadingMore]);

  return (
    <Container fluid className="chat-container">
      <Row className="h-100">
        <Col xs={4} md={3} className="bg-light">
          <FriendList
            friends={friends}
            handleSearch={handleSearch}
            searchQuery={searchQuery}
            selectedFriend={selectedFriend}
            setSearchQuery={setSearchQuery}
            handleSelect={handleSelect}
            user={user}
          />
        </Col>
        <Col xs={8} md={9} className="bg-white">
          <ChatMessages friend={selectedFriend} />
          <Input friend={selectedFriend} user={user} />
          {friends.length >= 50 && <div ref={bottomRef}></div>}
        </Col>
      </Row>
      {loadingMore && (
        <div className="text-center mt-2">Loading more friends...</div>
      )}
    </Container>
  );
};

const FriendList = ({
  friends,
  selectedFriend,
  handleSearch,
  searchQuery,
  user,
  handleSelect,
  setSearchQuery,
}) => {
  return (
    <div className="friend-list py-3 overflow-y-scroll">
      <div className="search-bar">
        <Form onSubmit={handleSearch}>
          <Form.Control
            type="text"
            placeholder="Find by Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Form>
      </div>
      {friends.map((friend) => (
        <FriendItem
          key={friend.id}
          friend={friend}
          selectedFriend={selectedFriend}
          user={user}
          handleSelect={handleSelect}
        />
      ))}
    </div>
  );
};

const FriendItem = ({ friend, selectedFriend, handleSelect, user }) => {
  const [showDelete, setShowDelete] = useState(false);
  const formattedTimestamp = moment(friend.lastLogin).format("LT");
  const lastLoginText = `Last login at ${formattedTimestamp}`;
  const isRecentLogin = moment(friend.lastLogin).isAfter(
    moment().subtract(1, "minutes")
  );
  const firestore = useFirestore();

  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent selecting the friend item when clicking delete

    try {
      const usersCollectionRef = collection(firestore, "users");
      const querySnapshot = await getDocs(
        query(usersCollectionRef, where("email", "==", user.email))
      );
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(firestore, "users", userDoc.id);

        // Remove the friend's email key from the document values
        await updateDoc(userRef, {
          [friend.email]: FieldValue.deleteField,
        });
      }
    } catch (error) {
      console.error("Error deleting friend's conversation:", error);
    }
  };

  return (
    <div
      onClick={handleSelect.bind(this, friend)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      className={`friend-item my-2 p-2 d-flex gap-2  ${
        selectedFriend.email === friend.email ? "selectedFriend" : ""
      }`}
    >
      <div className="friend-profile align-self-center">
        <BsFillPersonFill size={30} />
      </div>
      <div className="friend-info d-flex flex-column w-100">
        <h5 className="size-1 m-0">
          {friend.firstName?.length > 15
            ? `${friend.firstName.substring(0, 15)}...`
            : friend.firstName}
        </h5>
        <div className="d-flex justify-content-between gap-1">
          <h6 className="latest-text m-0 flex-grow-1">
            {friend.latestText?.length > 30
              ? `${friend.latestText?.substring(0, 30)}...`
              : friend.latestText}
          </h6>
          <h6
            className={`timestamp m-0 ${isRecentLogin ? "recent-login" : ""}`}
          >
            {isRecentLogin ? (
              <div className="green-circle"></div>
            ) : (
              friend.lastLogin && lastLoginText
            )}
          </h6>
        </div>
      </div>
      {showDelete && (
        <div className="delete-icon" onClick={handleDelete}>
          <BsTrash size={20} />
        </div>
      )}
    </div>
  );
};

export default Chat;
