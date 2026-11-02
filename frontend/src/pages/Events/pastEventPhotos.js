/* ==========================================================
   Past event photos
   File location: src/pages/Events/pastEventPhotos.js

   HOW TO ADD PHOTOS
   1. Put the image in public/images/past-events/
      Name it like:  cyberflix-2025-01.jpg, cyberflix-2025-02.jpg ...
      (event id, a dash, a two-digit number, .jpg)
   2. Add one line to PAST_PHOTOS below:
        photo("cyberflix-2025", 3, "Short caption for the photo"),
      The number must match the file name (3 -> 03).

   HOW TO ADD A PAST EVENT
   Add one object to PAST_EVENTS, then add its photos to PAST_PHOTOS
   using the same id.

   The event names, years, photo counts and captions below are
   placeholders. Replace them with your real ones.
   ========================================================== */

export const PAST_EVENTS = [
  { id: "cyberflix-2025", label: "Cyberflix 2025" },
  { id: "cyberfest-2025", label: "Cyberfest 2025" },
];

// Builds one photo entry and its image path from the event id and number.
const photo = (eventId, number, caption) => ({
  eventId,
  caption,
  src: `/images/past-events/${eventId}-${String(number).padStart(2, "0")}.jpg`,
});

export const PAST_PHOTOS = [
  photo("cyberflix-2025", 1, "Teams gather for the opening of Cyberflix"),
  photo("cyberflix-2025", 2, "Students testing their robots in the arena"),
  photo("cyberflix-2025", 3, "Live showcase on the main stage"),
  photo("cyberflix-2025", 4, "Mentors guiding a team during the challenge"),
  photo("cyberflix-2025", 5, "Winners with their trophies"),
  photo("cyberfest-2025", 1, "Opening ceremony at Cyberfest"),
  photo("cyberfest-2025", 2, "Hands-on robotics workshop"),
  photo("cyberfest-2025", 3, "Teams competing in the final round"),
  photo("cyberfest-2025", 4, "Parents and teachers watching the showcase"),
  photo("cyberfest-2025", 5, "Group photo at the end of the day"),
];