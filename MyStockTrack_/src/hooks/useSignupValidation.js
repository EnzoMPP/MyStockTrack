import { Alert } from 'react-native';
import { useEmailValidation } from './useEmailValidation';
import { usePhoneValidation } from './usePhoneValidation';


export const useSignupValidation = () => {
  const { validateEmail } = useEmailValidation();
  const { validatePhone } = usePhoneValidation();

  const validateSignup = async (fields) => {
    const { name, cpf, email, password, address, houseNumber, phone, birthDate, gender, cep } = fields;

    const formattedCpf = cpf.replace(/[^\d]+/g, '');
    const formattedCep = cep.replace(/[^\d]+/g, '');
    const formattedPhone = phone.replace(/[^\d]+/g, '');
    const formattedBirthDate = birthDate.replace(/[^\d]+/g, '');

    if (!name || !formattedCpf || !email || !password || !address || !houseNumber || !formattedPhone || !formattedBirthDate || !gender || !formattedCep) {
      Alert.alert('Erro no cadastro', 'Por favor, preencha todos os campos obrigatórios corretamente.');
      return false;
    }

    if (formattedCpf.length !== 11) {
      Alert.alert('Erro no cadastro', 'Por favor, insira um CPF válido.');
      return false;
    }

    if (formattedCep.length !== 8) {
      Alert.alert('Erro no cadastro', 'Por favor, insira um CEP válido.');
      return false;
    }

    if (formattedPhone.length < 10 || formattedPhone.length > 11) {
      Alert.alert('Erro no cadastro', 'Por favor, insira um telefone válido.');
      return false;
    }

    if (formattedBirthDate.length !== 8) {
      Alert.alert('Erro no cadastro', 'Por favor, insira uma data de nascimento válida.');
      return false;
    }

    if (houseNumber.length > 6) {
      Alert.alert('Erro no cadastro', 'O número da casa deve ter no máximo 6 dígitos.');
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{7,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Erro no cadastro', 'A senha deve ter pelo menos 7 caracteres, incluindo letras, números e um caractere especial.');
      return false;
    }

    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      Alert.alert('Erro no cadastro', 'Por favor, insira um e-mail válido.');
      return false;
    }

    const isPhoneValid = await validatePhone(phone);
    if (!isPhoneValid) {
      Alert.alert('Erro no cadastro', 'Por favor, insira um telefone válido.');
      return false;
    }

    return {
      name,
      cpf: formattedCpf,
      email,
      password,
      address,
      houseNumber,
      complement: fields.complement,
      phone: formattedPhone,
      birthDate: formattedBirthDate,
      gender,
      cep: formattedCep,
    };
  };

  return { validateSignup };
};