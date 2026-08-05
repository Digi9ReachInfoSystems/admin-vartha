const RAW_BASE = import.meta.env.VITE_BASE_URL || "";
const BASE_URL = String(RAW_BASE).replace(/\/+$/, "");

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseJsonResponse(response, fallbackMessage) {
  let result = null;
  try {
    result = await response.json();
  } catch (_) {
    result = null;
  }
  if (!response.ok) {
    throw new Error(result?.message || fallbackMessage);
  }
  return result;
}

export const getKarnatakaConfig = async () => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/config`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonResponse(response, "Failed to load Karnataka integration settings");
};

export const updateKarnatakaConfig = async (payload) => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/config`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Failed to save Karnataka integration settings");
};

export const testKarnatakaConnection = async () => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/test`, {
    method: "POST",
    headers: authHeaders(),
  });
  return parseJsonResponse(response, "Connection test failed");
};

export const getKarnatakaDistricts = async () => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/districts`, {
    method: "GET",
    headers: authHeaders(),
  });
  return parseJsonResponse(response, "Failed to load districts");
};

/** Forward-only publish to Public — does not save news in our DB */
export const publishKarnatakaNews = async (payload) => {
  if (!BASE_URL) throw new Error("VITE_BASE_URL is not set");
  const response = await fetch(`${BASE_URL}/api/karnataka/publish`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJsonResponse(response, "Failed to create news");
};
