// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDOFOGUUaYS2qL91G2oCzTG2CH0vtEepqI",
  authDomain: "gen-lang-client-0748212712.firebaseapp.com",
  projectId: "gen-lang-client-0748212712",
  storageBucket: "gen-lang-client-0748212712.firebasestorage.app",
  messagingSenderId: "936693021844",
  appId: "1:936693021844:web:80f2cb0283230fcd394881"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Alerta Dropflow';
  const notificationOptions = {
    body: payload.notification?.body || 'Nova notificação de resumo financeiro.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
