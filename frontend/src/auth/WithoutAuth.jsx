import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../assets/7.gif";

const WithoutAuth = (WrappedComponent) => {
  const WrapperComponent = (props) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };
          if (token) {
            const decodedToken = decodeToken(token);
            if (decodedToken) {
              const { _id } = decodedToken;

              const responseUser = await axios.get(
                `https://booking-system-e1fe.onrender.com/api/user/`,
                { headers }
              );

              if (responseUser.status === 200) {
                const foundUser = responseUser.data.find(
                  (user) => user._id === _id
                );
                if (foundUser) {
                  navigate("/dashboard");
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserData();
    }, [token]);

    const decodeToken = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (error) {
        return null;
      }
    };

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <img src={Loader} style={{ width: "200px" }} alt="Loading..." />
        </div>
      );
    }
    return <WrappedComponent {...props} />;
  };

  return WrapperComponent;
};

export default WithoutAuth;
