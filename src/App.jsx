import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  StreamVideoClient,
  StreamVideo,
  StreamCall,
  useCall,
  useCallStateHooks,
  ParticipantView,
} from "@stream-io/video-react-sdk";

const apiKey = "mmhfdzb5evj2"; // Replace with your actual API key
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0x1a2VfU2t5d2Fsa2VyIiwidXNlcl9pZCI6Ikx1a2VfU2t5d2Fsa2VyIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3MzA0NzAyNjYsImV4cCI6MTczMTA3NTA2Nn0.umjhtbOVpZ4mc9yJ1ua7aTEmWuNIqtDIKnUqtLeCeHU"; // Replace with your actual token
const userId = "Luke_Skywalker";
const callId = "66NYgpA1xtGF";

const user = { id: userId, name: "Tutorial" };

const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("livestream", callId);
call.join({ create: true });

export default function App() {
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyLivestreamUI />
      </StreamCall>
    </StreamVideo>
  );
}

export const MyLivestreamUI = () => {
  const call = useCall();
  const { useIsCallLive, useLocalParticipant } = useCallStateHooks();

  const [livestreams, setLivestreams] = useState([]);
  const [isInLiveStream, setIsInLiveStream] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const localParticipant = useLocalParticipant();
  const isCallLive = useIsCallLive();

  useEffect(() => {
    const fetchLivestreams = async () => {
      try {
        const response = await axios.get("https://livetest-jgle.onrender.com/live");
        setLivestreams(response.data);
      } catch (error) {
        console.error("API dan ma'lumot olishda xatolik:", error);
      }
    };

    fetchLivestreams();
  }, []);

  const handleJoinCall = (livestream) => {
    const newCall = client.call("livestream", livestream.id);
    newCall.join({ create: false });
    setIsInLiveStream(true);
    setChatMessages(livestream.chat);
  };

  const handleLeaveCall = () => {
    setIsInLiveStream(false);
    setChatMessages([]);
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      email: userId,
      username: "Tutorial",
      message: message,
      timestamp: new Date().toISOString(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">Livestream</h1>
      {isInLiveStream ? (
        <div className="w-full max-w-lg bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          {isCallLive && localParticipant && (
            <div className="border border-gray-700 rounded-lg overflow-hidden mb-4">
              <ParticipantView
                participant={localParticipant}
                ParticipantViewUI={null}
              />
            </div>
          )}
          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-2">Chat</h2>
            <div className="max-h-40 overflow-y-scroll border border-gray-700 p-2 rounded-lg mb-4 bg-gray-800">
              {chatMessages.map((chat, index) => (
                <div key={index} className="mb-2">
                  <strong>{chat.username}: </strong>
                  <span>{chat.message}</span>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow border border-gray-600 rounded-lg p-2 mr-2 bg-gray-700 text-white"
                placeholder="Xabar yozing..."
              />
              <button 
                onClick={handleSendMessage} 
                className="bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
              >
                Send
              </button>
            </div>
          </div>
          <div className="text-center">
            <button onClick={handleLeaveCall} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300">
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-lg bg-gray-900 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Available Livestreams</h2>
          {livestreams.map((livestream) => (
            <div key={livestream.startTime} className="border border-gray-700 p-4 mb-4 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold text-lg">{livestream.videoTitle}</h3>
              <h3 className="font-semibold text-lg">Email: {livestream.email}</h3>
              <p>Status: <span className="font-semibold">{livestream.status}</span></p>
              <button 
                onClick={() => handleJoinCall(livestream)} 
                className="mt-3 bg-purple-600 text-white font-semibold py-2 px-4 rounded hover:bg-purple-700 transition duration-300"
              >
                Join {livestream.videoTitle}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
