const CACHE_NAME = "purrfect-pet-care-v1"
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/features",
  "/about",
  "/contact",
  "/offline",
  "/manifest.json",
  // Add other static assets
]

const API_CACHE_URLS = ["/api/pets", "/api/appointments", "/api/notifications", "/api/reminders"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        return self.skipWaiting()
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            // Cache successful GET requests
            if (request.method === "GET" && response.status === 200) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => {
            // Return cached version if available
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              // Return offline response for API calls
              return new Response(
                JSON.stringify({
                  error: "Offline",
                  message: "This feature is not available offline",
                }),
                {
                  status: 503,
                  headers: { "Content-Type": "application/json" },
                },
              )
            })
          })
      }),
    )
    return
  }

  // Handle page requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline")
          }
          return new Response("Offline", { status: 503 })
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle offline actions when back online
      handleBackgroundSync(),
    )
  }
})

// Push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      data: data.data,
      actions: [
        {
          action: "view",
          title: "View",
          icon: "/icons/view-24x24.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
          icon: "/icons/dismiss-24x24.png",
        },
      ],
      requireInteraction: true,
      tag: data.tag || "default",
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    const urlToOpen = event.notification.data?.url || "/dashboard"

    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus()
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
    )
  }
})

async function handleBackgroundSync() {
  // Handle queued offline actions
  const offlineActions = await getOfflineActions()

  for (const action of offlineActions) {
    try {
      await processOfflineAction(action)
      await removeOfflineAction(action.id)
    } catch (error) {
      console.error("Failed to process offline action:", error)
    }
  }
}

async function getOfflineActions() {
  // Retrieve offline actions from IndexedDB
  return []
}

async function processOfflineAction(action) {
  // Process the offline action
  const response = await fetch(action.url, {
    method: action.method,
    headers: action.headers,
    body: action.body,
  })
  return response
}

async function removeOfflineAction(actionId) {
  // Remove processed action from IndexedDB
}
