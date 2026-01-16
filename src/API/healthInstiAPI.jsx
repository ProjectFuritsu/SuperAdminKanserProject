import axios from "axios";

const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;


// Get the Health Institution Data
export const fetchHealthInstitution = async (from = null, to = null) => {
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

    const response = await axios.get(`${BASE_URL}/health_insti?select=*,health_insti_desc(hospitals_desc_content),barangays(brgy_name),cities(city_name),provinces(province_name),health_insti_contacts(*),health_insti_services(*,services_procedure(*),service_requirements(*))`, { headers });

    const rangeHeader = response.headers['content-range'];
    const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;


    return {
      data: response.data,
      count: totalCount
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};





// Add a new Health Institution and its details
export const addhealthInsti = async (health_insti) => {
  try {
    const response = await axios.post(`${BASE_URL}/health_insti`,
      health_insti,
      {
        headers:
        {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding data:", error);
    throw error;
  }
};

export const addhealthInsti_desc = async (description) => {
  try {
    const response = await axios.post(`${BASE_URL}/health_insti_desc`,
      description,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_ophr = async (ophr) => {
  try {
    const response = await axios.post(`${BASE_URL}/insti_ophr`,
      ophr,
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
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_contacts = async (contacts) => {
  try {
    const response = await axios.post(`${BASE_URL}/health_insti_contacts`,
      contacts,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_services = async (services) => {
  try {
    const response = await axios.post(`${BASE_URL}/health_insti_services`,
      services,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Prefer': 'return=representation',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_services_ophr = async (services_ophr) => {
  try {
    const response = await axios.post(`${BASE_URL}/health_service_ophr`,
      services_ophr,
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
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_services_requirements = async (services_requirements) => {
  try {
    const response = await axios.post(`${BASE_URL}/service_requirements`,
      services_requirements,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const addhealthInsti_services_procedures = async (services_procedure) => {
  try {
    const response = await axios.post(`${BASE_URL}/services_procedure`,
      services_procedure,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};






// Update a Health Institution
export const updatehealthInsti = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/health_insti?health_insti_id=eq.${id}`, updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      });

    console.log(`Selected health insti ${id}.`);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Update a Health Institution Description
export const updateHealthInstiDescripiton = async (id, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/health_insti_desc?health_insti_id=eq.${id}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error updating procedure:", error);
    throw error;
  }
}

// Update service details
export const updateHealthService = async (serviceId, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/health_insti_services?service_id=eq.${serviceId}`, updatedData, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Update a specific requirement
export const updateServiceRequirement = async (reqId, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/service_requirements?req_id=eq.${reqId}`, updatedData, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating requirement:", error);
    throw error;
  }
};

// Update a specific procedure step
export const updateServiceProcedure = async (procedureId, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/services_procedure?procedure_id=eq.${procedureId}`, updatedData, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating procedure:", error);
    throw error;
  }
};

// Upadte a specific contact details
export const updatehealthInstiContact = async (ContactId, updatedData) => {
  try {
    const response = await axios.patch(`${BASE_URL}/health_insti_contacts?contact_id=eq.${ContactId}`,
      updatedData,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      });
    return response.data;
  } catch (error) {
    console.error("Error updating procedure:", error);
    throw error;
  }
}






// Delete an entire Service (and ideally its children via DB Cascade)
export const deleteHealthService = async (serviceId) => {
  try {
    await axios.delete(`${BASE_URL}/health_insti_services?service_id=eq.${serviceId}`, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
      }
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// Delete a specific requirement
export const deleteServiceRequirement = async (reqId) => {
  try {
    await axios.delete(`${BASE_URL}/service_requirements?req_id=eq.${reqId}`, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
      }
    });
  } catch (error) {
    console.error("Error deleting requirement:", error);
    throw error;
  }
};

// Delete a specific procedure step
export const deleteServiceProcedure = async (procedureId) => {
  try {
    await axios.delete(`${BASE_URL}/services_procedure?procedure_id=eq.${procedureId}`, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
      }
    });
  } catch (error) {
    console.error("Error deleting procedure:", error);
    throw error;
  }
};

// Delete a specific contact details 
export const deleteContactDetails = async (procedureId) => {
  try {
    await axios.delete(`${BASE_URL}/health_insti_contacts?contact_id=eq.${procedureId}`, {
      headers: {
        apikey: API_KEY,
        Authorization: API_AUTH_KEY,
      }
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
}

// Delete a Health Institution
export const deletehealthInsti = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/health_insti?health_insti_id=eq.${id}`,
      {
        headers: {
          apikey: API_KEY,
          Authorization: API_AUTH_KEY,
        }
      }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};