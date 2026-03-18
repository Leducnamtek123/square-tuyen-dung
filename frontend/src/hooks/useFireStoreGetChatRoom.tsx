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
} from 'firebase/firestore';
import db from '../configs/firebase-config';
import { getUserAccount } from '../services/firebaseService';

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
      const chatRoomsData: AnyRecord[] = [];

      const promises = querySnapshot.docs.map(async (doc) => {
        try {
          let partnerId = '';

          const chatRoomData = doc.data() as AnyRecord;

          if (chatRoomData?.userId1 === `${userId}`) {
            partnerId = chatRoomData?.userId2 as string;
          } else {
            partnerId = chatRoomData?.userId1 as string;
          }

          const userAccount = await getUserAccount('accounts', `${partnerId}`);

          chatRoomsData.push({
            ...chatRoomData,
            id: doc.id,
            user: userAccount,
          });
        } catch (error) {
          console.error(error);
        }
      });

      await Promise.all(promises);

      setDocs(chatRoomsData);
    });

    return unsubscribe;

     
  }, [condition, sort, limitNum, userId]);

  return docs;
};

export default useFireStoreGetChatRoom;
