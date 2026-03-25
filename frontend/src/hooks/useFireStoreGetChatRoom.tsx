import React from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type OrderByDirection,
  type WhereFilterOp,
  type QueryConstraint,
  getDocs,
  documentId,
} from 'firebase/firestore';
import db from '../configs/firebase-config';

type AnyRecord = Record<string, unknown>;

type Condition = {
  fieldName: string;
  operator: WhereFilterOp;
  compareValue: unknown;
};

const useFireStoreGetChatRoom = (
  condition: Condition | undefined,
  userId: string | number,
  sort: OrderByDirection = 'desc',
  limitNum: number | null = null
): AnyRecord[] => {
  const [docs, setDocs] = React.useState<AnyRecord[]>([]);

  React.useEffect(() => {
    const collectionRef = collection(db, 'chatRooms');

    const baseConstraints: QueryConstraint[] = [orderBy('createdAt', sort)];
    if (limitNum) {
      baseConstraints.push(limit(limitNum));
    }

    let q = query(collectionRef, ...baseConstraints);

    if (condition) {
      if (condition.compareValue === undefined || condition.compareValue === null) {
        setDocs([]);
        return;
      }

      q = query(
        collectionRef,
        where(condition.fieldName, condition.operator, condition.compareValue),
        ...baseConstraints
      );
    }

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Collect all partner IDs first
      const roomsData: { docId: string; data: AnyRecord; partnerId: string }[] = [];
      const partnerIds = new Set<string>();

      querySnapshot.docs.forEach((doc) => {
        const chatRoomData = doc.data() as AnyRecord;
        let partnerId = '';
        if (chatRoomData?.userId1 === `${userId}`) {
          partnerId = chatRoomData?.userId2 as string;
        } else {
          partnerId = chatRoomData?.userId1 as string;
        }
        partnerIds.add(partnerId);
        roomsData.push({ docId: doc.id, data: chatRoomData, partnerId });
      });

      // Batch fetch all partner accounts in one query (max 30 per `in` query)
      const userMap = new Map<string, AnyRecord>();
      const idArray = Array.from(partnerIds).filter(Boolean);

      if (idArray.length > 0) {
        const accountsRef = collection(db, 'accounts');
        // Firestore `in` supports max 30 items, chunk if needed
        const chunks: string[][] = [];
        for (let i = 0; i < idArray.length; i += 30) {
          chunks.push(idArray.slice(i, i + 30));
        }

        await Promise.all(
          chunks.map(async (chunk) => {
            try {
              const snap = await getDocs(
                query(accountsRef, where(documentId(), 'in', chunk))
              );
              snap.forEach((doc) => {
                userMap.set(doc.id, { ...doc.data(), id: doc.id });
              });
            } catch (error) {
              console.error('Error batch fetching accounts:', error);
            }
          })
        );
      }

      // Merge rooms with user data
      const chatRoomsData: AnyRecord[] = roomsData.map((room) => ({
        ...room.data,
        id: room.docId,
        user: userMap.get(room.partnerId) || null,
      }));

      setDocs(chatRoomsData);
    });

    return unsubscribe;
  }, [condition, sort, limitNum, userId]);

  return docs;
};

export default useFireStoreGetChatRoom;
