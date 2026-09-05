class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.timestamps = [];
    this.queue = [];
  }

  _processQueue() {
    if (this.queue.length === 0) {
      return;
    }

    if (this.timestamps.length < this.maxRequests) {
      this.timestamps.push(Date.now());
      const { fn, resolve, reject } = this.queue.shift();
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this._processQueue();
        });
    } else {
      const now = Date.now();
      const earliest = this.timestamps[0];
      const delay = earliest + this.windowMs - now;
      setTimeout(() => {
        this.timestamps.shift();
        this._processQueue();
      }, delay);
    }
  }

  schedule(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this._processQueue();
    });
  }
}
