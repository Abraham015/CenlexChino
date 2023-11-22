import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import appFirebase from "../firebase/firebase";
import { getAuth } from "firebase/auth";
const auth = getAuth(appFirebase);

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!user);
    });

    // Important: Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsLoggedIn(false);
  }, []);

  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  return <div>dashboard</div>;
};

export default Dashboard;
