import { useState } from 'react';
//site API https://apps.emaillistverify.com/api/api/129380
export const useEmailValidation = () => {
  const [isValid, setIsValid] = useState(true);

  const validateEmail = async (email) => {
    const apiKey = 'k4BSG2lxcz3D8otwPs98h'; 
    try {
      // console.log(`Validating email: ${email}`); 
      const response = await fetch(`https://apps.emaillistverify.com/api/verifyEmail?secret=${apiKey}&email=${email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.text();
      // console.log(`Email validation response: ${data}`);
      const isValidEmail = data === 'ok';
      setIsValid(isValidEmail);
      return isValidEmail;
    } catch (error) {
      console.error('Erro ao verificar o e-mail:', error.message);
      setIsValid(false);
      return false;
    }
  };

  return { isValid, validateEmail };
};