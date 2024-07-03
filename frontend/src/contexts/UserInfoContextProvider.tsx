"use client";

import React from "react";

interface UserInfoContextType {
  sessionId: string | null;
  nickname: string | null;
  setSessionId: (sessionId: string) => void;
  setNickname: (nickname: string) => void;
}

const context = React.createContext<UserInfoContextType>({
  sessionId: null,
  nickname: null,
  setSessionId: () => {},
  setNickname: () => {},
});

export const useUserInfo = () => React.useContext(context);

export const UserInfoContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [nickname, setNickname] = React.useState<string | null>(null);

  const sessionIdContext = React.useMemo(
    () => ({
      sessionId,
      nickname,
      setSessionId: (selectedSessionId: string) => {
        setSessionId(selectedSessionId);
      },
      setNickname: (selectedNickname: string) => {
        setNickname(selectedNickname);
      },
    }),
    [sessionId, nickname]
  );

  return (
    <context.Provider value={sessionIdContext}>
      {props.children}
    </context.Provider>
  );
};
