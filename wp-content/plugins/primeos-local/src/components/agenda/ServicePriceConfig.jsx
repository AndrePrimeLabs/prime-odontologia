// @ts-nocheck
// Default prices per service type — stored in localStorage for persistence
export const DEFAULT_PRICES = {
  consultation: 200,
  follow_up: 100,
  procedure: 500,
  checkup: 150,
  emergency: 350,
  therapy: 250,
  diagnostic: 180
};

export const SERVICE_LABELS = {
  consultation: "Consulta",
  follow_up: "Retorno",
  procedure: "Procedimento",
  checkup: "Check-up",
  emergency: "Emergência",
  therapy: "Terapia",
  diagnostic: "Diagnóstico"
};

export function getServicePrices() {
  try {
    const saved = localStorage.getItem("service_prices");
    return saved ? { ...DEFAULT_PRICES, ...JSON.parse(saved) } : { ...DEFAULT_PRICES };
  } catch {
    return { ...DEFAULT_PRICES };
  }
}

export function saveServicePrices(prices) {
  localStorage.setItem("service_prices", JSON.stringify(prices));
}
