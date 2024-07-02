"use client";

import React from "react";
import styles from "@/contexts/SnackbarContext.module.scss";

type AlertColor = "success" | "info" | "warning" | "error";
interface SnackbarContextType {
  messageObjects: { message: string; color: AlertColor }[];
  setSnackbar: (message: string, color: AlertColor) => void;
}

const context = React.createContext<SnackbarContextType>({
  messageObjects: [],
  setSnackbar: () => {},
});

export const useSnackbar = () => React.useContext(context);

export const SnackbarContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const [messageObjects, setMessageObjects] = React.useState<
    { message: string; color: AlertColor }[]
  >([]);

  const newContext = React.useMemo(
    () => ({
      messageObjects,
      setSnackbar: (message: string, color: AlertColor) => {
        setMessageObjects((prev) => [...prev, { message, color }]);
      },
    }),
    [messageObjects]
  );

  return (
    <context.Provider value={newContext}>
      <div className={styles.snackbar__message}>
        {messageObjects.map((messageObject, index) => (
          <p
            className={`${styles.snackbar__message_p} ${styles[`${messageObject.color}`]}`}
            key={messageObject.message + index}
          >
            {messageObject.message}
          </p>
        ))}
      </div>
      {props.children}
    </context.Provider>
  );
};
