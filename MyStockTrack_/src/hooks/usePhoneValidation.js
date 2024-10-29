import { useState } from 'react';

export const usePhoneValidation = () => {
  const [isValid, setIsValid] = useState(true);

  const validatePhone = async (phone) => {
    const apiKey = '6bb82e279bc665a72a97f82d7ca159b4';
    const countryCode = 'BR'; 
    try {
     // console.log(`Validating phone: ${phone}`); Log para depuração
      const response = await fetch(`http://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=${countryCode}&format=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      //console.log(`Phone validation response: ${JSON.stringify(data)}`); Log para depuração
      const isValidPhone = data.valid;
      setIsValid(isValidPhone);
      return isValidPhone;
    } catch (error) {
      console.error('Erro ao verificar o telefone:', error.message);
      setIsValid(false);
      return false;
    }
  };

  return { isValid, validatePhone };
};