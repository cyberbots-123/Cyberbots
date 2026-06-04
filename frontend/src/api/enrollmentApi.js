// ─────────────────────────────────────────────────────────────────
//  src/api/enrollmentApi.js
//  Drop this file into your React (Vite / CRA) project.
//  Import submitEnrollment wherever you need it.
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Submit the enrollment form to the Express backend.
 *
 * @param {Object} formData  - All fields from the EnrollModal form state
 * @returns {{ referenceNumber, studentName, parentName, email, course, tier, levelName, timeSlot, createdAt }}
 * @throws  Will throw an object `{ message, errors? }` on failure
 */
export const submitEnrollment = async (formData) => {
  const response = await fetch(`${BASE_URL}/api/enrollment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const json = await response.json();

  if (!response.ok) {
    // 422 → validation errors  |  429 → rate limit  |  500 → server error
    throw { message: json.message, errors: json.errors || {} };
  }

  return json.data;
  // {
  //   referenceNumber, studentName, parentName,
  //   email, course, tier, levelName, timeSlot, createdAt
  // }
};


// ─────────────────────────────────────────────────────────────────
//  How to wire this into EnrollModal.jsx
//  Replace the `submit` function with:
// ─────────────────────────────────────────────────────────────────

/*

import { submitEnrollment } from "../../api/enrollmentApi";

// Inside EnrollModal, replace:
//   const submit = () => { if (validate()) setDone(true); };
// With:

const [submitting, setSubmitting] = useState(false);
const [serverError, setServerError] = useState("");

const submit = async () => {
  if (!validate()) return;

  setSubmitting(true);
  setServerError("");

  try {
    const data = await submitEnrollment(form);
    // Optionally store the server reference number:
    // setForm(f => ({ ...f, referenceNumber: data.referenceNumber }));
    setDone(true);
  } catch (err) {
    if (err.errors && Object.keys(err.errors).length > 0) {
      // Server-side field errors → merge into local state so they render inline
      setErrors(prev => ({ ...prev, ...err.errors }));
    } else {
      setServerError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setSubmitting(false);
  }
};

// Then in the footer button for step 3, update to:
<button
  onClick={submit}
  disabled={submitting}
  style={{ ...existingStyle, opacity: submitting ? 0.7 : 1 }}
>
  {submitting ? "Submitting..." : "🚀 Submit Enrollment"}
</button>

// And show the server error above the footer if it exists:
{serverError && (
  <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 700, textAlign: "center", padding: "0 1.25rem" }}>
    ⚠ {serverError}
  </p>
)}

*/