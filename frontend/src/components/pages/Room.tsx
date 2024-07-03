"use client";

import { Input } from "@/components/common/Input";
import { TalkingCard } from "@/components/common/TalkingCard";
import { useCopyToClipboard } from "@/contexts/CopyContextProvider";
import { useUserInfo } from "@/contexts/UserInfoContextProvider";
import axios from "@/libs/axios";
import React from "react";
import { useForm } from "react-hook-form";
import { io, Socket } from "socket.io-client";
import styles from "@/components/pages/Room.module.scss";
import { useNavigate } from "react-router-dom";

interface ClientInfo {
  nickname: string;
}

const BACKEND_WS_URL = import.meta.env.VITE_APP_BACKEND_WS_URL;
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

export const Room = () => {
  const { sessionId, nickname } = useUserInfo();
  const { copyToClipboard } = useCopyToClipboard();

  const navigate = useNavigate();
  React.useEffect(() => {
    if (!sessionId) {
      navigate("/c");
    }
  }, [sessionId, navigate]);

  const { control, handleSubmit, reset } = useForm<{ message: string }>({
    defaultValues: {
      message: "",
    },
  });
  const [response, setResponse] = React.useState<
    { client: ClientInfo; message: string; isMine?: boolean }[]
  >([]);
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [clients, setClients] = React.useState<string[]>([]);
  const [isDisconnected, setIsDisconnected] = React.useState<boolean>(false);

  const connectSocket = (selectSessionId: string, selectNickname: string) => {
    const newSocket = io(BACKEND_WS_URL, {
      query: { sessionId: selectSessionId, nickname: selectNickname },
      transports: ["websocket"],
      upgrade: false,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket.io server"); // eslint-disable-line no-console
      setSocket(newSocket);
    });

    newSocket.on("message", (data) => {
      console.log("Message from socket.io server", data); // eslint-disable-line no-console

      if (data.type === "clientList") {
        setClients(data.clients);
      } else {
        setResponse(data.messages);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket.io server"); // eslint-disable-line no-console
      setClients([]);
      setIsDisconnected(true);
    });

    setSocket(newSocket);
  };

  React.useEffect(() => {
    if (!sessionId || !nickname) return;
    connectSocket(sessionId, nickname);
  }, [sessionId, nickname]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!socket) return;
      handleSubmit(async (data) => {
        try {
          if (data.message === "") return;
          socket.emit("message", { message: data.message });
          reset();
          console.log(socket);
          console.log("emit message", data.message); // eslint-disable-line no-console
        } catch (error) {
          console.error(error); // eslint-disable-line no-console
        }
      })();
    },
    [handleSubmit, socket, reset]
  );

  const removeClient = async (index: number) => {
    if (sessionId) {
      await axios.delete(`/session/${sessionId}/clients/${index}`);
    }
  };

  const onCopyButtonClick = React.useCallback(() => {
    copyToClipboard(`${BACKEND_URL}/c/?c=${sessionId}`);
  }, [copyToClipboard, sessionId]);

  return (
    <div>
      <h1>参加しているチーム</h1>

      {sessionId && (
        <div className={styles.Room}>
          {isDisconnected && <p style={{ color: "red" }}>切断されました</p>}
          <ul>
            {clients.map((client, index) => (
              <li key={client}>
                {client}
                <button type="button" onClick={() => removeClient(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <p>Session ID: {sessionId}</p>
          <button type="button" onClick={onCopyButtonClick}>
            共有リンクをコピー
          </button>

          <h2>メッセージリスト</h2>
          {response.map((messageObject, index) => (
            <TalkingCard
              message={messageObject.message}
              nickName={messageObject.client.nickname}
              isMine={messageObject.isMine}
              key={index}
            />
          ))}

          <form onSubmit={onSubmit} className={styles.Room__form}>
            <Input
              name="message"
              control={control}
              placeholder="入力しろ"
              disabled={isDisconnected}
            />
          </form>
        </div>
      )}
    </div>
  );
};
