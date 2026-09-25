import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname;
    console.log("Navigated to:", page);
  }, [location.pathname]);

  return null;
}
