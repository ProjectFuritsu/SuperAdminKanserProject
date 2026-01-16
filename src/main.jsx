import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import '@gfazioli/mantine-split-pane/styles.css';


import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

createRoot(document.getElementById('root')).render(
  <MantineProvider>
    <Notifications />
    <ModalsProvider>
      <App />
    </ModalsProvider>
  </MantineProvider>,
)
