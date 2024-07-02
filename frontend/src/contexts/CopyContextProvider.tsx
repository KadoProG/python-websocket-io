"use client";

import { useSnackbar } from "@/contexts/SnackbarContextProvider";
import React from "react";

interface CopyToClipboardContextType {
  copyToClipboard: (text: string) => void;
}
const context = React.createContext<CopyToClipboardContextType>({
  copyToClipboard: () => {},
});

export const useCopyToClipboard = () => React.useContext(context);

export const CopyToClipboardContextProvider = (props: {
  children: React.ReactNode;
}) => {
  const { setSnackbar } = useSnackbar();
  const copyContext = React.useMemo(
    () => ({
      copyToClipboard: async (text: string) => {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
          } else {
            const textarea = document.getElementById(
              "hidden-textarea-to-clip"
            ) as HTMLTextAreaElement;
            if (textarea === null) return;
            textarea.value = text;
            textarea.select();
            document.execCommand("copy");
            textarea.blur();
          }

          setSnackbar("Success to copy to clipboard", "success");
        } catch (e) {
          setSnackbar("Failed to copy to clipboard", "error");
          console.error(e); // eslint-disable-line no-console
        }
      },
    }),
    [setSnackbar]
  );

  return (
    <context.Provider value={copyContext}>
      <textarea
        id="hidden-textarea-to-clip"
        style={{ zIndex: -1, opacity: 0, position: "fixed", top: 0, left: 0 }}
      />
      {props.children}
    </context.Provider>
  );
};
