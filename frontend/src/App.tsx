import { CopyToClipboardContextProvider } from "@/contexts/CopyContextProvider";
import { SnackbarContextProvider } from "@/contexts/SnackbarContextProvider";
import { UserInfoContextProvider } from "@/contexts/UserInfoContextProvider";
import { Router } from "@/router/Router";

const App = () => (
  <SnackbarContextProvider>
    <CopyToClipboardContextProvider>
      <UserInfoContextProvider>
        <Router />
      </UserInfoContextProvider>
    </CopyToClipboardContextProvider>
  </SnackbarContextProvider>
);

export default App;
