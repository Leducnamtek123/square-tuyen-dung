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
  compareValue: string | number | boolean | null;
};

type FirestoreDoc = {
  id: string;
};

const useFirebaseFireStore = <T extends FirestoreDoc = FirestoreDoc>(
  collectionName: string,
  condition?: Condition,
  sort: OrderByDirection = 'desc',
  limitNum: number = 50
): T[] => {
  const [docs, setDocs] = React.useState<T[]>([]);
  const hasInvalidCondition = Boolean(condition && !condition.compareValue);

  React.useEffect(() => {
    if (hasInvalidCondition) {
      return;
    }

    const collectionRef = collection(db, collectionName);

    let q = query(collectionRef, orderBy('createdAt', sort), fbLimit(limitNum));

    if (condition) {
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
      })) as T[];

      setDocs(documents);
    });

    return unsubscribe;
  }, [collectionName, condition, hasInvalidCondition, limitNum, sort]);

  return hasInvalidCondition ? [] : docs;
};

export default useFirebaseFireStore;

