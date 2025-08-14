"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AnimatedBackground from "../components/AnimatedBackground";

const registrationSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z
    .string()
    .min(8, "Phone required")
    .max(15, "Too long")
    .regex(/^\+?[0-9\-\s]+$/, "Digits only"),
  college: z.string().min(2, "College required"),
  department: z.string().min(2, "Department required"),
  ideaTitle: z.string().min(3, "Title required"),
  ideaSummary: z.string().min(20, "At least 20 characters"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
});

type RegistrationData = z.infer<typeof registrationSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputClass =
    "w-full rounded-lg border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/60";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationData>({ resolver: zodResolver(registrationSchema) });

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/success");
    } catch (e) {
      alert("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh px-6 py-10 sm:py-16">
      <AnimatedBackground />
      <div className="mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl font-bold"
        >
          Register for Eureka — Preliminary Round at RIT (NEC)
        </motion.h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Event date: 19th. Please fill in accurate details. Shortlisted teams advance to the next round.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Full name" error={errors.fullName?.message}>
              <input {...register("fullName")} className={inputClass} placeholder="Jane Doe" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} className={inputClass} placeholder="jane@email.com" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register("phone")} className={inputClass} placeholder="+91 98765 43210" />
            </Field>
            <Field label="College" error={errors.college?.message}>
              <input {...register("college")} className={inputClass} placeholder="Rajalakshmi Institute of Technology" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Department" error={errors.department?.message}>
              <input {...register("department")} className={inputClass} placeholder="CSE / ECE / MECH" />
            </Field>
            <Field label="Idea title" error={errors.ideaTitle?.message}>
              <input {...register("ideaTitle")} className={inputClass} placeholder="One-liner for your idea" />
            </Field>
          </div>
          <Field label="Idea summary" error={errors.ideaSummary?.message}>
            <textarea {...register("ideaSummary")} className={`${inputClass} min-h-28`} placeholder="Describe the problem, solution, and impact" />
          </Field>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" {...register("agree")} className="mt-1 size-4" />
            <span>
              I confirm the information is correct and I agree to be contacted regarding Eureka.
            </span>
          </label>
          {errors.agree && (
            <div className="text-sm text-red-600">{errors.agree.message}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60 w-fit"
          >
            {isSubmitting ? "Submitting..." : "Submit registration"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
}


