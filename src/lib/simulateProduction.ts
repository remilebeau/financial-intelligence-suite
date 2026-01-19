const DATA_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api/simulations/production"
    : "https://simulation-api-rsaw.onrender.com/api/simulations/production";

export default async function simulateProduction(
  formData: SimulationInputs,
): Promise<SimulationResponse> {
  const res = await fetch(DATA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) {
    const errData = await res.json();
    const errSource = errData.detail[0].loc[1]; // variable name that caused the error
    const errMessage = errData.detail[0].msg; // how to correct the error
    throw new Error(`${errSource}: ${errMessage}`);
  }

  const data: SimulationResponse = await res.json();
  return data;
}
