"use client";

import { useState } from "react";

export default function EnquiryButton({ project }: { project: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full block text-center bg-amber-500 text-primary py-3 rounded-xl font-semibold mt-4 mb-2 hover:bg-amber-600 transition-colors"
      >
        Enquire Now
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              Enquiry for {project.name}
            </h2>

            <input placeholder="Name" className="w-full border p-2 mb-2 rounded" />
            <input placeholder="Phone" className="w-full border p-2 mb-2 rounded" />
            <textarea placeholder="Message" className="w-full border p-2 mb-3 rounded" />

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
