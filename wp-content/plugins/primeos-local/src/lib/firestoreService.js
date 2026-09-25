// @ts-nocheck
/**
 * Cloud Firestore Data Service for PrimeOS
 * Provides high-level multi-tenant CRUD, query pipelines, and real-time listeners.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase.js";
import { getActiveTenantId } from "./tenantContext.ts";

/**
 * Resolve collection reference with multi-tenant awareness.
 * Structure: tenants/{tenantId}/{collectionName}
 */
export const getTenantCollectionRef = (collectionName, customTenantId = null) => {
  const tenantId = customTenantId || getActiveTenantId() || "prime-odonto-default";
  return collection(db, "tenants", tenantId, collectionName);
};

/**
 * Fetch a single document by ID within active tenant context.
 */
export const getDocument = async (collectionName, id, customTenantId = null) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, customTenantId);
    const docRef = doc(colRef, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error(`[FirestoreService] getDocument error for ${collectionName}/${id}:`, error);
    throw error;
  }
};

/**
 * List documents with filtering, ordering, and pagination.
 */
export const listDocuments = async (collectionName, options = {}) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, options.tenantId);
    const queryConstraints = [];

    // Filter clauses: e.g. [['status', '==', 'active'], ['type', '==', 'lead']]
    if (Array.isArray(options.filters)) {
      for (const [field, op, val] of options.filters) {
        if (field && op && val !== undefined) {
          queryConstraints.push(where(field, op, val));
        }
      }
    }

    // Single filter shorthand: { status: 'active' }
    if (options.where && typeof options.where === "object") {
      for (const [key, val] of Object.entries(options.where)) {
        if (val !== undefined) {
          queryConstraints.push(where(key, "==", val));
        }
      }
    }

    // Sort
    if (options.orderByField) {
      queryConstraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
    }

    // Pagination
    if (options.startAfterDoc) {
      queryConstraints.push(startAfter(options.startAfterDoc));
    }

    if (options.limit && typeof options.limit === "number") {
      queryConstraints.push(firestoreLimit(options.limit));
    }

    const q = query(colRef, ...queryConstraints);
    const snapshot = await getDocs(q);

    const items = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() });
    });

    return {
      items,
      count: items.length,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
      empty: snapshot.empty,
    };
  } catch (error) {
    console.error(`[FirestoreService] listDocuments error for ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Create a new document in the active tenant collection.
 */
export const createDocument = async (collectionName, data, customId = null, customTenantId = null) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, customTenantId);
    const payload = {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      tenant_id: customTenantId || getActiveTenantId() || "prime-odonto-default",
    };

    if (customId) {
      const docRef = doc(colRef, customId);
      await setDoc(docRef, payload, { merge: true });
      return { id: customId, ...payload };
    } else {
      const docRef = await addDoc(colRef, payload);
      return { id: docRef.id, ...payload };
    }
  } catch (error) {
    console.error(`[FirestoreService] createDocument error in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update an existing document.
 */
export const updateDocument = async (collectionName, id, data, customTenantId = null) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, customTenantId);
    const docRef = doc(colRef, id);
    const payload = {
      ...data,
      updated_at: serverTimestamp(),
    };
    await updateDoc(docRef, payload);
    return { id, ...payload };
  } catch (error) {
    console.error(`[FirestoreService] updateDocument error for ${collectionName}/${id}:`, error);
    throw error;
  }
};

/**
 * Delete a document by ID.
 */
export const deleteDocument = async (collectionName, id, customTenantId = null) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, customTenantId);
    const docRef = doc(colRef, id);
    await deleteDoc(docRef);
    return { id, deleted: true };
  } catch (error) {
    console.error(`[FirestoreService] deleteDocument error for ${collectionName}/${id}:`, error);
    throw error;
  }
};

/**
 * Real-time subscription to a collection.
 * Returns an unsubscribe callback function.
 */
export const subscribeCollection = (collectionName, callback, options = {}) => {
  try {
    const colRef = getTenantCollectionRef(collectionName, options.tenantId);
    const queryConstraints = [];

    if (options.orderByField) {
      queryConstraints.push(orderBy(options.orderByField, options.orderDirection || "asc"));
    }
    if (options.limit) {
      queryConstraints.push(firestoreLimit(options.limit));
    }

    const q = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;

    return onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((d) => items.push({ id: d.id, ...d.data() }));
        callback(items, null);
      },
      (error) => {
        console.error(`[FirestoreService] subscribeCollection error on ${collectionName}:`, error);
        callback([], error);
      }
    );
  } catch (err) {
    console.error(`[FirestoreService] subscribe error on ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Batch Upsert: writes up to 500 documents in atomic batches.
 */
export const batchUpsert = async (collectionName, items = [], customTenantId = null) => {
  if (!items || items.length === 0) return { inserted: 0 };
  const tenantId = customTenantId || getActiveTenantId() || "prime-odonto-default";
  const colRef = collection(db, "tenants", tenantId, collectionName);

  let batch = writeBatch(db);
  let count = 0;
  let totalCommitted = 0;

  for (const item of items) {
    const id = item.id ? String(item.id) : doc(colRef).id;
    const docRef = doc(colRef, id);
    batch.set(
      docRef,
      {
        ...item,
        tenant_id: tenantId,
        updated_at: serverTimestamp(),
      },
      { merge: true }
    );
    count++;

    if (count === 490) {
      await batch.commit();
      totalCommitted += count;
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    totalCommitted += count;
  }

  return { inserted: totalCommitted };
};

export default {
  getTenantCollectionRef,
  getDocument,
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  subscribeCollection,
  batchUpsert,
};
