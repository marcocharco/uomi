import AuthForm from "@/features/auth/components/forms/AuthForm";
import React from "react";

const SignIn = () => {
  return (
    <section className="flex items-center justify-center size-full max-sm:px-6">
      <AuthForm type="sign-in" />
    </section>
  );
};

export default SignIn;
