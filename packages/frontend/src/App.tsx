import { RouterProvider } from "react-router-dom";
import { router } from "@router/router";
import { Provider } from "react-redux";
import { store } from "@store/store";
import Notifications from "@components/Notifications";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch(`https://jioassist.mobility.sit.jio.com/verifysaml/identify`, {
      method: "POST",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        console.log(response);
        return response.json();
      })
      .then((response) => {
        console.log(response);
      })
      .catch(async (err) => {
        console.log(err);
      });
  });

  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Notifications />
    </Provider>
  );
}

export default App;
