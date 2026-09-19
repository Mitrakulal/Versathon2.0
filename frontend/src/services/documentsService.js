import { apiRequest } from './api';
import { MOCK_DOCUMENTS } from './mockData';

export const documentsService = {
  /**
   * List documents in a study space
   */
  async listDocuments(spaceId) {
    const fallback = MOCK_DOCUMENTS.filter(d => d.space_id === spaceId || true);
    return apiRequest(`/spaces/${spaceId}/documents`, { method: 'GET' }, fallback);
  },

  /**
   * Upload a file (.pdf, .docx, .txt, .md)
   */
  async uploadDocument(spaceId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const mockResponse = {
      id: `doc_${Date.now()}`,
      space_id: spaceId,
      filename: file.name,
      file_type: file.name.split('.').pop() || 'txt',
      status: 'processing',
      uploaded_at: new Date().toISOString(),
      chunk_count: 0,
    };

    return apiRequest(`/spaces/${spaceId}/documents/upload`, {
      method: 'POST',
      body: formData,
      isFormData: true,
    }, mockResponse);
  },

  /**
   * Paste raw text as a note
   */
  async pasteText(spaceId, filename, content) {
    const mockResponse = {
      id: `doc_${Date.now()}`,
      space_id: spaceId,
      filename: filename || 'Pasted_Notes.txt',
      file_type: 'txt',
      status: 'processing',
      uploaded_at: new Date().toISOString(),
      chunk_count: 0,
    };

    return apiRequest(`/spaces/${spaceId}/documents/paste`, {
      method: 'POST',
      body: { filename, content },
    }, mockResponse);
  },
};
