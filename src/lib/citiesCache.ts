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

export interface BrazilianState {
  nome: string;
  sigla: string;
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { nome: "Acre", sigla: "AC" },
  { nome: "Alagoas", sigla: "AL" },
  { nome: "Amapá", sigla: "AP" },
  { nome: "Amazonas", sigla: "AM" },
  { nome: "Bahia", sigla: "BA" },
  { nome: "Ceará", sigla: "CE" },
  { nome: "Distrito Federal", sigla: "DF" },
  { nome: "Espírito Santo", sigla: "ES" },
  { nome: "Goiás", sigla: "GO" },
  { nome: "Maranhão", sigla: "MA" },
  { nome: "Mato Grosso", sigla: "MT" },
  { nome: "Mato Grosso do Sul", sigla: "MS" },
  { nome: "Minas Gerais", sigla: "MG" },
  { nome: "Pará", sigla: "PA" },
  { nome: "Paraíba", sigla: "PB" },
  { nome: "Paraná", sigla: "PR" },
  { nome: "Pernambuco", sigla: "PE" },
  { nome: "Piauí", sigla: "PI" },
  { nome: "Rio de Janeiro", sigla: "RJ" },
  { nome: "Rio Grande do Norte", sigla: "RN" },
  { nome: "Rio Grande do Sul", sigla: "RS" },
  { nome: "Rondônia", sigla: "RO" },
  { nome: "Roraima", sigla: "RR" },
  { nome: "Santa Catarina", sigla: "SC" },
  { nome: "São Paulo", sigla: "SP" },
  { nome: "Sergipe", sigla: "SE" },
  { nome: "Tocantins", sigla: "TO" },
];

export const COUNTRY_OPTIONS = [
  { nome: "Brasil", tipo: "País" },
];

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
