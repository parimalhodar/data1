import React from 'react';
import ExcelJS from 'exceljs';
import { DuplicateRemover } from './DuplicateRemover';
import { PivotTableGenerator } from './PivotTables';

export class CourtCaseProcessor {
  constructor() {
    this.duplicateRemover = new DuplicateRemover();
    this.pivotTableGenerator = new PivotTableGenerator();
  }

  async processFile(file) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.read(file);
      
      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        throw new Error('No worksheet found in the Excel file');
      }

      // Convert worksheet to array of objects
      const headers = [];
      const data = [];
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // First row is headers
          row.eachCell((cell) => {
            headers.push(cell.value);
          });
        } else {
          // Data rows
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber - 1]] = cell.value;
          });
          data.push(rowData);
        }
      });

      // Remove duplicates
      const uniqueData = this.duplicateRemover.removeDuplicates(data, 'UID');
      
      // Create new workbook with processed data
      const newWorkbook = new ExcelJS.Workbook();
      const newWorksheet = newWorkbook.addWorksheet('Processed Data');
      
      // Add headers
      newWorksheet.addRow(headers);
      
      // Add processed data
      uniqueData.forEach(row => {
        newWorksheet.addRow(Object.values(row));
      });
      
      // Add pivot tables
      await this.pivotTableGenerator.addPivotTablesToWorkbook(newWorkbook, uniqueData);
      
      // Generate buffer
      const buffer = await newWorkbook.xlsx.writeBuffer();
      
      return {
        buffer,
        stats: this.duplicateRemover.getStats(),
        totalRecords: data.length,
        uniqueRecords: uniqueData.length
      };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }
}

export default CourtCaseProcessor; 