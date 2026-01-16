import axios from "axios";
const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;


export const getGroupType = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/group_type?select=*`, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
      }
    }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
}


export const addGroupType = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/group_type`,
      data,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add data:', error);
    throw error;
  }
}


export const updateGroupType = async (id, data) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/group_type?group_type_code=eq.${id}`, // PostgREST pattern for DELETE
      data,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update data:', error);
    throw error;
  }
}


export const deleteGroupType = async (id) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/group_type?group_type_code=eq.${id}`, // PostgREST pattern for DELETE
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
        },
      }
    );
  } catch (error) {
    console.error('Failed to delete data:', error);
    throw error;
  }
}