/**
 * Export Service - handles API calls and file downloads for exports
 */
import axiosInstance from '@/api/axiosInstance';
import type { ExportOptions, ExportFormat } from './types';

/**
 * Export data from a resource and trigger file download
 *
 * @param options - Export options
 * @throws Error if export fails
 */
export async function exportData(options: ExportOptions): Promise<void> {
  const { resource, format, visibleColumns, filters = {}, pageTitle } = options;

  try {
    // Track export timing
    const startTime = performance.now();
    console.log(`🚀 Export started at ${new Date().toLocaleTimeString()}`);

    // Make POST request to universal export endpoint
    const response = await axiosInstance.post(
      '/export/',
      {
        resource,
        export_format: format,
        visible_fields: visibleColumns,
        filters,
        page_title: pageTitle, // Pass page title for Excel/PDF
      },
      {
        responseType: 'blob',
        withCredentials: true, // Include authentication credentials
        timeout: 300000, // 5 minutes for large exports
        onDownloadProgress: (progressEvent) => {
          // Log progress to help debug timeout issues
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
          console.log(`📥 Export progress: ${progressEvent.loaded} bytes (${percentCompleted}%) - ${elapsed}s elapsed`);
        },
      }
    );

    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✅ Export completed in ${totalTime}s at ${new Date().toLocaleTimeString()}`);

    // Extract filename from Content-Disposition header or generate default
    const filename = extractFilename(response.headers['content-disposition'], format);

    // Trigger file download
    downloadBlob(response.data, filename);
  } catch (error: any) {
    // Handle error
    if (error.response) {
      // Server responded with error
      const errorMessage = await extractErrorMessage(error.response.data);
      throw new Error(errorMessage || `Export failed: ${error.response.statusText}`);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Export failed: No response from server');
    } else {
      // Error in request setup
      throw new Error(`Export failed: ${error.message}`);
    }
  }
}

/**
 * Extract filename from Content-Disposition header
 *
 * @param contentDisposition - Content-Disposition header value
 * @param format - Export format for fallback filename
 * @returns Extracted or generated filename
 */
function extractFilename(contentDisposition: string | undefined, format: ExportFormat): string {
  if (contentDisposition) {
    // Try to extract filename from Content-Disposition header
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      return filenameMatch[1];
    }
  }

  // Fallback: generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const extension = format === 'excel' ? 'xlsx' : format;
  return `export_${timestamp}.${extension}`;
}

/**
 * Extract error message from blob response
 *
 * @param blob - Error response blob
 * @returns Error message string
 */
async function extractErrorMessage(blob: Blob): Promise<string> {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json.error || json.detail || 'Export failed';
  } catch {
    return 'Export failed';
  }
}

/**
 * Download a blob as a file
 *
 * @param blob - File data as Blob
 * @param filename - Name for the downloaded file
 */
function downloadBlob(blob: Blob, filename: string): void {
  // Create object URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  window.URL.revokeObjectURL(url);
}

/**
 * Check if export is supported for the current browser
 *
 * @returns true if export is supported
 */
export function isExportSupported(): boolean {
  return !!(window.Blob && window.URL && window.URL.createObjectURL);
}
