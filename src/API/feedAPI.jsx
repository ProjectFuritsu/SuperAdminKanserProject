import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;

export const getFeeds = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/publications?select=*,publication_author(author_name),publication_type(publication_type_code,type_description),publication_content(content_detail),publication_reference(ref_detail)`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addFeeds = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/publications`, data, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });
    return res;
  } catch (error) {
    console.error(`Insertion error`, error);
    throw error;
  }
};

export const updatefeed = async (id, updatedData) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/publications?publication_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );
    return res;
  } catch (error) {
    console.error(`Deletion error`, error);

    throw error;
  }
};

export const updateContentDetails = async (id, updatedData) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/publication_content?publication_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(`Insertion error`, error);
    throw error;
  }
};

export const updateReference = async (id, updatedData) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/publication_reference?pub_ref_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(`Insertion error`, error);
    throw error;
  }
};

export const deletefeed = async (id) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/publications?publication_id=eq.${id}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
      }
    );
    return res;
  } catch (error) {
    console.error(`Deletion error`, error);

    throw error;
  }
};

export const addreference = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/publication_reference`, data, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error(`Insertion error`, error);
    throw error;
  }
};

export const addContent = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/publication_content`, data, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        "Content-Type": "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error(`Insertion error`, error);
    throw error;
  }
};
