import axios from 'axios';

export const getNewsByHashtag = async (hashtags?: string[]) => {
  try {
    const params = new URLSearchParams();
    if (hashtags) {
      params.append('tags', hashtags.join(','));
    }
    const response = await axios.get('api/news', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching news by hashtag:', error);
    throw error;
  }
};

export const getTags = async () => {
  try {
    const response = await axios.get('api/tags/random');
    return response.data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};
