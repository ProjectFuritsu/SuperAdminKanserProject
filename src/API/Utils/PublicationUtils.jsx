import axios from "axios";
const BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_AUTH_KEY = import.meta.env.VITE_API_AUTH_KEY;

export const publicationTypes = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/publication_type?select=*`, {
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


export const addpublicationtype = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/publication_type`,
            data,
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data; // Make sure your API actually returns the created object
    } catch (error) {
        console.error(
            'Failed to add publication type:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};

export const updatepublicationtype = async (id, data) => {
    try {
        // Use PUT or PATCH for updating resources
        const response = await axios.patch( // PATCH is often better for partial updates
            `${BASE_URL}/publication_type?publication_type_code=eq.${id}`, // Assuming PostgREST filter
            data, // The data payload goes here
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to update publication type:', error);
        throw error;
    }
}

export const deletePublicationType = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/publication_type?publication_type_code=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        console.log(`Publication Type ${id} Deleted:`, response);
        return response.data;
    } catch (error) {
        console.error('Failed to delete publication type:', error);
        throw error;
    }
}

export const getpublicationauthor = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/publication_author?select=*`, {
            headers: {
                apikey: API_KEY,
                Authorization: API_AUTH_KEY,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching publication authors:", error);
        throw error;
    }
};

export const addpublicationauthor = async (data) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/publication_author`,
            data,
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data; // Make sure your API actually returns the created object
    } catch (error) {
        console.error(
            'Failed to add publication type:',
            error.response ? error.response.data : error.message
        );
        throw error;
    }
};


export const updatepublicationauthor = async (id, data) => {
    try {
        // Use PUT or PATCH for updating resources
        const response = await axios.patch( // PATCH is often better for partial updates
            `${BASE_URL}/publication_author?author_id=eq.${id}`, // Assuming PostgREST filter
            data, // The data payload goes here
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Failed to update publication type:', error);
        throw error;
    }
}

export const deletepublicationauthor = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/publication_author?author_id=eq.${id}`, // PostgREST pattern for DELETE
            {
                headers: {
                    apikey: API_KEY,
                    Authorization: API_AUTH_KEY,
                },
            }
        );
        console.log(`Publication Type ${id} Deleted:`, response);
        return response.data;
    } catch (error) {
        console.error('Failed to delete publication type:', error);
        throw error;
    }
}