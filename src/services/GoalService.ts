import AsyncStorage from "@react-native-async-storage/async-storage";

type Goals = {
  daily: number;
  weekly: number;
  monthly: number;
};

const STORAGE_KEY = "taxi_goals";

/**
 * Servicio para gestionar metas económicas
 */
export class GoalService {
  /**
   * Devuelve las metas guardadas
   */
  static async getGoals(): Promise<Goals> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { daily: 0, weekly: 0, monthly: 0 };
    }
    return JSON.parse(raw);
  }

  /**
   * Guarda las metas
   */
  static async saveGoals(goals: Goals): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }
}
