import { createDocument } from "./useFirestore";
import { serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase";

export function useNotifications() {
  const sendNotification = async (recipientUid: string, title: string, message: string, type: string = "info", link?: string, metadata?: any) => {
    try {
      await createDocument("notifications", {
        recipientUid,
        title,
        message,
        type,
        link,
        metadata,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const notifyConnectionRequest = (recipientUid: string, senderName: string, connectionId: string) => {
    return sendNotification(
      recipientUid,
      "New Connection Request",
      `${senderName} wants to connect with you.`,
      "connection",
      `/profile/${auth.currentUser?.uid}`,
      { connectionId }
    );
  };

  const notifyConnectionAccepted = (recipientUid: string, senderName: string) => {
    return sendNotification(
      recipientUid,
      "Connection Accepted",
      `${senderName} accepted your connection request.`,
      "connection"
    );
  };

  return {
    sendNotification,
    createNotification: sendNotification,
    notifyConnectionRequest,
    notifyConnectionAccepted
  };
}
