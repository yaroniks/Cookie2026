import api from "../lib/axios";

export interface Currency {
  char_code: string;
  nominal: string;
  name: string;
  value: number;
  unit_rate: number;
}

export const fetchCurrencies = async (): Promise<Currency[]> => {
  try {
    const response = await api.get<Currency[]>('/currencies/');
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке валют:", error);
    return [];
  }
};