import { cert, initializeApp } from "firebase-admin/app";

import { getMessaging } from "firebase-admin/messaging";

const serviceAccount = {
  // Paste your service account here
} as any;

async function main() {
  const app = initializeApp({
    credential: cert({
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
      projectId: serviceAccount.project_id,
    }),
  });

  const messaging = getMessaging(app);

  try {
    const messageId = await messaging.send({
      token: "123", // Get this token from your device
      notification: {
        title: "Hello",
        body: "World",
      },
    });
    console.log("Success!\n");
    console.log(messageId);
  } catch (error) {
    console.log(error);
  }
}

main();
