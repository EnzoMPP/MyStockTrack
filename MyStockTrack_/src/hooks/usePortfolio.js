import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BACKEND_URL } from "@env";

const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("❌ Token de autenticação não encontrado.");
        return;
      }

      const response = await axios.get(`${BACKEND_URL}/portfolio`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPortfolio(response.data);
    } catch (error) {
      console.error("Erro ao buscar portfólio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return { portfolio, loading, fetchPortfolio };
};

export default usePortfolio;