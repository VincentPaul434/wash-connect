import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function useBlockBanned() {
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.status === "Banned") {
      navigate("/banned");
    }
  }, [navigate]);
}