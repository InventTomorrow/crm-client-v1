"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { sendContactMessage } from "../services/contactService";
import { contactMessageSchema, type ContactMessageInput } from "../types";

/**
 * Help-centre contact form. Owns validation, submission and the sent state —
 * the component only renders.
 */
export function useContactForm() {
  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  const mutation = useMutation({
    mutationFn: sendContactMessage,
    onSuccess: () => {
      form.reset();
      toast.success("Message sent. We'll reply by email.");
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  return {
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    isSent: mutation.isSuccess,
    sendAnother: mutation.reset,
  };
}
