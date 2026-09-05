/* ==========================================================================
   hours.js — highlights today's row in the opening-hours list, and reports
   whether the salon is open right now.
   --------------------------------------------------------------------------
   Markup contract:
     .detail-list[data-hours]
       .detail-row[data-day="1"]     0 = Sunday … 6 = Saturday
         .detail-row__val[data-open-time="11:00"][data-close-time="19:00"]
     [data-hours-status]             optional live text target

   Hours are read from the markup, not hard-coded here — change them in the
   HTML and this keeps working.
   ========================================================================== */

export function init() {
  const list = document.querySelector("[data-hours]");
  if (!list) return;

  const now = new Date();
  const today = now.getDay();

  const row = list.querySelector(`[data-day="${today}"]`);
  if (row) row.dataset.today = "true";

  const status = document.querySelector("[data-hours-status]");
  if (!status || !row) return;

  const value = row.querySelector("[data-open-time]");
  if (!value) return;

  const open  = toMinutes(value.dataset.openTime);
  const close = toMinutes(value.dataset.closeTime);
  const mins  = now.getHours() * 60 + now.getMinutes();

  const isOpen = open !== null && close !== null && mins >= open && mins < close;
  status.textContent = isOpen ? "Open now" : "Closed now";
  status.dataset.state = isOpen ? "open" : "closed";
}

function toMinutes(value) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
}
