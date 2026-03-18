import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDoc,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  increment,
} from 'firebase/firestore';

import db, { serverTimestamp } from '../configs/firebase-config';

type AnyRecord = Record<string, unknown>;

type IdType = string | number;

export const addDocument = async (
  collectionName: string,
  data: AnyRecord
): Promise<string> => {
  const queryRef = collection(db, collectionName);

  const docRef = await addDoc(queryRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

export const updateChatRoomByPartnerId = (
  partnerId: IdType,
  chatRoomId: IdType
): void => {
  const chatRoomDocRef = doc(db, 'chatRooms', `${chatRoomId}`);

  updateDoc(chatRoomDocRef, {
    unreadCount: increment(1),
    updatedAt: serverTimestamp(),
  });
};

export const checkExists = async (
  collectionName: string,
  docId: IdType
): Promise<boolean> => {
  const firestore = getFirestore();
  const documentRef = doc(firestore, collectionName, `${docId}`);
  const documentSnapshot = await getDoc(documentRef);
  return documentSnapshot.exists();
};

export const createUser = async (
  collectionName: string,
  userData: AnyRecord,
  userId: IdType
): Promise<boolean> => {
  try {
    const userRef = doc(db, collectionName, `${userId}`);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch {
    return false;
  }
};

export const checkChatRoomExists = async (
  collectionName: string,
  member1: IdType,
  member2: IdType
): Promise<string | null> => {
  const firestore = getFirestore();
  const chatRoomsRef = collection(firestore, collectionName);
  const q = query(
    chatRoomsRef,
    where('membersString', 'array-contains', `${member1}-${member2}`)
  );
  const querySnapshot = await getDocs(q);
  if (querySnapshot.size > 0) {
    const roomId = querySnapshot.docs[0].id;
    return roomId;
  }
  return null;
};

export const getChatRoomById = async (
  chatRoomId: IdType,
  currentUserId: IdType
): Promise<AnyRecord> => {
  const chatRoomRef = doc(db, 'chatRooms', `${chatRoomId}`);
  const docSnap = await getDoc(chatRoomRef);

  if (docSnap.exists()) {
    let partnerId = '';
    const chatRoomData = docSnap.data() as AnyRecord;

    const members = (chatRoomData.members as unknown as string[]) || [];
    if (members[0] === `${currentUserId}`) {
      partnerId = members[1] || '';
    } else {
      partnerId = members[0] || '';
    }

    const userAccount = await getUserAccount('accounts', `${partnerId}`);
    return {
      ...chatRoomData,
      id: docSnap.id,
      user: userAccount,
    } as AnyRecord;
  }

  return {} as AnyRecord;
};

export const getUserAccount = async (
  collectionName: string,
  userId: IdType
): Promise<AnyRecord | null> => {
  const userRef = doc(db, collectionName, `${userId}`);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    return docSnap.data() as AnyRecord;
  }

  return null;
};

// tao keywords cho displayName, su dung cho search
export const generateKeywords = (displayName: string): string[] => {
  // liet ke tat cac hoan vi. vd: name = ["David", "Van", "Teo"]
  // => ["David", "Van", "Teo"], ["David", "Teo", "Van"], ["Teo", "David", "Van"],...
  const name = displayName.split(' ').filter((word) => word);
  const length = name.length;
  const flagArray: boolean[] = [];
  const result: string[] = [];
  const stringArray: string[] = [];

  /**
   * khoi tao mang flag false
   * dung de danh dau xem gia tri
   * tai vi tri nay da duoc su dung
   * hay chua
   **/

  for (let i = 0; i < length; i++) {
    flagArray[i] = false;
  }

  const createKeywords = (value: string): string[] => {
    const arrName: string[] = [];
    let curName = '';
    value.split('').forEach((letter) => {
      curName += letter;
      arrName.push(curName);
    });
    return arrName;
  };

  function findPermutation(k: number) {
    for (let i = 0; i < length; i++) {
      if (!flagArray[i]) {
        flagArray[i] = true;
        result[k] = name[i];
        if (k === length - 1) {
          stringArray.push(result.join(' '));
        }
        findPermutation(k + 1);
        flagArray[i] = false;
      }
    }
  }

  findPermutation(0);

  const keywords = stringArray.reduce((acc, cur) => {
    const words = createKeywords(cur);
    return [...acc, ...words];
  }, [] as string[]);

  return keywords;
};
