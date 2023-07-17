import { RouterProvider } from "react-router-dom";
import { router } from "@router/router";
import { Provider } from "react-redux";
import { store } from "@store/store";
import Notifications from "@components/Notifications";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Notifications />
    </Provider>
  );
}

export default App;
