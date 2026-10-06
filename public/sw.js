/*
 * Rabotka Agent service worker: Web Push only. It has no fetch handler, so it
 * never caches or intercepts a request.
 *
 * Payload (from the backend's AgentWebPushService): { id, title, body, link }.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Rabotka", body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Rabotka", {
      body: data.body || "",
      icon: "/icon.png",
      badge: "/icon.png",
      // One entry per notification: a re-sent one replaces itself.
      tag: data.id || undefined,
      data: { link: data.link || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.link || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
      if (open) {
        await open.focus();
        if ("navigate" in open) await open.navigate(url).catch(() => undefined);
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
