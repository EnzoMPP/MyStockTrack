import { useState } from 'react';

export const useEmailValidation = () => {
  const [isValid, setIsValid] = useState(true);

  const validateEmail = async (email) => {
    try {
      console.log(`Validating email: ${email}`); // Log para depuração
      const response = await fetch(`https://api.zerobounce.net/v2/validate?api_key=2384ca236dc44f2bbab9dc075b40185f&email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      console.log(`Email validation response: ${JSON.stringify(data)}`); // Log para depuração
      setIsValid(data.status === 'valid');
      return data.status === 'valid';
    } catch (error) {
      console.error('Erro ao verificar o e-mail:', error.message);
      setIsValid(false);
      return false;
    }
  };

  return { isValid, validateEmail };
};