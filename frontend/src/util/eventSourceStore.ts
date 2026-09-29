let eventSource: EventSource | null = null;
const seenPosts = new Set();

const eventSourceStore = {
  seenPost(id: number) {
    const saw = seenPosts.has(id);
    if (!saw) {
      seenPosts.add(id);
    }
    return saw;
  },

  get: () => eventSource,

  connect() {
    eventSource = new EventSource("/api/v1/stream");
  },

  disconnect() {
    eventSource?.close();
    eventSource = null;
  },
};

export default eventSourceStore;
