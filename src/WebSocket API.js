export class WebSocketAPI {
    constructor(url) {
      this.url = url;
      this.socket = null;
      this.listeners = {
        message: [],
        open: [],
        close: [],
        error: []
      };
    }

    connect() {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = (event) => this._emitEvent('open', event);
      this.socket.onmessage = (event) => this._emitEvent('message', event);
      this.socket.onerror = (event) => this._emitEvent('error', event);
      this.socket.onclose = (event) => this._emitEvent('close', event);
    }

    send(data) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(data);
      } else {
        console.error('WebSocket is not open:', this.socket?.readyState);
      }
    }

    close() {
      if (this.socket) {
        this.socket.close();
      }
    }

    on(event, listener) {
      if (this.listeners[event]) {
        this.listeners[event].push(listener);
      }
    }

    _emitEvent(event, data) {
      this.listeners[event].forEach(listener => listener(data));
    }
  }

  