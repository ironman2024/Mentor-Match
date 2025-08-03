import axios from 'axios';

export class FileService {
  private static readonly BASE_URL = 'http://localhost:5002/api';

  static async uploadFile(file: File, type: 'image' | 'resume' | 'avatar'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = type === 'image' ? '/images/upload' : 
                    type === 'resume' ? '/mentorship/upload-resume' : 
                    '/profile/avatar';

    const response = await axios.post(`${this.BASE_URL}${endpoint}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return response.data.url;
  }

  static getFileUrl(filename: string, type: 'image' | 'resume' | 'avatar'): string {
    return `${this.BASE_URL}/${type}s/${filename}`;
  }
}
