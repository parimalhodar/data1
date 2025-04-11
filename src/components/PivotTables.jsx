import React from 'react';
import ExcelJS from 'exceljs';

export class PivotTableGenerator {
  constructor() {
    this.pivotConfigs = [
      {
        name: 'Status Summary',
        rows: ['STATUS'],
        values: ['UID'],
        valueFunction: 'count',
      },
      {
        name: 'Age Category Summary',
        rows: ['AGE CAT1'],
        values: ['UID'],
        valueFunction: 'count',
      },
      {
        name: 'Case Type Summary',
        rows: ['CAT1'],
        values: ['UID'],
        valueFunction: 'count',
      },
      {
        name: 'Stage Summary',
        rows: ['STAGE'],
        values: ['UID'],
        valueFunction: 'count',
      },
      {
        name: 'Side Summary',
        rows: ['SIDE'],
        values: ['UID'],
        valueFunction: 'count',
      },
    ];
  }

  generatePivotTable(data, config) {
    const { rows, values, valueFunction } = config;
    const pivotData = new Map();
    const totals = { count: 0, sum: 0 };

    // Process data
    data.forEach((record) => {
      const rowKey = rows.map((field) => record[field] || 'Unknown').join('|');
      
      if (!pivotData.has(rowKey)) {
        pivotData.set(rowKey, {
          count: 0,
          sum: 0,
          values: [],
        });
      }

      const stats = pivotData.get(rowKey);
      values.forEach((valueField) => {
        const value = record[valueField];
        if (value !== undefined && value !== null) {
          stats.values.push(value);
          stats.count++;
          totals.count++;
          if (typeof value === 'number') {
            stats.sum += value;
            totals.sum += value;
          }
        }
      });
    });

    // Convert to array format
    const result = Array.from(pivotData.entries()).map(([key, stats]) => {
      const rowValues = key.split('|');
      const row = {};
      
      rows.forEach((field, index) => {
        row[field] = rowValues[index];
      });

      if (valueFunction === 'count') {
        row['Count'] = stats.count;
      } else if (valueFunction === 'sum') {
        row['Sum'] = stats.sum;
      } else if (valueFunction === 'avg') {
        row['Average'] = stats.count > 0 ? stats.sum / stats.count : 0;
      }

      return row;
    });

    // Add total row
    const totalRow = {};
    rows.forEach(field => totalRow[field] = 'Total');
    if (valueFunction === 'count') {
      totalRow['Count'] = totals.count;
    } else if (valueFunction === 'sum') {
      totalRow['Sum'] = totals.sum;
    } else if (valueFunction === 'avg') {
      totalRow['Average'] = totals.count > 0 ? totals.sum / totals.count : 0;
    }
    result.push(totalRow);

    return result;
  }

  async addPivotTablesToWorkbook(workbook, data) {
    for (const config of this.pivotConfigs) {
      const pivotData = this.generatePivotTable(data, config);
      
      if (pivotData.length > 0) {
        const worksheet = workbook.addWorksheet(config.name);
        
        // Add headers
        const headers = Object.keys(pivotData[0]);
        worksheet.addRow(headers);
        
        // Add data rows
        pivotData.forEach(row => {
          worksheet.addRow(Object.values(row));
        });
        
        // Auto-fit columns
        worksheet.columns.forEach(column => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        });
      }
    }
  }
}

export default PivotTableGenerator; 