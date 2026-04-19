import React from 'react';
import db from '../configs/firebase-config';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit as fbLimit,
  type OrderByDirection,
  type WhereFilterOp,
} from 'firebase/firestore';


type Condition = {
  fieldName: string;
  operator: WhereFilterOp;
  compareValue: unknown;
};

const useFirebaseFireStore = (
  collectionName: string,
  condition?: Condition,
  sort: OrderByDirection = 'desc',
  limitNum: number = 50
): Record<string, unknown>[] => {
  const [docs, setDocs] = React.useState<Record<string, unknown>[]>([]);

  React.useEffect(() => {
    const collectionRef = collection(db, collectionName);

    let q = query(collectionRef, orderBy('createdAt', sort), fbLimit(limitNum));

    if (condition) {
      if (!condition.compareValue) {
        setDocs([]);
        return;
      }

      q = query(
        collectionRef,
        where(condition.fieldName, condition.operator, condition.compareValue),
        orderBy('createdAt', sort)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setDocs(documents as Record<string, unknown>[]);
    });

    return unsubscribe;
  }, [collectionName, condition, limitNum, sort]);

  return docs;
};

export default useFirebaseFireStore;

