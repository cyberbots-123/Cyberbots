// ─────────────────────────────────────────────────────────────────
//  src/api/contactApi.js
//  Drop this file into your React (Vite / CRA) project.
//  Import submitContactForm wherever you need it.
// ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Submit the contact form to the Express backend.
 *
 * @param {Object} formData  - All fields from the form state
 * @returns {{ referenceNumber, firstName, email, createdAt }}
 * @throws  Will throw an object `{ message, errors? }` on failure
 */
export const submitContactForm = async (formData) => {
  const response = await fetch(`${BASE_URL}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const json = await response.json();

  if (!response.ok) {
    // 422 → validation errors  |  429 → rate limit  |  500 → server error
    throw { message: json.message, errors: json.errors || {} };
  }

  return json.data; // { referenceNumber, firstName, email, createdAt }
};


// ─────────────────────────────────────────────────────────────────
//  How to use in ContactForm.jsx — replace the handleSubmit function
//  with this version:
// ─────────────────────────────────────────────────────────────────

/*

import { submitContactForm } from "./api/contactApi";

const handleSubmit = async () => {
  // 1. Touch all fields so validation errors show
  const allTouched = Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {});
  setTouched(allTouched);

  // 2. Run frontend validation first (fast feedback, no network needed)
  const errs = validate(form);
  setErrors(errs);
  if (Object.keys(errs).length > 0) return;

  // 3. Hit the API
  setSubmitting(true);
  try {
    const data = await submitContactForm(form);
    // data = { referenceNumber, firstName, email, createdAt }

    // Store the server-generated reference number so the success screen shows it
    setServerData(data);
    setSubmitted(true);
  } catch (err) {
    // Server-side validation errors → merge into local error state
    if (err.errors && Object.keys(err.errors).length > 0) {
      setErrors(err.errors);
    } else {
      // Generic error (rate limit, 500, network failure)
      setServerError(err.message || "Something went wrong. Please try again.");
    }
  } finally {
    setSubmitting(false);
  }
};

*/