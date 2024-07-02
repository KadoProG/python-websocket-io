import { Room } from "@/components/Room";
import { CopyToClipboardContextProvider } from "@/contexts/CopyContextProvider";
import { SnackbarContextProvider } from "@/contexts/SnackbarContextProvider";

const App = () => (
  <SnackbarContextProvider>
    <CopyToClipboardContextProvider>
      <Room />
    </CopyToClipboardContextProvider>
  </SnackbarContextProvider>
);

export default App;
