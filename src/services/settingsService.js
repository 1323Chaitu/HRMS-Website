const API_URL = "http://localhost:5000/settings";

export const defaultSettings = {
  companyName: "SmartHRMS",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",

  officeStartTime: "09:00",
  officeEndTime: "18:00",
  lateAfterMinutes: 15,

  leaveTypes: [
    { name: "Casual Leave", days: 12 },
    { name: "Sick Leave", days: 10 },
    { name: "Earned Leave", days: 15 }
  ],

  dateFormat: "DD/MM/YYYY"
};

export const getSettings = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to load settings");
  }

  const settings = await response.json();

  if (settings.length > 0) {
    return settings[0];
  }

  // Create default settings on the first visit.
  const createResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(defaultSettings)
  });

  if (!createResponse.ok) {
    throw new Error("Failed to create default settings");
  }

  return createResponse.json();
};

export const saveSettings = async (settings) => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to check existing settings");
  }

  const existingSettings = await response.json();

  let saveResponse;

  if (existingSettings.length > 0) {
    const currentSettings = existingSettings[0];

    saveResponse = await fetch(
      `${API_URL}/${currentSettings.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...settings,
          id: currentSettings.id
        })
      }
    );
  } else {
    saveResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(settings)
    });
  }

  if (!saveResponse.ok) {
    throw new Error("Failed to save settings");
  }

  return saveResponse.json();
};