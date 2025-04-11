import React from 'react';

export class DuplicateRemover {
  constructor() {
    this.stats = {
      duplicatesFound: 0,
      duplicatesRemoved: 0,
      pendingRemoved: 0,
      disposeKept: 0,
    };
  }

  removeDuplicates(data, keyField) {
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid data provided to removeDuplicates');
      return [];
    }

    const uniqueRecords = new Map();
    const duplicates = new Map();

    data.forEach((record) => {
      const key = record[keyField];
      if (!key) {
        console.warn(`Record missing key field ${keyField}:`, record);
        return;
      }

      if (uniqueRecords.has(key)) {
        this.stats.duplicatesFound++;
        const existingRecord = uniqueRecords.get(key);
        const newRecord = record;

        // If existing record is PENDING and new record is DISPOSE, replace it
        if (existingRecord.STATUS === 'PENDING' && newRecord.STATUS === 'DISPOSE') {
          uniqueRecords.set(key, newRecord);
          this.stats.pendingRemoved++;
          this.stats.disposeKept++;
        }
        // If both are PENDING, keep the first one
        else if (existingRecord.STATUS === 'PENDING' && newRecord.STATUS === 'PENDING') {
          this.stats.duplicatesRemoved++;
        }
        // If both are DISPOSE, keep the first one
        else if (existingRecord.STATUS === 'DISPOSE' && newRecord.STATUS === 'DISPOSE') {
          this.stats.duplicatesRemoved++;
        }
        // If existing is DISPOSE and new is PENDING, keep the existing one
        else if (existingRecord.STATUS === 'DISPOSE' && newRecord.STATUS === 'PENDING') {
          this.stats.pendingRemoved++;
        }

        if (!duplicates.has(key)) {
          duplicates.set(key, [existingRecord]);
        }
        duplicates.get(key).push(newRecord);
      } else {
        uniqueRecords.set(key, record);
      }
    });

    return Array.from(uniqueRecords.values());
  }

  getStats() {
    return { ...this.stats };
  }
}

export default DuplicateRemover; 