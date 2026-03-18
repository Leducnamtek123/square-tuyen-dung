import React from 'react';
import db from '../configs/firebase-config';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  type OrderByDirection,
  type WhereFilterOp,
} from 'firebase/firestore';

type AnyRecord = Record<string, unknown>;

type Condition = {
  fieldName: string;
  operator: WhereFilterOp;
  compareValue: unknown;
};

const useFirebaseFireStore = (
  collectionName: string,
  condition?: Condition,
  sort: OrderByDirection = 'desc'
): AnyRecord[] => {
  const [docs, setDocs] = React.useState<AnyRecord[]>([]);

  React.useEffect(() => {
    const collectionRef = collection(db, collectionName);

    let q = query(collectionRef, orderBy('createdAt', sort));

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

      setDocs(documents as AnyRecord[]);
    });

    return unsubscribe;
  }, [collectionName, condition, sort]);

  return docs;
};

export default useFirebaseFireStore;
