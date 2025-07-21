import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Code, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
const SignupPage = () => {
  return (
    <>
      <h1 className="text-3xl">Sign-up Page</h1>
    </>
  );
};

export default SignupPage;
