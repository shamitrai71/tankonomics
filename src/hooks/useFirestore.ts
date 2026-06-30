import { 
  collection, 
  collectionGroup,
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  QueryConstraint
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useCollection<T>(path: string, constraints: QueryConstraint[] = [], enabled: boolean = true) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(collection(db, path), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      })) as T[];
      setData(items);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      handleFirestoreError(err, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [path, JSON.stringify(constraints), enabled]);

  return { data, loading, error };
}

export function useCollectionGroup<T>(collectionId: string, constraints: QueryConstraint[] = [], enabled: boolean = true) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const q = query(collectionGroup(db, collectionId), ...constraints);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      })) as T[];
      setData(items);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
      handleFirestoreError(err, OperationType.GET, `collectionGroup:${collectionId}`);
    });

    return () => unsubscribe();
  }, [collectionId, JSON.stringify(constraints), enabled]);

  return { data, loading, error };
}

export async function createDocument(path: string, data: any) {
  try {
    return await addDoc(collection(db, path), {
      ...data,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateDocument(path: string, id: string, data: any) {
  try {
    const ref = doc(db, path, id);
    return await updateDoc(ref, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function removeDocument(path: string, id: string) {
  try {
    const ref = doc(db, path, id);
    return await deleteDoc(ref);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${id}`);
  }
}
