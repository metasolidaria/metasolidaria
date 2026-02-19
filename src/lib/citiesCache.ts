// Shared cache for IBGE cities API to avoid duplicate requests across components

export interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string;
      };
    };
  };
}

let cachedCities: IBGECity[] | null = null;
let fetchPromise: Promise<IBGECity[]> | null = null;

export async function fetchCities(): Promise<IBGECity[]> {
  // Return cached data if available
  if (cachedCities) return cachedCities;

  // If a fetch is already in progress, wait for it
  if (fetchPromise) return fetchPromise;

  // Start a new fetch
  fetchPromise = fetch(
    "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome"
  )
    .then((response) => {
      if (!response.ok) throw new Error("Failed to fetch cities");
      return response.json() as Promise<IBGECity[]>;
    })
    .then((data) => {
      cachedCities = data;
      return data;
    })
    .catch((error) => {
      fetchPromise = null; // Allow retry on error
      throw error;
    });

  return fetchPromise;
}
