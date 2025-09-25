import axios from 'axios';
import data from './data.json';

export const getNewsByHashtag = async (hashtags: string[]) => {
  try {
    // const params = new URLSearchParams();
    // params.append('tags', hashtags.join(','));
    // const response = await axios.get('/api/news', { params });
    // return response.data;
    return data;
  } catch (error) {
    console.error('Error fetching news by hashtag:', error);
    throw error;
  }
};
