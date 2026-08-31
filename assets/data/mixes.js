/* ===========================================================================
   YOUR MIX LIBRARY
   ---------------------------------------------------------------------------
   To add a mix:
     1. Drop the audio file into the /audio folder (MP3 or M4A, keep it under
        ~90 MB so Netlify serves it fast — 128–192 kbps is plenty for streaming).
     2. Copy one block below, change the details, save, redeploy.
     3. Cover art is optional. Leave "cover" as "" and the site draws a
        Crystal Groove record label for you.

   tags  -> become the filter buttons at the top of the Mixes page.
   time  -> shown before the file loads; the player corrects it once it knows.
   download: true adds a "Download" link under the mix.
   =========================================================================== */

window.SAS_MIXES = [
  {
    id: "golden-hour",
    title: "Golden Hour",
    subtitle: "Cocktail hour in wine country",
    src: "audio/golden-hour.mp3",
    cover: "",
    time: "58:12",
    tags: ["Weddings", "Cocktail Hour", "Soul"],
    notes: "Warm, unhurried, and just groovy enough that nobody notices they’ve been standing for an hour.",
    download: false
  },
  {
    id: "last-call-at-the-office",
    title: "Last Call at the Office",
    subtitle: "Holiday party, 10pm slot",
    src: "audio/last-call-at-the-office.mp3",
    cover: "",
    time: "1:04:40",
    tags: ["Corporate", "Peak Hour", "Disco"],
    notes: "The set that turns the VP of Finance into a person who does the worm.",
    download: false
  },
  {
    id: "clean-edits-only",
    title: "Clean Edits Only",
    subtitle: "School dance / rally energy",
    src: "audio/clean-edits-only.mp3",
    cover: "",
    time: "47:05",
    tags: ["Schools", "All Ages", "Pop"],
    notes: "Every track radio-clean and admin-approved. Yes, we checked the lyrics. Twice.",
    download: false
  },
  {
    id: "block-party",
    title: "Block Party",
    subtitle: "Farmers market to skate park",
    src: "audio/block-party.mp3",
    cover: "",
    time: "52:30",
    tags: ["Community", "All Ages", "Funk"],
    notes: "Daytime, outdoors, strollers and skateboards. Built to sound great at neighbor-friendly volume.",
    download: false
  }
];
