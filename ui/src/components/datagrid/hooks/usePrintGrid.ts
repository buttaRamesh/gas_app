/**
 * usePrintGrid - Manages DataGrid print functionality
 *
 * Handles generating printable HTML and triggering print dialog
 */
import { useCallback } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

interface UsePrintGridOptions {
  processedColumns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  pageTitle: string;
}

export function usePrintGrid({
  processedColumns,
  columnVisibilityModel,
  pageTitle,
}: UsePrintGridOptions) {
  const handlePrint = useCallback(
    (rows: any[]) => {
      // Get visible columns (exclude actions and UI-only columns)
      const printColumns = processedColumns
        .filter((col) => columnVisibilityModel[col.field] !== false)
        .filter((col) => {
          if (col.field === 'actions') return false;
          if (col.sortable === false && col.filterable === false) return false;
          return true;
        });

      // Generate print content HTML
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${pageTitle} - Print</title>
            <style>
              @media print {
                @page {
                  size: portrait;
                  margin: 0.4in 0.5in;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
                thead { display: table-header-group; }
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 11pt;
                padding: 5px;
              }
              .print-header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 2px solid #003366;
                padding-bottom: 8px;
              }
              .print-header h1 {
                margin: 0;
                color: #003366;
                font-size: 18pt;
                font-weight: bold;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
              }
              thead {
                background-color: #003366 !important;
                color: white !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th {
                padding: 6px 5px;
                text-align: left;
                font-weight: bold;
                border: 1px solid #999;
                font-size: 10pt;
                background-color: #003366 !important;
                color: white !important;
              }
              td {
                padding: 5px 5px;
                border: 1px solid #ccc;
                font-size: 10pt;
              }
              tbody tr:nth-child(even) {
                background-color: #f8f9fa !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              tbody tr:nth-child(odd) {
                background-color: white !important;
              }
            </style>
          </head>
          <body>
            <div class="print-header">
              <h1>${pageTitle}</h1>
            </div>
            <table>
              <thead>
                <tr>
                  ${printColumns.map((col) => `<th>${col.headerName || col.field}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) => `
                  <tr>
                    ${printColumns
                      .map((col) => {
                        let value = row[col.field];
                        if (typeof value === 'boolean') {
                          value = value ? 'Yes' : 'No';
                        }
                        if (value === null || value === undefined) {
                          value = '';
                        }
                        return `<td>${value}</td>`;
                      })
                      .join('')}
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create hidden iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Write content to iframe
      const iframeDoc = iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(printContent);
        iframeDoc.close();

        // Wait for content to load, then print
        iframe.contentWindow?.addEventListener('load', () => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        });
      }
    },
    [processedColumns, columnVisibilityModel, pageTitle]
  );

  return { handlePrint };
}
