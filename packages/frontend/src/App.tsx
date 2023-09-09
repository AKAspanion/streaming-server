import { RouterProvider } from 'react-router-dom';
import { router } from '@router/router';
import { Provider } from 'react-redux';
import { persistor, store } from '@store/store';
import Notifications from '@components/Notifications';
import { PersistGate } from 'redux-persist/integration/react';

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
        <Notifications />
      </PersistGate>
    </Provider>
  );
}

export default App;
