import axios from "axios";
const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;

/**
 * 
 * ! NOTE:
 * ! This file was structure by the following:
 * 
 * ? 1. Get Method
 * ? 2. Post/Insert/Add Method
 * ? 3. Put/Patch/update Method
 * ? 4. Delete/Remove Method 
 * 
 * ! Lastly, the methods was group according to its category (province, city, brgy, purok, etc).
 * ! PS: Please maintain the structure to make the code easily to debug
 * 
 * ? Thank you, God Bless
 * 
 */

export const getprovinces = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/provinces?select=*`, {
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
};

export const addprovince = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/provinces`,
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
};

export const updateprovinces = async (id, data) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/provinces?province_code=eq.${id}`, // PostgREST pattern for DELETE
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
};

export const deleteprovinces = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/provinces?province_code=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to delete data:', error);
        throw error;
    }
};

// City Uils
export const getcity = async (from = 0, to = 9) => {
    try {
           const headers = {
            apikey: API_KEY,
            Authorization: API_AUTH_KEY,
            'Prefer': 'count=exact'
        };

        // Only add the Range header if both 'from' and 'to' are provided
        if (from !== null && to !== null) {
            headers['Range'] = `${from}-${to}`;
        }


        const response = await axios.get(
            `${BASE_URL}/cities?select=*`, { headers });

            
        // The header looks like "0-9/42000" -> we need the "42000"
        const rangeHeader = response.headers['content-range'];
        const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;

        return {
            data: response.data,
            count: totalCount
        };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
};

export const addcity = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/cities`,
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
};

export const updatecity = async (id, data) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/cities?city_zip_code=eq.${id}`, // PostgREST pattern for DELETE
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
};

export const deletecity = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/cities?city_zip_code=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to delete data:', error);
        throw error;
    }
};



// Brgy utils
export const getbarangay = async (from = null, to = null) => {
    try {
        const headers = {
            apikey: API_KEY,
            Authorization: API_AUTH_KEY,
            'Prefer': 'count=exact'
        };

        // Only add the Range header if both 'from' and 'to' are provided
        if (from !== null && to !== null) {
            headers['Range'] = `${from}-${to}`;
        }


        const response = await axios.get(`${BASE_URL}/barangays?select=*`, { headers });
      
        // The header looks like "0-9/42000" -> we need the "42000"
        const rangeHeader = response.headers['content-range'];
        const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;

        return {
            count: totalCount,
            data: response.data
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
};

export const addbarangay = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/barangays`,
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
};

export const updatebarangay = async (id, data) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/barangays?brgy_code=eq.${id}`, // PostgREST pattern for DELETE
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
};

export const deletebarangay = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/barangays?brgy_code=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to delete data:', error);
        throw error;
    }
};

// Purok Utils
export const getpurok = async (from = null, to = null) => {
    try {
        const headers = {
            apikey: API_KEY,
            Authorization: API_AUTH_KEY,
            'Prefer': 'count=exact'
        };

        // Only add the Range header if both 'from' and 'to' are provided
        if (from !== null && to !== null) {
            headers['Range'] = `${from}-${to}`;
        }

        const response = await axios.get(`${BASE_URL}/puroks?select=*`, { headers });

        const rangeHeader = response.headers['content-range'];
        const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;

        return {
            data: response.data,
            count: totalCount
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}

export const getpurokNoRange = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/puroks?select=*`, {
            headers: {
                apikey: API_KEY,
                Authorization: API_AUTH_KEY,
            }
        });

        // The header looks like "0-9/42000" -> we need the "42000"
        const rangeHeader = response.headers['content-range'];
        const totalCount = rangeHeader ? parseInt(rangeHeader.split('/')[1]) : 0;

        return {
            data: response.data,
            count: totalCount
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        throw error;
    }
}

export const addpurok = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/puroks`,
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

export const updatepuroks = async (id, data) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/puroks?purok_code=eq.${id}`,
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

export const deletepurok = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/puroks?purok_code=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to delete data:', error);
        throw error;
    }
}