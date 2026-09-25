import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase SDK
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
  getApps: vi.fn(() => [{ name: '[DEFAULT]' }]),
  getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => {
  const dummyDoc = { id: 'doc-123', data: () => ({ name: 'Test Record', status: 'active' }) };
  return {
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn((db, ...path) => ({ path: path.join('/') })),
    doc: vi.fn((colRef, id) => ({ id: id || 'generated-id', path: `${colRef.path}/${id}` })),
    getDoc: vi.fn((docRef) => Promise.resolve({
      exists: () => true,
      id: docRef.id,
      data: () => ({ name: 'Test Record' })
    })),
    getDocs: vi.fn(() => Promise.resolve({
      empty: false,
      docs: [dummyDoc],
      forEach: (cb) => [dummyDoc].forEach(cb)
    })),
    setDoc: vi.fn(() => Promise.resolve()),
    addDoc: vi.fn(() => Promise.resolve({ id: 'new-doc-id' })),
    updateDoc: vi.fn(() => Promise.resolve()),
    deleteDoc: vi.fn(() => Promise.resolve()),
    query: vi.fn((colRef) => colRef),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    orderBy: vi.fn((field, dir) => ({ field, dir })),
    limit: vi.fn((n) => ({ limit: n })),
    startAfter: vi.fn((doc) => ({ startAfter: doc })),
    onSnapshot: vi.fn((q, onNext) => {
      onNext({ docs: [dummyDoc], forEach: (cb) => [dummyDoc].forEach(cb) });
      return vi.fn(); // unsubscribe
    }),
    serverTimestamp: vi.fn(() => 'MOCK_TIMESTAMP'),
    writeBatch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn(() => Promise.resolve())
    }))
  };
});

describe('Firebase & Firestore Modular Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports valid firebase instances and config', async () => {
    const { app, db, auth, storage, isFirebaseConfigured, firebaseConfig } = await import('../firebase.js');
    expect(app).toBeDefined();
    expect(db).toBeDefined();
    expect(auth).toBeDefined();
    expect(storage).toBeDefined();
    expect(firebaseConfig.projectId).toBeTruthy();
    expect(typeof firebaseConfig.projectId).toBe('string');
  });

  it('generates multi-tenant collection references', async () => {
    const { getTenantCollectionRef } = await import('../firestoreService.js');
    const ref = getTenantCollectionRef('patients', 'tenant-clinica-prime');
    expect(ref.path).toBe('tenants/tenant-clinica-prime/patients');
  });

  it('fetches a document by id with multi-tenant context', async () => {
    const { getDocument } = await import('../firestoreService.js');
    const doc = await getDocument('patients', 'doc-123', 'tenant-1');
    expect(doc).toBeDefined();
    expect(doc.id).toBe('doc-123');
    expect(doc.name).toBe('Test Record');
  });

  it('lists documents with query options', async () => {
    const { listDocuments } = await import('../firestoreService.js');
    const result = await listDocuments('leads', {
      where: { status: 'open' },
      limit: 10,
      tenantId: 'tenant-1'
    });
    expect(result.items).toHaveLength(1);
    expect(result.empty).toBe(false);
  });

  it('creates documents with automatic timestamps and tenant isolation', async () => {
    const { createDocument } = await import('../firestoreService.js');
    const created = await createDocument('appointments', { procedure: 'Invisalign' }, 'custom-apt-1', 'tenant-1');
    expect(created.id).toBe('custom-apt-1');
    expect(created.procedure).toBe('Invisalign');
    expect(created.tenant_id).toBe('tenant-1');
  });

  it('updates documents', async () => {
    const { updateDocument } = await import('../firestoreService.js');
    const updated = await updateDocument('appointments', 'custom-apt-1', { status: 'confirmed' });
    expect(updated.id).toBe('custom-apt-1');
    expect(updated.status).toBe('confirmed');
  });

  it('deletes documents', async () => {
    const { deleteDocument } = await import('../firestoreService.js');
    const res = await deleteDocument('appointments', 'custom-apt-1');
    expect(res.deleted).toBe(true);
  });

  it('subscribes to collection changes via real-time listener', async () => {
    const { subscribeCollection } = await import('../firestoreService.js');
    const callback = vi.fn();
    const unsubscribe = subscribeCollection('patients', callback, { tenantId: 'tenant-1' });
    expect(typeof unsubscribe).toBe('function');
    expect(callback).toHaveBeenCalledWith(expect.any(Array), null);
  });

  it('batches upserts in atomic chunks', async () => {
    const { batchUpsert } = await import('../firestoreService.js');
    const result = await batchUpsert('patients', [{ id: 'p1', name: 'Ana' }, { id: 'p2', name: 'Carlos' }]);
    expect(result.inserted).toBe(2);
  });
});
