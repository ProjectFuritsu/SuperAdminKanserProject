import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;


// Fetch Financial Institutions with Pagination
export const fetchFinancialInstitution = async (from, to) => {
  try {
    const headers = {
      apikey: API_KEY,
      Authorization: API_AUTH_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'count=exact'
    };

    // Only add the Range header if both 'from' and 'to' are provided
    if (from !== null && to !== null) {
      headers['Range'] = `${from}-${to}`;
    }

    const response = await axios.get(`${BASE_URL}/financial_institution?select=*,financial_insti_ophr(*),barangays(brgy_name),cities(city_name),provinces(province_name),financial_contact_details(*),program_offers(*,program_offer_steps(*),program_requirements(*),program_benefits(*))`, { headers });

    const rangeHeader = response.headers['content-range'];
    const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;

    return {
      data: response.data,
      count: totalCount
    };
  } catch (error) {
    console.error("Error fetching financial institutions:", error);
    throw error;
  }
};

// Update Financial Insititution
export const updatefinancialInsti = async (id, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/financial_institution?financial_insti_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating financial institution:", error);
    throw error;
  }
};

export const deletefinancialInsti = async (id) => {
  try {
    await axios.delete(
      `${BASE_URL}/financial_institution?financial_insti_id=eq.${id}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting financial institution:", error);
    throw error;
  }
};

// Add a new Financial Institution with details
export const addfinancialInsti = async (financial_insti) => {
  try {
    const response = await axios.post(`${BASE_URL}/financial_institution`,
      financial_insti,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      });
    console.log(response.data);

    return response.data;
  }
  catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_ophr = async (ophr) => {
  try {
    const response = await axios.post(`${BASE_URL}/financial_insti_ophr`,
      ophr,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      });

    return response.data;
  } catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_contacts = async (contacts) => {
  try {
    const response = await axios.post(`${BASE_URL}/financial_contact_details`,
      contacts,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_programs = async (services) => {
  try {
    const response = await axios.post(`${BASE_URL}/program_offers`,
      services,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_programsteps = async (benefits) => {
  try {
    const response = await axios.post(`${BASE_URL}/program_offer_steps`,
      benefits,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  }
  catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_programReq = async (requirements) => {
  try {
    const response = await axios.post(`${BASE_URL}/program_requirements`,
      requirements,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  }
  catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

export const addfinancialInsti_benefits = async (benefits) => {
  try {
    const response = await axios.post(`${BASE_URL}/program_benefits`,
      benefits,
      {
        headers: {
          apikey: API_KEY,
          Authorization: `Bearer ${API_AUTH_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  }
  catch (error) {
    console.error("Error adding Data:", error);
    throw error;
  }
}

// Update Program
export const updateProgram = async (programId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/program_offers?program_id=eq.${programId}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating program:", error);
    throw error;
  }
};

// Update Procedures (Step)
export const updateProgramStep = async (stepId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/program_offer_steps?program_steps_id=eq.${stepId}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating step:", error);
    throw error;
  }
};

// Update Requirements
export const updateProgramRequirement = async (reqId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/program_requirements?program_req_id=eq.${reqId}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating requirement:", error);
    throw error;
  }
};

// Update Benefit
export const updateProgramBenefit = async (benefitId, updatedData) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/program_benefits?benef_id=eq.${benefitId}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating benefit:", error);
    throw error;
  }
};

// Update Contact
export const updateInstitutionContact = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/financial_contact_details?contact_details_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating benefit:", error);
    throw error;
  }
};


// Update Description
export const updateFinancialInstiDescription = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/financial_institution?financial_insti_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating benefit:", error);
    throw error;
  }
}



// Delete Program
export const deleteProgram = async (programId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/program_offers?program_id=eq.${programId}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting program:", error);
    throw error;
  }
};

// Delete Prucedure(Step)
export const deleteProgramStep = async (stepId) => {
  try {
    await axios.delete(
      `${BASE_URL}/program_offer_steps?program_steps_id=eq.${stepId}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting step:", error);
    throw error;
  }
};

// Delete Requirements
export const deleteProgramRequirement = async (reqId) => {
  try {
    await axios.delete(
      `${BASE_URL}/program_requirements?program_req_id=eq.${reqId}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting requirement:", error);
    throw error;
  }
};

// Delete Benefit
export const deleteProgramBenefit = async (benefitId) => {
  try {
    await axios.delete(
      `${BASE_URL}/program_benefits?benef_id=eq.${benefitId}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting benefit:", error);
    throw error;
  }
};

// Delete Contact Details
export const deletecontactdetail = async (contactid) => {
  try {
    await axios.delete(
      `${BASE_URL}/financial_contact_details?contact_details_id=eq.${contactid}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}