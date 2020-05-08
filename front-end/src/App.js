import React, { useState, useEffect } from "react";
// import Home from "./Home";
import Home from "./Home";
import Navbar from "./layout/Navbar";
import Footer from "./layout/Footer";
import Login from "./components/Login/Login";
import Chat from "./components/Chat/Chat";
const socket = new WebSocket("ws://localhost:3001");

function App() {
  const [user, setUser] = useState({ facebookId: "1170177643325233" });
  const [header, setHeader] = useState(
    "Welcome to Arx, start chatting and meeting new people!!!"
  );
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState();
  const [timeLeft, setTimeLeft] = useState(null);

  const [likeIt, setLikeIt] = useState(null);
  const [finish, setFinish] = useState(false);

  const checkTime = (i) => {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  };

  useEffect(() => {
    if (socket) {
      socket.onopen = () => {
        console.log("holu socket conectado");
        socket.onerror = function (event) {
          console.error("WebSocket error observed", event);
        };
      };
      socket.onmessage = (inMsg) => {
        const data = JSON.parse(inMsg.data);
        if (data.state === 0) console.log("llego el puto mensaje", data);

        if (data.state === 0) {
          setMessages((d) => {
            d.push(
              [false, data.message, Math.floor(Date.now() / 1000)].join(
                "%=%splitmessage%=%"
              )
            );
            return [...new Set(d)];
          });
          if (socket) {
            socket.send(
              JSON.stringify({
                state: 2,
                senderId: data.receiverId,
                receiverId: data.senderId,
                message: data.message,
              })
            );
            let c = {
              betterHalf: data.senderId,
            };
            if (data.receiverId) c["mySocketId"] = data.receiverId;
            setChat(c);
          } else {
            console.log("socket not found ");
          }
        } else if (data.state === 1) {
          console.log("mesg 1", inMsg);
          setHeader(data.message);
        } else if (data.state === 2) {
          console.log("mesg 2", inMsg);
          const c = {
            betterHalf: data.senderId,
            mySocketId: data.receiverId,
          };
          setChat(c);
        } else if (data.state === 5) {
          // console.log("tiempo", data);

          if (data.timeLeft === "its_gone") {
            setMessages([]);
            setChat(null);
            setFinish(false);
            setHeader(
              "Welcome to Arx, start chatting and meeting new people! "
            );
          } else {
            if (data.timeLeft < 0) {
              console.log("like n finish", likeIt, finish);
              if (likeIt && finish) {
                console.log("detectó el like");
                if (socket)
                  socket.send(
                    JSON.stringify({
                      state: 1,
                      receiverId: chat.betterHalf,
                      heart: true,
                    })
                  );
                else console.log("no hay socket para enviar like");

                setFinish(false);
              }
              if (!finish && !likeIt) setFinish(true);
            }
            const timeStr =
              data.timeLeft >= 0
                ? checkTime(new Date(data.timeLeft).getMinutes()) +
                  ":" +
                  checkTime(new Date(data.timeLeft).getSeconds())
                : "00:" + checkTime(Math.floor(15 + data.timeLeft / 1000));
            setTimeLeft(timeStr);
          }
        }
      };
    } else {
      console.log("no hay socket");
    }

    // return () => {
    //   if (socket && chat && chat.mySocketId) {
    //     let payload = { state: 4, message: "I'm leaving" };
    //     if (chat && chat.betterHalf) payload["receiverId"] = chat.betterHalf;
    //     if (chat && chat.mySocketId) payload["senderId"] = chat.mySocketId;
    //     socket.send(JSON.stringify(payload));
    //   } else {
    //     debugger;
    //   }
    // };
  }, []);

  const onHeart = () => {
    setLikeIt(true);
  };

  const onCancel = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          state: 5,
          receiverId: chat.betterHalf,
          message: "le dieron dislike",
        })
      );
    }
  };

  const sendMessage = (msg) => {
    if (socket) {
      let payload = { state: 0, message: msg };
      if (chat && chat.betterHalf) payload["receiverId"] = chat.betterHalf;
      if (chat && chat.mySocketId) payload["senderId"] = chat.mySocketId;

      socket.send(JSON.stringify(payload));
      setMessages(
        (d) => (
          d.push(
            [true, msg, Math.floor(Date.now() / 1000)].join(
              "%=%splitmessage%=%"
            )
          ),
          [...new Set(d)]
        )
      );
      console.log("mesg mandado", JSON.stringify(payload));
    } else {
      console.log("socket not found");
    }
  };
  return (
    <div className='App'>
      <Navbar />
      {!chat ? (
        <Home header={header} initChatIntent={sendMessage} />
      ) : (
        <Chat
          timeLeft={timeLeft}
          chat={chat}
          finish={finish}
          socket={socket}
          messages={messages}
          sendMessage={sendMessage}
          onHeart={onHeart}
          onCancel={onCancel}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
