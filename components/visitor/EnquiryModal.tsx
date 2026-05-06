"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { Project } from "@/lib/types";
import { sanitize } from "@/utils/sanitize";
import { Toast } from "@/components/ui/Toast";
import { enquirySchema } from '@/lib/validation'

type Props = {
  project: Project | null;
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export default function EnquiryModal({ project, isOpen, onClose, children }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setPhone("");
    setBudget("");
    setMessage("");
  }, [open, project]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    // Sync open state with isOpen prop if provided
    if (typeof isOpen === "boolean") setOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    // Call onClose if provided
    if (!open && onClose) onClose();
  }, [open]);

  function validate() {
    if (!project) return 'Project not available'
    
    const parsed = enquirySchema.safeParse({
      name,
      phone,
      budget,
      message,
      property: project.name,
    })

    if (!parsed.success) {
      return parsed.error.issues[0]?.message || 'Please check the form inputs.'
    }

    return "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!project) return;

    const validationMessage = validate();
    if (validationMessage) {
      setToast({ message: validationMessage, type: "error" });
      return;
    }

    setLoading(true);

    const response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sanitize(name.trim()),
        phone: phone.trim(),
        budget,
        property: sanitize(project.name),
        message: sanitize(message.trim()),
      }),
    })
    const result = await response.json().catch(() => null)

    setLoading(false);

    if (!response.ok || !result?.success) {
      setToast({
        message: "Could not submit enquiry. Please try again.",
        type: "error",
      });
      return;
    }

    setToast({
      message: "Enquiry submitted successfully.",
      type: "success",
    });

    // if (onClose) onClose(); else setOpen(false);
    setTimeout(() => onClose ? onClose() : setOpen(false), 400);
  }

  if (!project) return null;

  return (
    <>
      {/* Trigger */}
      {children && (
        <div onClick={() => setOpen(true)} style={{ display: "contents" }}>
          {children}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4" role="dialog" aria-modal="true" aria-label={`Enquire about ${project.name}`}>
          {toast && <Toast message={toast.message} type={toast.type} />}

          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Enquire: {project.name}
                </h2>
                <p className="text-sm text-gray-500">{project.price}</p>
              </div>

              <button
                onClick={() => onClose ? onClose() : setOpen(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone"
                className="w-full border p-3 rounded-xl"
              />

              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full border p-3 rounded-xl"
              >
                <option value="">Select budget</option>
                <option>Under ₹10 Lakhs</option>
                <option>₹10-15 Lakhs</option>
                <option>₹15-25 Lakhs</option>
                <option>₹25-50 Lakhs</option>
                <option>Above ₹50 Lakhs</option>
              </select>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                className="w-full border p-3 rounded-xl"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-full"
              >
                {loading ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}