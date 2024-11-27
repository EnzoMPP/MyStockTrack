import React from "react";
import CustomButton from "../CustomButton";
import { Fontisto } from '@expo/vector-icons';

//botão de fazer logui oAuth
export default function LoginButton({ onPress, disabled }) {
  return (
    <CustomButton
      icon={<Fontisto name="google" size={24} color="white" />}
      title="Login com Google"
      onPress={onPress}
      disabled={disabled}
    />
  );
}