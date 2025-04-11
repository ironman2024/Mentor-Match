import axios from 'axios';

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await axios.post('http://localhost:5002/api/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

const getImageUrl = (filename: string) => {
  return `http://localhost:5002/api/images/${filename}`;
};

export { uploadImage, getImageUrl };
