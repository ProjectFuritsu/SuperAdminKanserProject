import { getbarangay, getcity, getprovinces, getpurok } from "../API/Utils/HealthInstiUtils";

export const fetchcities = async () => {
    try {
        const data = await getcity();
        const arrayData = Array.isArray(data) ? data : data.data;
        return arrayData;
    } catch (error) {
        console.error("Error fetching Data:", error);
    }
}




export const fetchbrgy = async () => {
    try {
        const data = await getbarangay();
        const arrayData = Array.isArray(data) ? data : data.data;
        return arrayData;
    } catch (error) {
        console.error("Error fetching Data:", error);
    }
}

export const fetchprovince = async () => {
    try {
        const data = await getprovinces();
        const arrayData = Array.isArray(data) ? data : data.data;
        return arrayData;
    } catch (error) {
        console.error("Error fetching Data:", error);
    }
}

export const fetchpurok = async () => {
    try {
        const data = await getpurok();
        const arrayData = Array.isArray(data) ? data : data.data;
        return arrayData;
    } catch (error) {
        console.error("Error fetching Data:", error);
    }
}

