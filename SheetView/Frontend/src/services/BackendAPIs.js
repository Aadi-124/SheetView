
import axios from "axios";

const API_BASE = "http://127.0.0.1:3000";
const BASE_URL = "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// Get Data
// ===============================
export async function getData(page, pageSize) {
  const res = await api.get("/data", {
    params: {
      page,
      page_size: pageSize,
    },
  });
  return res.data;
}

// ===============================
// Add Row
// ===============================
export async function addRow(data) {
  const res = await api.post("/row", { data });
  return res.data;
}

// ===============================
// Update Row
// ===============================
export async function updateRow(index,data) {
  const res = await api.put(`/row/${index}`, { data });
  return res.data;
}

// ===============================
// Delete Row
// ===============================
export async function deleteRow(index) {
  const res = await api.delete(`/row/${index}`);
  return res.data;
}


export const uploadFile = async (file) => {
  const formData = new FormData();
 
  formData.append("file", file);
  
  const res = await axios.post(`${API_BASE}/upload`, formData);

  return res.data;
};

export const fetchData = async (page = 1, page_size = 100) => {
  const res = await axios.get(`${API_BASE}/data`, {
    params: { page, page_size },
  });
  return res.data;
};



export const userLogin = (userNameOrEmail,password)=> axios.post("http://localhost:3000/login",{userNameOrEmail:userNameOrEmail,password:password,Fake:"FAKE"});

export const userRegistration = (userData) => axios.post("http://localhost:3000/register",userData);





// ===============================
// UPLOAD SINGLE FILE
// uploadedBy: user._id from your login response
// ===============================
export const uploadSingleFile = (file, uploadedBy, description = "", folder = "root") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("uploadedBy", uploadedBy);
  formData.append("description", description);
  formData.append("folder", folder);

  return axios.post(`${BASE_URL}/file/single`, formData,{name:"Aaditya"});
};

// ===============================
// UPLOAD MULTIPLE FILES
// files: array of File objects e.g. from input[multiple]
// ===============================
export const uploadMultipleFiles = (files, uploadedBy, folder = "root") => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("uploadedBy", uploadedBy);
  formData.append("folder", folder);

  return axios.post(`${BASE_URL}/upload/multiple`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ===============================
// GET ALL FILES FOR A USER
// returns file list without binary data (fast)
// ===============================
export const getUserFiles = (uploadedBy) =>
  axios.get(`${BASE_URL}/upload/files`, {
    params: { uploadedBy },
  });

// ===============================
// GET / DOWNLOAD A SINGLE FILE BY ID
// responseType blob lets you display or download it
// ===============================
export const getFileById = (fileId) =>
  axios.get(`${BASE_URL}/upload/file/${fileId}`, {
    responseType: "blob",
  });

// ===============================
// DELETE A FILE BY ID
// ===============================
export const deleteFile = (fileId) =>
  axios.delete(`${BASE_URL}/upload/${fileId}`);
