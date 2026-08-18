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

  const conditionField = condition?.fieldName;
  const conditionOperator = condition?.operator;
  const conditionValue = condition?.compareValue;

  React.useEffect(() => {
    if (hasInvalidCondition) {
      return;
    }

    let isMounted = true;
    const collectionRef = collection(db, collectionName);

    let q = query(collectionRef, orderBy('createdAt', sort), fbLimit(limitNum));

    if (conditionField && conditionOperator && conditionValue !== undefined) {
      q = query(
        collectionRef,
        where(conditionField, conditionOperator, conditionValue),
        orderBy('createdAt', sort)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!isMounted) return;
      const documents = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as T[];

      setDocs(documents);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [collectionName, conditionField, conditionOperator, conditionValue, hasInvalidCondition, limitNum, sort]);

  return hasInvalidCondition ? [] : docs;
};

export default useFirebaseFireStore;

