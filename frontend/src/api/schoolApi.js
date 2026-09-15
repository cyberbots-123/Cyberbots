// src/api/schoolApi.js — PHASE 1 UPDATE (drop-in replacement)
//
// Every request goes through http.js's apiFetch: shared 401 handling
// (clear session, throw — no reload), one error shape { message, errors,
// status }, and no circular import back into authApi.
//
// PHASE 1 change: uploadMediaPhotos / deleteMediaPhoto now take a rowRef
// object ({ rowId, rowIndex }) instead of a bare rowIndex. rowId is the
// stable per-row identity photos attach to; rowIndex rides along only as a
// legacy fallback for rows saved before the rowId migration ran. The server
// prefers rowId whenever it's present.
//
// MULTI-FACULTY PROFILE: uploadFacultyPhoto / deleteFacultyPhoto /
// uploadSignaturePhoto / deleteSignaturePhoto below all take a `facultyId`
// now (previously just `schoolId` [, file]) — a school can have more than
// one faculty member on its Faculty Profile page, so every one of these
// calls has to say WHICH member's card it's uploading to. `facultyId` is
// `entry.id` from AdminPanel's facultyProfiles array, sent as a plain
// field alongside the file (uploads) or as the JSON body (deletes); the
// backend resolves it via findFacultyIndex() in schoolController.js. Same
// immediate-save pattern as uploadSchoolLogo / deleteSchoolLogo otherwise —
// these hit the server directly and are not staged behind updateSchool()'s
// "Save changes" flow.

import { apiFetch } from "./http";

// ── Client ─────────────────────────────────────────────────────────────────
export const getMySchool = () => apiFetch("/api/schools/me", { auth: true });

// ── Admin ──────────────────────────────────────────────────────────────────
export const getAllSchools = (query = "") =>
  apiFetch(`/api/schools${query}`, { auth: true });

export const getSchoolById = (id) =>
  apiFetch(`/api/schools/${id}`, { auth: true });

export const createSchool = (data) =>
  apiFetch("/api/schools", { method: "POST", auth: true, body: JSON.stringify(data) });

// NOTE (Phase 1, optimistic concurrency): `data` is the whole school object,
// which already carries the `updatedAt` loaded from the server — the backend
// uses it as a conflict check and answers 409 if someone else saved this
// school in the meantime. Nothing extra to send from here.
export const updateSchool = (id, data) =>
  apiFetch(`/api/schools/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(data) });

export const updateDeliverable = (id, name, status) =>
  apiFetch(`/api/schools/${id}/deliverables`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ name, status }),
  });

// FIX (kept): deleteSchool requires a separate deletion password — sent in
// the DELETE body and verified server-side against SCHOOL_DELETE_PASSWORD.
export const deleteSchool = (id, password) =>
  apiFetch(`/api/schools/${id}`, {
    method: "DELETE",
    auth: true,
    body: JSON.stringify({ password }),
  });

// ── Media photo uploads (admin only) ────────────────────────────────────────
// PHASE 1: rowRef = { rowId, rowIndex }. rowId ties the uploaded photos to a
// specific mediaRows entry no matter how the rows are later reordered or
// pruned; rowIndex is included only for rows that predate the migration and
// have no rowId yet. The row must already exist on the SAVED school document.
export const uploadMediaPhotos = (schoolId, rowRef, fileList) => {
  const formData = new FormData();
  if (rowRef && rowRef.rowId) formData.append("rowId", rowRef.rowId);
  if (rowRef && rowRef.rowIndex !== undefined && rowRef.rowIndex !== null) {
    formData.append("rowIndex", rowRef.rowIndex);
  }
  Array.from(fileList).forEach((file) => formData.append("files", file));

  return apiFetch(`/api/schools/${schoolId}/media/upload`, {
    method: "POST",
    auth: true,
    body: formData, // apiFetch detects FormData and skips the JSON header
  });
};

export const deleteMediaPhoto = (schoolId, rowRef, filename) =>
  apiFetch(`/api/schools/${schoolId}/media/upload`, {
    method: "DELETE",
    auth: true,
    // rowId: undefined is dropped by JSON.stringify, so legacy rows without
    // one automatically fall back to the rowIndex path server-side.
    body: JSON.stringify({ rowId: rowRef?.rowId, rowIndex: rowRef?.rowIndex, filename }),
  });

// ── School logo upload (admin only) ─────────────────────────────────────────
// Saves immediately server-side — not staged behind updateSchool()'s
// "Save changes" flow, same as the media photo uploads above.
export const uploadSchoolLogo = (schoolId, file) => {
  const formData = new FormData();
  formData.append("logo", file);

  return apiFetch(`/api/schools/${schoolId}/logo`, {
    method: "POST",
    auth: true,
    body: formData,
  });
};

export const deleteSchoolLogo = (schoolId) =>
  apiFetch(`/api/schools/${schoolId}/logo`, { method: "DELETE", auth: true });

// ── Faculty Profile photo upload (admin only) ───────────────────────────────
// FIX — was missing `facultyId` entirely (just `(schoolId, file)`), which is
// what caused "No photo file was uploaded" from the server: AdminPanel calls
// this as uploadFacultyPhoto(schoolId, facultyId, file), so with only two
// declared params the real `file` argument (3rd) was silently dropped and
// this function's own `file` param was actually bound to the `facultyId`
// string passed in 2nd position — so formData.append("photo", file) sent a
// TEXT field, not a file part, and multer never saw a file to attach.
//
// `facultyId` is sent as an ordinary form field alongside the photo so the
// backend's findFacultyIndex() knows which entry in facultyProfiles[] to
// write the resulting URL onto.
export const uploadFacultyPhoto = (schoolId, facultyId, file) => {
  const formData = new FormData();
  formData.append("facultyId", facultyId);
  formData.append("photo", file);

  return apiFetch(`/api/schools/${schoolId}/faculty-photo`, {
    method: "POST",
    auth: true,
    body: formData,
  });
};

// FIX — same missing-facultyId issue as uploadFacultyPhoto above. No file is
// involved here, so facultyId goes in the JSON body instead of FormData —
// same shape deleteMediaPhoto already uses for its own row reference.
export const deleteFacultyPhoto = (schoolId, facultyId) =>
  apiFetch(`/api/schools/${schoolId}/faculty-photo`, {
    method: "DELETE",
    auth: true,
    body: JSON.stringify({ facultyId }),
  });

// ── Faculty Profile signature image upload (admin only) ────────────────────
// The signatory's (e.g. Managing Director's) signature shown in the card
// footer. Same immediate-save pattern as uploadFacultyPhoto above, and the
// same facultyId fix applies here for the same reason.
export const uploadSignaturePhoto = (schoolId, facultyId, file) => {
  const formData = new FormData();
  formData.append("facultyId", facultyId);
  formData.append("signature", file);

  return apiFetch(`/api/schools/${schoolId}/signature-photo`, {
    method: "POST",
    auth: true,
    body: formData,
  });
};

export const deleteSignaturePhoto = (schoolId, facultyId) =>
  apiFetch(`/api/schools/${schoolId}/signature-photo`, {
    method: "DELETE",
    auth: true,
    body: JSON.stringify({ facultyId }),
  });