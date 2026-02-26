

## Problem

The `CityAutocomplete` component only searches IBGE municipalities. When the user types "Minas Gerais" (a state name), nothing matches because it is not a city. The user needs flexibility to enter states, countries, or broader regions as the location for entities and groups.

## Solution

Add Brazilian states (UFs) and "Brasil" as extra options in the `CityAutocomplete` suggestions, alongside the existing IBGE cities. This way, when the user types "Minas", both "Minas Gerais" (state) and cities like "Minas Novas, MG" will appear.

## Technical Details

### File: `src/lib/citiesCache.ts`
- Add a constant array of all 27 Brazilian states (e.g., `{ nome: "Minas Gerais", sigla: "MG" }`) plus an entry for "Brasil".

### File: `src/components/CityAutocomplete.tsx`
- Import the states list from `citiesCache.ts`.
- In the filtering `useEffect`, also filter states matching the query and prepend them to the results (before city results). States will appear as "Minas Gerais (Estado)" and "Brasil (País)" to distinguish them from cities.
- When a state is selected, format as just the state name (e.g., "Minas Gerais") instead of "City, UF".

No database or backend changes needed. This affects all places using `CityAutocomplete`: entity creation, group creation, profile editing, etc.

