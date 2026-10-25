import { saveRecords } from '../shared/storage.mjs';

export function deleteRecord(storage, key, records, id) {
  const next = records.filter((record) => record.id !== id);
  return next;
}
