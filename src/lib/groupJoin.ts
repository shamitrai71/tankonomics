/**
 * Joining a group, shared by the Groups list and the group page.
 * Public groups: joined at once. Private groups: a request an admin approves.
 * Members must be connected to a company (platform admins excepted); the
 * Firestore rules enforce the same.
 */
import { doc, setDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function joinGroup(group: any, user: any, profile: any, isPlatformAdmin: boolean): Promise<"joined" | "requested"> {
  const autoApprove = isPlatformAdmin || !group.isPrivate;
  await setDoc(doc(db, "group_members", `${group.id}_${user.uid}`), {
    groupId: group.id,
    userUid: user.uid,
    userName: profile?.displayName || user.displayName,
    userPhoto: profile?.photoURL || user.photoURL,
    userJobTitle: profile?.jobTitle || "",
    userCompany: profile?.company || "",
    role: autoApprove ? "member" : "pending",
    status: autoApprove ? "approved" : "pending",
    joinedAt: serverTimestamp(),
  });
  if (autoApprove) await updateDoc(doc(db, "groups", group.id), { memberCount: increment(1) });
  return autoApprove ? "joined" : "requested";
}
