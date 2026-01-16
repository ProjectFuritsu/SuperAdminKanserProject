import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;

export const getSupportGroups = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/support_groups?select=*,group_type(group_type_name)`,
      {
        headers: { apikey: API_KEY, Authorization: API_AUTH_KEY },
      }
    );
    console.log(res.data);

    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const addSupportGroup = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}/support_groups`, data, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    return res;
  } catch (error) {
    console.error(`Insertion error: `, error);
    throw error;
  }
};

export const updateSupportGroup = async (gid, updatedData) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/support_groups?support_group_id=eq.${gid}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return res;
  } catch (error) {
    console.error(`Update error: `, error);
    throw error;
  }
};

export const deleteSupportGroup = async (gid) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/support_groups?support_group_id=eq.${gid}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
        },
      }
    );
    return res;
  } catch (error) {
    console.error(`Insertion error: `, error);
    throw error;
  }
};
