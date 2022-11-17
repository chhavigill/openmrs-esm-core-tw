import { encryption, encrypt } from './encryption';
import "fake-indexeddb/auto";
import {
  getFullSynchronizationItems,
  getFullSynchronizationItemsFor,
  getSynchronizationItems,
  getSynchronizationItemsFor,
  QueueItemDescriptor,
  queueSynchronizationItem,
  queueSynchronizationItemFor,
  deleteSynchronizationItem,
  getSynchronizationItem,
} from "./sync";
import { OfflineDb } from "./offline-db";

jest.mock("@openmrs/esm-offline/src/encryption", () => ({
  encryption: true,
  encrypt: jest.fn().mockRejectedValue(new Error("Encryption password not set. Offline features are disabled."))
}))

interface MockSyncItem {
  encrypted: boolean;
  value: number;
}

const mockUserId = "00000000-0000-0000-0000-000000000000";
const mockSyncItemType = "mock-sync-item";
const defaultMockSyncItem: MockSyncItem = {
  encrypted: true,
  value: 123,
};
const defaultMockSyncItemDescriptor: QueueItemDescriptor = {
  dependencies: [],
  id: "123",
  displayName: "Mock Sync Item",
  patientUuid: "00000000-0000-0000-0000-000000000001",
};

jest.mock("@openmrs/esm-api", () => ({
  getLoggedInUser: jest.fn(async () => ({ uuid: mockUserId })),
}));

afterEach(async () => {
  // We want each test case to start fresh with a clean sync queue.
  await new OfflineDb().syncQueue.clear();
});

describe("Sync Queue", () => {
  it("throws error if encryption key is not set when trying to enqueue an item", async () => {
    await expect(queueSynchronizationItemFor(
      mockUserId,
      mockSyncItemType,
      defaultMockSyncItem,
      defaultMockSyncItemDescriptor
    )).rejects.toThrow(Error("Encryption password not set. Offline features are disabled."));
  });
});