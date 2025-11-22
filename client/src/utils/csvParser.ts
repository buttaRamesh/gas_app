/**
 * CSV/Excel Parser Utilities
 * Utilities for extracting column names and validating file structure
 */

import * as XLSX from 'xlsx';
import type { ExtractedColumnsResult, MismatchResult } from '../types/orderbook';

/**
 * Extract column names from a CSV or Excel file
 * @param file - The file to extract columns from
 * @returns Promise with column names array
 */
export async function extractColumnNames(file: File): Promise<ExtractedColumnsResult> {
  try {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.csv')) {
      return await extractCSVColumns(file);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return await extractExcelColumns(file);
    } else {
      return {
        columns: [],
        success: false,
        error: 'Unsupported file format. Please upload CSV or Excel files.',
      };
    }
  } catch (error) {
    return {
      columns: [],
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extract column names from CSV file
 * Intelligently detects the header row (may not be first row)
 */
async function extractCSVColumns(file: File): Promise<ExtractedColumnsResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim().length === 0) {
          resolve({
            columns: [],
            success: false,
            error: 'CSV file is empty',
          });
          return;
        }

        // Get first 30 lines for header detection
        const lines = text.split('\n').slice(0, 30);

        if (lines.length === 0) {
          resolve({
            columns: [],
            success: false,
            error: 'Could not read CSV file',
          });
          return;
        }

        // Detect header row using column consistency
        const headerRowIndex = detectCSVHeaderRow(lines);

        if (headerRowIndex === -1 || headerRowIndex >= lines.length) {
          resolve({
            columns: [],
            success: false,
            error: 'Could not detect header row in CSV file',
          });
          return;
        }

        // Parse CSV header (handle quoted columns)
        const headerLine = lines[headerRowIndex];
        const columns = parseCSVLine(headerLine);


        // Validate columns
        if (columns.length === 0) {
          resolve({
            columns: [],
            success: false,
            error: 'No columns found in CSV header',
          });
          return;
        }

        // Check for duplicate column names
        const duplicates = findDuplicates(columns);
        if (duplicates.length > 0) {
          resolve({
            columns,
            success: true,
            error: `Warning: Duplicate column names found: ${duplicates.join(', ')}`,
          });
          return;
        }

        let message = undefined;
        if (headerRowIndex > 0) {
          message = `Header row detected at row ${headerRowIndex + 1} (skipped ${headerRowIndex} row(s))`;
        }

        resolve({
          columns,
          success: true,
          error: message,
        });
      } catch (error) {
        resolve({
          columns: [],
          success: false,
          error: error instanceof Error ? error.message : 'Error parsing CSV',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        columns: [],
        success: false,
        error: 'Error reading file',
      });
    };

    // Read first 10KB to ensure we get enough rows for header detection
    const blob = file.slice(0, 10240);
    reader.readAsText(blob);
  });
}

/**
 * Extract column names from Excel file
 * Intelligently detects the header row (may not be first row)
 */
async function extractExcelColumns(file: File): Promise<ExtractedColumnsResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            columns: [],
            success: false,
            error: 'Could not read Excel file',
          });
          return;
        }

        // Parse Excel file
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({
            columns: [],
            success: false,
            error: 'Excel file has no sheets',
          });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

        // Try to detect header row by analyzing first 10 rows
        const headerRow = detectHeaderRow(worksheet, range);

        if (headerRow === -1) {
          resolve({
            columns: [],
            success: false,
            error: 'Could not detect header row in Excel file',
          });
          return;
        }

        // Extract columns from detected header row
        const columns: string[] = [];
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: headerRow, c: col });
          const cell = worksheet[cellAddress];
          const value = cell ? String(cell.v).trim() : '';

          if (value) {
            columns.push(value);
          }
        }

        // Validate columns
        if (columns.length === 0) {
          resolve({
            columns: [],
            success: false,
            error: 'No columns found in Excel header row',
          });
          return;
        }

        // Check for duplicate column names
        const duplicates = findDuplicates(columns);
        if (duplicates.length > 0) {
          resolve({
            columns,
            success: true,
            error: `Warning: Duplicate column names found: ${duplicates.join(', ')}`,
          });
          return;
        }

        let message = undefined;
        if (headerRow > 0) {
          message = `Header row detected at row ${headerRow + 1} (skipped ${headerRow} row(s))`;
        }

        resolve({
          columns,
          success: true,
          error: message,
        });
      } catch (error) {
        resolve({
          columns: [],
          success: false,
          error: error instanceof Error ? error.message : 'Error parsing Excel file',
        });
      }
    };

    reader.onerror = () => {
      resolve({
        columns: [],
        success: false,
        error: 'Error reading file',
      });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Detect header row in CSV using column count consistency
 * Analyzes first 30 lines and finds where consistent column count begins
 */
function detectCSVHeaderRow(lines: string[]): number {
  const rowData: Array<{
    index: number;
    columnCount: number;
    textCount: number;
    numericCount: number;
    isMostlyText: boolean;
  }> = [];

  // Analyze each line
  lines.forEach((line, idx) => {
    if (!line.trim()) return; // Skip empty lines

    const columns = parseCSVLine(line);
    const nonEmptyCount = columns.filter(col => col.trim()).length;

    if (nonEmptyCount === 0) return; // Skip if no data

    // Count text vs numeric columns
    let textCount = 0;
    let numericCount = 0;

    columns.forEach(col => {
      const trimmed = col.trim();
      if (trimmed) {
        if (!isNaN(Number(trimmed)) && trimmed !== '') {
          numericCount++;
        } else {
          textCount++;
        }
      }
    });

    rowData.push({
      index: idx,
      columnCount: nonEmptyCount,
      textCount,
      numericCount,
      isMostlyText: textCount > numericCount,
    });
  });

  if (rowData.length === 0) return -1;

  // Find column counts that repeat (indicating data structure, not metadata)
  const columnCounts = rowData.map(r => r.columnCount);
  const countFrequency = new Map<number, number>();
  columnCounts.forEach(count => {
    countFrequency.set(count, (countFrequency.get(count) || 0) + 1);
  });

  // Filter to counts that appear at least 2 times (indicates repeating data)
  // AND prioritize higher column counts (actual data usually has more columns than metadata)
  const repeatingCounts = Array.from(countFrequency.entries())
    .filter(([, freq]) => freq >= 2)
    .map(([count, freq]) => ({ count, freq }));

  let mostCommonCount = 0;

  if (repeatingCounts.length > 0) {
    // Sort by: 1) column count (descending), 2) frequency (descending)
    // This prioritizes rows with MORE columns that also repeat
    repeatingCounts.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.freq - a.freq;
    });
    mostCommonCount = repeatingCounts[0].count;
  } else {
    // Fallback: prioritize higher column counts even if they appear only once
    // Data rows typically have more columns than metadata rows
    const allCounts = Array.from(countFrequency.entries())
      .map(([count, freq]) => ({ count, freq }));
    allCounts.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.freq - a.freq;
    });
    mostCommonCount = allCounts[0].count;
  }

  // Find first row with consistent count that is mostly text
  for (const row of rowData) {
    if (row.columnCount === mostCommonCount) {
      if (row.isMostlyText) {
        return row.index;
      }
      // If first consistent row is numeric, check previous row
      if (row.index > 0) {
        const prevRow = rowData.find(r => r.index === row.index - 1);
        if (prevRow && prevRow.isMostlyText) {
          return prevRow.index;
        }
      }
      // Use this row anyway
      return row.index;
    }
  }

  // Fallback: return first row with most common count
  for (const row of rowData) {
    if (row.columnCount === mostCommonCount) {
      return row.index;
    }
  }

  return 0; // Final fallback
}

/**
 * Detect which row contains the actual column headers in Excel
 * Uses column count consistency to find where data actually starts
 */
function detectHeaderRow(worksheet: any, range: any): number {
  const maxRowsToCheck = Math.min(30, range.e.r + 1);

  const rowData: Array<{
    index: number;
    columnCount: number;
    textCount: number;
    numericCount: number;
    isMostlyText: boolean;
  }> = [];

  // Analyze each row
  for (let row = 0; row < maxRowsToCheck; row++) {
    let cellCount = 0;
    let textCount = 0;
    let numericCount = 0;

    // Read all cells in this row
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];

      if (cell && cell.v !== null && cell.v !== undefined) {
        const value = String(cell.v).trim();
        if (value) {
          cellCount++;

          // Check if cell is text or numeric
          if (typeof cell.v === 'number' || !isNaN(Number(value))) {
            numericCount++;
          } else {
            textCount++;
          }
        }
      }
    }

    // Skip empty rows
    if (cellCount === 0) continue;

    rowData.push({
      index: row,
      columnCount: cellCount,
      textCount,
      numericCount,
      isMostlyText: textCount > numericCount,
    });
  }

  if (rowData.length === 0) return -1;

  // Find column counts that repeat (indicating data structure, not metadata)
  const columnCounts = rowData.map(r => r.columnCount);
  const countFrequency = new Map<number, number>();
  columnCounts.forEach(count => {
    countFrequency.set(count, (countFrequency.get(count) || 0) + 1);
  });

  // Filter to counts that appear at least 2 times (indicates repeating data)
  // AND prioritize higher column counts (actual data usually has more columns than metadata)
  const repeatingCounts = Array.from(countFrequency.entries())
    .filter(([, freq]) => freq >= 2)
    .map(([count, freq]) => ({ count, freq }));

  let mostCommonCount = 0;

  if (repeatingCounts.length > 0) {
    // Sort by: 1) column count (descending), 2) frequency (descending)
    // This prioritizes rows with MORE columns that also repeat
    repeatingCounts.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.freq - a.freq;
    });
    mostCommonCount = repeatingCounts[0].count;
  } else {
    // Fallback: prioritize higher column counts even if they appear only once
    // Data rows typically have more columns than metadata rows
    const allCounts = Array.from(countFrequency.entries())
      .map(([count, freq]) => ({ count, freq }));
    allCounts.sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.freq - a.freq;
    });
    mostCommonCount = allCounts[0].count;
  }

  // Find first row with consistent count that is mostly text
  for (const row of rowData) {
    if (row.columnCount === mostCommonCount) {
      if (row.isMostlyText) {
        return row.index;
      }
      // If first consistent row is numeric, check previous row
      if (row.index > 0) {
        const prevRow = rowData.find(r => r.index === row.index - 1);
        if (prevRow && prevRow.isMostlyText) {
          return prevRow.index;
        }
      }
      // Use this row anyway
      return row.index;
    }
  }

  // Fallback: return first row with most common count
  for (const row of rowData) {
    if (row.columnCount === mostCommonCount) {
      return row.index;
    }
  }

  return 0; // Final fallback
}

/**
 * Parse a CSV line handling quoted fields
 * @param line - CSV line to parse
 * @returns Array of column names
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last column
  if (current || line.endsWith(',')) {
    columns.push(current.trim());
  }

  return columns.filter(col => col.length > 0);
}

/**
 * Find duplicate values in an array
 */
function findDuplicates(arr: string[]): string[] {
  const counts = new Map<string, number>();
  arr.forEach(item => {
    counts.set(item, (counts.get(item) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([item]) => item);
}

/**
 * Compare current CSV columns with saved mapping
 * @param csvColumns - Columns from current CSV file
 * @param savedMapping - Previously saved column mapping
 * @returns Comparison result with differences
 */
export function compareColumnMappings(
  csvColumns: string[],
  savedMapping: Record<string, string>
): MismatchResult {
  // Get CSV columns from saved mapping (values of the mapping object)
  const savedCsvColumns = Object.values(savedMapping).filter(col => col);

  // Find columns in saved mapping but not in current CSV
  const missingColumns = savedCsvColumns.filter(
    col => !csvColumns.includes(col)
  );

  // Find columns in current CSV but not in saved mapping
  const newColumns = csvColumns.filter(
    col => !savedCsvColumns.includes(col)
  );

  const hasChanges = missingColumns.length > 0 || newColumns.length > 0;

  // Build message
  const messageParts: string[] = [];
  if (missingColumns.length > 0) {
    messageParts.push(`Missing columns: ${missingColumns.join(', ')}`);
  }
  if (newColumns.length > 0) {
    messageParts.push(`New columns: ${newColumns.join(', ')}`);
  }

  const message = messageParts.length > 0
    ? messageParts.join('. ')
    : 'No changes detected';

  return {
    has_changes: hasChanges,
    missing_columns: missingColumns,
    new_columns: newColumns,
    message,
  };
}

/**
 * Validate CSV file structure
 * @param file - File to validate
 * @returns Promise with validation result
 */
export async function validateCsvStructure(file: File): Promise<{
  valid: boolean;
  error?: string;
}> {
  const result = await extractColumnNames(file);

  if (!result.success) {
    return {
      valid: false,
      error: result.error,
    };
  }

  if (result.columns.length === 0) {
    return {
      valid: false,
      error: 'File has no columns',
    };
  }

  return {
    valid: true,
  };
}
