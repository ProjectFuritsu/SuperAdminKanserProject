import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;

export const fetchMedicalSpecialistInfo = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/medical_specialist?select=*,medical_specialist_health_institution_map(*,schedule_medical_specialist_map(*),health_insti(health_insti_name))`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

export const addMedicalSpecialist = async (msData) => {
  try {
    const res = await axios.post(`${BASE_URL}/medical_specialist`, msData, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

export const addHealthInstiMedicalSpecialist = async (MSHIData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/medical_specialist_health_institution_map`,
      MSHIData,
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
    console.error("Error adding data:", error);
    throw error;
  }
};

export const addMedicalSpecialistSchedule = async (schedData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/schedule_medical_specialist_map`,
      schedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

export const updateMedicalSpecialist = async (msid, updateddata) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/medical_specialist?msid=eq.${msid}`,
      updateddata,
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
    console.error("Update Error:", { error });
    throw error;
  }
};

export const updateHealthInstiMedicalSpecialist = async (
  MSHIid,
  updateddata
) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/medical_specialist_health_institution_map?mshimapid=eq.${MSHIid}`,
      updateddata,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
};

export const updateMedicalSpecialistSchedule = async (schedID, updateddata) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/schedule_medical_specialist_map?schedid=eq.${schedID}`,
      updateddata,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );

    return res;
  } catch (error) {
    console.error("Update error:", error);
    throw error;
  }
};

export const deleteMedicalSpecialist = async (msid) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/medical_specialist?msid=eq.${msid}`,
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
    console.error("Deletion Error: ", error);
    throw error;
  }
};

export const deleteHealthInstiMedicalSpecialist = async (MSHIid) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/medical_specialist_health_institution_map?mshimapid=eq.${MSHIid}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Deletion Error: ", error);
    throw error;
  }
};

export const deleteMedicalSpecialistSchedule = async (schedID) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/schedule_medical_specialist_map?schedid=eq.${schedID}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
      }
    );

    return res;
  } catch (error) {
    console.error("Deletion Error: ", error);
    throw error;
  }
};
