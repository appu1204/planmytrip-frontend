Drop short, muted, loopable background videos here, named exactly:

  auth-travel.mp4
Use a licensed, silent landscape clip (16:9, H.264 MP4, 720p or 1080p,
10-20 seconds, ideally under 8 MB). Auth plays it muted at 0.72x and skips
video for reduced-motion or data-saving preferences, using the travel photo
as its fallback.

  coming-soon-flights.mp4
  coming-soon-hotels.mp4
  coming-soon-activities.mp4
  coming-soon-transport.mp4

Each plays full-bleed behind its "Hold tight" screen (see
src/pages/misc/ComingSoon.jsx and src/theme/comingSoonContent.js).
Keep them short (10-20s), silent, and reasonably compressed (a few MB)
since they autoplay on page load — this isn't a video host. If a file
is missing, or fails to load, an animated brand-color gradient is shown
instead, so the page never looks broken while you're sourcing footage.
