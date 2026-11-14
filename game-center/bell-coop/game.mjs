// public/network/bell-identity.mjs
var BELL_PROFILE_KEY = "game-center:bell-coop:capability:v1";
function bellEndpoint(endpoint) {
  const u = new URL(endpoint);
  if (!["ws:", "wss:"].includes(u.protocol) || u.username || u.password) throw TypeError("Explicit cooperative WebSocket endpoint required");
  return u.origin + u.pathname;
}
function bellProfileKey(endpoint) {
  return BELL_PROFILE_KEY + ":endpoint:" + encodeURIComponent(bellEndpoint(endpoint));
}
function bellCredential(endpoint, storage = globalThis.localStorage) {
  try {
    return JSON.parse(storage.getItem(bellProfileKey(endpoint)) ?? "null");
  } catch {
    return null;
  }
}
function storeBellCredential(credential, endpoint, storage = globalThis.localStorage) {
  if (!credential || !/^[a-f0-9]{32}$/.test(credential.id) || !/^[a-f0-9]{48}$/.test(credential.secret)) throw TypeError("Invalid cooperative capability");
  storage.setItem(bellProfileKey(endpoint), JSON.stringify(credential));
}

// public/network/client.mjs
var ERROR_TEXT = { INVALID_MESSAGE: "\u6536\u5230\u65E0\u6548\u6D88\u606F\uFF0C\u8BF7\u91CD\u65B0\u8FDB\u5165\u3002", INVALID_INPUT: "\u64CD\u4F5C\u6570\u636E\u65E0\u6548\u3002", INVALID_CODE: "\u8BF7\u8F93\u5165\u516D\u4F4D\u6709\u6548\u9080\u8BF7\u7801\u3002", ROOM_NOT_FOUND: "\u5F53\u524D\u670D\u52A1\u5668\u4E0A\u627E\u4E0D\u5230\u6B64\u623F\u95F4\u3002\u8BF7\u6253\u5F00\u623F\u4E3B\u53D1\u6765\u7684\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\uFF1B\u53EA\u6709\u623F\u4E3B\u9700\u8981\u542F\u52A8\u670D\u52A1\u3002", ROOM_EXPIRED: "\u623F\u95F4\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u521B\u5EFA\u3002", ROOM_FULL: "\u623F\u95F4\u5DF2\u6709\u4E24\u4F4D\u73A9\u5BB6\u3002", MATCH_IN_PROGRESS: "\u5BF9\u5C40\u6B63\u5728\u8FDB\u884C\uFF0C\u8BF7\u7B49\u5F85\u7ED3\u675F\u3002", VERSION_MISMATCH: "\u9875\u9762\u7248\u672C\u5DF2\u8FC7\u65E7\uFF0C\u8BF7\u5237\u65B0\u540E\u91CD\u65B0\u8FDB\u5165\u3002", UNSUPPORTED_MODE: "\u670D\u52A1\u7AEF\u6682\u4E0D\u652F\u6301\u8FD9\u4E2A\u6E38\u620F\u6A21\u5F0F\u3002", INVALID_SESSION: "\u91CD\u8FDE\u65F6\u95F4\u5DF2\u8FC7\uFF0C\u8BF7\u91CD\u65B0\u52A0\u5165\u623F\u95F4\u3002", HOST_ONLY: "\u7531\u623F\u4E3B\u5F00\u59CB\u5BF9\u5C40\u3002", NOT_READY: "\u9700\u8981\u4E24\u4F4D\u73A9\u5BB6\u90FD\u51C6\u5907\u597D\u3002", NOT_IN_ROOM: "\u8BF7\u5148\u52A0\u5165\u623F\u95F4\u3002", ALREADY_IN_ROOM: "\u4F60\u5DF2\u7ECF\u5728\u623F\u95F4\u4E2D\u3002", NOT_PLAYING: "\u5F53\u524D\u4E0D\u5728\u5BF9\u5C40\u4E2D\u3002", SERVER_FULL: "\u8054\u673A\u670D\u52A1\u6682\u65F6\u5DF2\u6EE1\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002", MAINTENANCE: "\u8054\u673A\u670D\u52A1\u6B63\u5728\u7EF4\u62A4\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002", INTERNAL_ERROR: "\u8054\u673A\u670D\u52A1\u53D1\u751F\u9519\u8BEF\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" };
var RoomClient = class extends EventTarget {
  constructor(url, config2) {
    super();
    this.url = url;
    this.config = config2;
    this.storageKey = (config2.gameId ?? "network-lab") === "network-lab" ? "game-center:lab-session" : "game-center:" + config2.gameId + ":session";
    this.seq = 0;
    this.socket = null;
    this.explicit = false;
    this.reconnecting = false;
    this.session = null;
    this.state = null;
    this.samples = [];
    this.opening = null;
    this.epoch = 0;
    this.sessionReady = false;
    this.reconnectMs = 6e4;
    try {
      this.session = JSON.parse(sessionStorage.getItem(this.storageKey) ?? "null");
    } catch {
    }
  }
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
  send(message) {
    if (message.type === "input" && (!this.sessionReady || this.reconnecting)) return;
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
  }
  stopHeartbeat() {
    clearInterval(this.heartbeat);
    this.heartbeat = null;
  }
  startHeartbeat(socket) {
    this.stopHeartbeat();
    let lastTick = Date.now(), pendingAt = 0;
    const interval = this.config.heartbeatIntervalMs ?? 2e3, timeout = this.config.heartbeatTimeoutMs ?? 2e4;
    this.heartbeat = setInterval(() => {
      if (this.socket !== socket || this.explicit) {
        this.stopHeartbeat();
        return;
      }
      const now = Date.now();
      if (now - lastTick > timeout || globalThis.document?.visibilityState === "hidden") pendingAt = 0;
      lastTick = now;
      if (pendingAt && this.lastPong >= pendingAt) pendingAt = 0;
      if (pendingAt && now - pendingAt >= timeout) {
        this.failSocket(socket);
        return;
      }
      if (!pendingAt) {
        pendingAt = now;
        this.send({ type: "ping", sentAt: now });
      }
    }, interval);
    this.heartbeat.unref?.();
  }
  failSocket(socket) {
    if (this.socket !== socket || this.explicit) return;
    this.socket = null;
    this.welcomed = false;
    this.sessionReady = false;
    this.state = null;
    this.stopHeartbeat();
    socket.close();
    this.emit("disconnected");
    if (this.session && !this.reconnecting) void this.reconnect();
  }
  async connect({ resume = false, deadline = Infinity } = {}) {
    if (this.opening) return this.opening;
    if (this.welcomed && this.socket?.readyState === WebSocket.OPEN) return;
    this.explicit = false;
    this.welcomed = false;
    const epoch = this.epoch;
    const pending2 = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        error ? reject(error) : resolve();
      };
      this.cancelOpening = () => finish(Error("\u8FDE\u63A5\u5DF2\u53D6\u6D88\u3002"));
      const timeout = setTimeout(() => {
        finish(Error("\u65E0\u6CD5\u8FDE\u63A5\u8054\u673A\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5\u5730\u5740\u6216\u786E\u8BA4\u670D\u52A1\u5DF2\u542F\u52A8\u3002"));
        this.failSocket(socket);
      }, Math.max(1, Math.min(this.config.connectTimeoutMs ?? 6e3, deadline - Date.now())));
      socket.addEventListener("open", () => {
        if (this.socket !== socket || this.explicit) {
          socket.close();
          return;
        }
        this.send({ type: "hello", protocolVersion: this.config.protocolVersion, clientBuild: this.config.clientBuild, gameId: this.config.gameId ?? "network-lab", mode: this.config.mode ?? "duel", ...this.config.contentHash ? { contentHash: this.config.contentHash } : {}, ...this.config.gameId === "bell-corridor" ? { coopProtocol: this.config.protocol, sourceRevision: this.config.sourceRevision, source: this.config.source, profile: bellCredential(this.url) } : {} });
      });
      socket.addEventListener("message", (event) => {
        if (this.socket !== socket || this.explicit || this.epoch !== epoch) return;
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message.type === "coop-profile") {
          storeBellCredential(message.credential, this.url);
          this.emit("coop-profile", { id: message.credential.id });
        }
        if (message.type === "coop-profile-result" || message.type === "coop-runs" || message.type === "coop-command-result" || message.type === "coop-error" || message.type === "coop-input-rejected") this.emit(message.type, message);
        if (message.type === "welcome") {
          this.welcomed = true;
          this.arena = message.arena;
          if (Number.isFinite(message.reconnectMs)) this.reconnectMs = Math.max(1e3, Math.min(12e4, message.reconnectMs));
          this.startHeartbeat(socket);
          if (resume && this.session) this.send({ type: "resume", code: this.session.code, token: this.session.token });
          else {
            this.emit("connected", message);
            finish();
          }
        }
        if (message.type === "session") {
          this.session = { code: message.code, id: message.id, token: message.token };
          this.seq = 0;
          this.sessionReady = true;
          try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(this.session));
          } catch {
          }
          if (resume) {
            this.reconnecting = false;
            finish();
            this.emit("connected", message);
          }
          this.emit("session", this.session);
        }
        if (message.type === "snapshot" && this.sessionReady) {
          this.state = message;
          this.emit("state", message);
        }
        if (message.type === "error") {
          if (["INVALID_SESSION", "ROOM_NOT_FOUND", "ROOM_EXPIRED"].includes(message.code)) {
            this.clearSession();
            this.emit("left");
          }
          finish(Error(ERROR_TEXT[message.code] ?? "\u8FDE\u63A5\u5931\u8D25\u3002"));
          this.emit("problem", ERROR_TEXT[message.code] ?? "\u64CD\u4F5C\u672A\u6210\u529F\uFF0C\u8BF7\u91CD\u8BD5\u3002");
          if (resume) this.failSocket(socket);
        }
        if (message.type === "left") {
          this.clearSession();
          this.emit("left");
        }
        if (message.type === "closed") {
          this.explicit = true;
          this.stopHeartbeat();
          this.clearSession();
          finish(Error(ERROR_TEXT[message.reason] ?? "\u623F\u95F4\u5DF2\u5173\u95ED\u3002"));
          this.emit("left");
          this.emit("problem", ERROR_TEXT[message.reason] ?? "\u623F\u95F4\u5DF2\u5173\u95ED\u3002");
        }
        if (message.type === "pong") {
          this.lastPong = message.sentAt;
          const rtt = Math.max(0, Date.now() - message.sentAt);
          this.samples.push(rtt);
          if (this.samples.length > 30) this.samples.shift();
          this.emit("latency", { rtt, jitter: this.samples.length > 1 ? Math.round(Math.abs(rtt - this.samples.at(-2))) : 0 });
        }
      });
      socket.addEventListener("error", () => {
        if (this.socket !== socket) return;
        finish(Error("\u65E0\u6CD5\u8FDE\u63A5\u8054\u673A\u670D\u52A1\uFF0C\u8BF7\u68C0\u67E5\u5730\u5740\u6216\u786E\u8BA4\u670D\u52A1\u5DF2\u542F\u52A8\u3002"));
        this.failSocket(socket);
      });
      socket.addEventListener("close", () => {
        finish(Error("\u8054\u673A\u8FDE\u63A5\u5DF2\u5173\u95ED\u3002"));
        this.failSocket(socket);
      });
    }).finally(() => {
      if (this.opening === pending2) {
        this.opening = null;
        this.cancelOpening = null;
      }
    });
    this.opening = pending2;
    return pending2;
  }
  async reconnect() {
    if (this.reconnecting || this.explicit || !this.session) return;
    this.reconnecting = true;
    const epoch = this.epoch, deadline = Date.now() + this.reconnectMs;
    let attempt = 0;
    this.emit("problem", "\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6B63\u5728\u5C1D\u8BD5\u91CD\u8FDE\u3002");
    while (!this.explicit && this.session && Date.now() < deadline && epoch === this.epoch) {
      const base = Math.min(5e3, (this.config.retryBaseMs ?? 400) * 2 ** Math.min(attempt++, 4));
      await new Promise((r) => {
        this.retryResolve = r;
        this.retryTimer = setTimeout(r, Math.min(deadline - Date.now(), base * (0.75 + Math.random() * 0.5)));
      });
      this.retryResolve = null;
      if (this.explicit || epoch !== this.epoch || Date.now() >= deadline) break;
      try {
        await this.connect({ resume: true, deadline });
        if (this.explicit || epoch !== this.epoch) break;
        if (this.sessionReady) {
          this.reconnecting = false;
          return;
        }
      } catch {
      }
    }
    if (epoch === this.epoch) {
      this.reconnecting = false;
      if (!this.explicit) {
        this.cancelConnection();
        this.clearSession();
        this.emit("left");
        this.emit("problem", "\u672A\u80FD\u6062\u590D\u8FDE\u63A5\uFF0C\u8BF7\u91CD\u65B0\u52A0\u5165\u623F\u95F4\u3002");
      }
    }
  }
  clearSession() {
    this.session = null;
    this.state = null;
    this.sessionReady = false;
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
    }
  }
  cancelConnection() {
    this.stopHeartbeat();
    clearTimeout(this.retryTimer);
    this.retryResolve?.();
    this.cancelOpening?.();
    const socket = this.socket;
    this.socket = null;
    this.opening = null;
    this.welcomed = false;
    this.sessionReady = false;
    this.reconnecting = false;
    socket?.close();
  }
  leave() {
    this.explicit = true;
    this.epoch++;
    this.send({ type: "leave" });
    this.cancelConnection();
    this.clearSession();
    this.emit("left");
  }
  dispose() {
    this.explicit = true;
    this.epoch++;
    this.cancelConnection();
  }
  coopEnvelope() {
    const s = this.state, c = this.config;
    if (c.gameId !== "bell-corridor" || !s?.original) throw Error("Cooperative session is loading");
    return { protocol: c.protocol, sourceRevision: c.sourceRevision, source: c.source, contentHash: c.contentHash, matchId: s.matchId, generation: s.generation, runId: s.runId };
  }
  coopActor() {
    return this.state?.original?.players.find((p) => p.peerId === this.session?.id);
  }
  sendCoopCommand(request2) {
    const actor = this.coopActor(), connection = this.state?.original?.lifecycle.connections[actor?.id];
    this.send({ type: "coop-command", ...this.coopEnvelope(), request: { ...request2, actorEpoch: connection?.epoch } });
  }
  listCoopRuns() {
    this.send({ type: "coop-list" });
  }
  continueCoopRun(runId) {
    this.send({ type: "coop-continue", runId });
  }
  abandonCoopRun() {
    this.send({ type: "coop-abandon" });
  }
  sendInput(input) {
    if (this.reconnecting || !this.sessionReady || this.socket?.readyState !== WebSocket.OPEN || this.state?.state !== "playing") return null;
    if (this.config.gameId === "bell-corridor") {
      const actor = this.coopActor();
      if (!actor) return null;
      this.seq = Math.max(this.seq, actor.ack ?? 0);
      const seq2 = ++this.seq;
      this.send({ type: "input", seq: seq2, input: { ...input, actorEpoch: this.state.original.lifecycle.connections[actor.id].epoch }, ...this.coopEnvelope() });
      return seq2;
    }
    const seq = ++this.seq;
    this.send({ type: "input", seq, ...input });
    return seq;
  }
  input(x, y, aim, fire) {
    return this.sendInput({ x, y, aim, fire });
  }
};
Object.assign(ERROR_TEXT, { ROOM_GAME_MISMATCH: "\u8FD9\u4E2A\u9080\u8BF7\u7801\u5C5E\u4E8E\u53E6\u4E00\u6B3E\u6E38\u620F\uFF0C\u8BF7\u4ECE\u5BF9\u5E94\u5165\u53E3\u52A0\u5165\u3002", CONTENT_MISMATCH: "\u6E38\u620F\u5185\u5BB9\u7248\u672C\u4E0D\u540C\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u65B0\u52A0\u5165\u3002" });
Object.assign(ERROR_TEXT, { INVALID_SETTINGS: "\u623F\u95F4\u8BBE\u7F6E\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u5730\u56FE\u3001\u6B66\u5668\u548C\u6570\u503C\u8303\u56F4\u3002", INVALID_ATTRIBUTES: "\u5C5E\u6027\u8D85\u51FA\u5141\u8BB8\u8303\u56F4\uFF0C\u8BF7\u8C03\u6574\u540E\u4FDD\u5B58\u3002", INVALID_TALENTS: "\u5929\u8D4B\u9009\u62E9\u91CD\u590D\u6216\u8D85\u51FA\u672C\u623F\u95F4\u7684\u6B21\u6570\u3002", BUILD_REQUIRED: "\u8BF7\u5148\u4FDD\u5B58\u672C\u4EBA\u7684\u79D8\u5BC6\u5929\u8D4B\u9009\u62E9\uFF0C\u518D\u51C6\u5907\u3002", WEAPON_NOT_ALLOWED: "\u672C\u623F\u95F4\u672A\u5F00\u653E\u8FD9\u628A\u6B66\u5668\u3002" });
Object.assign(ERROR_TEXT, { ROOM_FULL: "\u623F\u95F4\u5DF2\u6EE1\u3002", NOT_READY: "\u8BF7\u7B49\u4EBA\u6570\u4E0E\u5206\u961F\u7B26\u5408\u89C4\u5219\uFF0C\u5E76\u8BA9\u5168\u5458\u51C6\u5907\u3002", INVALID_TEAM: "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u961F\u4F0D\u3002", TEAM_FULL: "\u8FD9\u652F\u961F\u4F0D\u5DF2\u6EE1\uFF0C\u8BF7\u9009\u62E9\u53E6\u4E00\u961F\u3002", SHOP_CLOSED: "\u8865\u7ED9\u65F6\u95F4\u5DF2\u7ED3\u675F\u3002", INVALID_ITEM: "\u8FD9\u4EF6\u8865\u7ED9\u6682\u65F6\u65E0\u6CD5\u8D2D\u4E70\u3002", INSUFFICIENT_COINS: "\u91D1\u5E01\u4E0D\u8DB3\u3002", SHOP_LIMIT: "\u8FD9\u4EF6\u8865\u7ED9\u5DF2\u8FBE\u5230\u8D2D\u4E70\u4E0A\u9650\u3002", INVALID_REQUEST: "\u8D2D\u4E70\u8BF7\u6C42\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002", NOT_SHOPPING: "\u5F53\u524D\u4E0D\u5728\u8865\u7ED9\u9636\u6BB5\u3002" });
Object.assign(ERROR_TEXT, { UNKNOWN_ITEM: "\u8FD9\u4EF6\u8865\u7ED9\u6682\u65F6\u65E0\u6CD5\u8D2D\u4E70\u3002", ITEM_LIMIT: "\u8FD9\u4EF6\u8865\u7ED9\u5DF2\u8FBE\u5230\u8D2D\u4E70\u4E0A\u9650\u3002", REQUEST_ID_REUSED: "\u8D2D\u4E70\u8BF7\u6C42\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u9009\u62E9\u3002", TOO_MANY_PURCHASES: "\u672C\u573A\u8D2D\u4E70\u6B21\u6570\u5DF2\u6EE1\u3002" });
Object.assign(ERROR_TEXT, { ROOM_TOO_LARGE: "\u623F\u95F4\u4EBA\u6570\u8D85\u8FC7\u6240\u9009\u73A9\u6CD5\u4E0A\u9650\uFF0C\u8BF7\u5148\u8BA9\u90E8\u5206\u73A9\u5BB6\u79BB\u5F00\u3002" });
Object.assign(ERROR_TEXT, { PROFILE_IN_USE: "\u6B64\u5408\u4F5C\u8EAB\u4EFD\u5DF2\u5728\u53E6\u4E00\u4E2A\u623F\u95F4\u4E2D\u3002", ACTIVE_RUN_EXISTS: "\u8FD8\u6709\u4E00\u573A\u672A\u7ED3\u675F\u7684\u8FDC\u5F81\uFF0C\u8BF7\u7EE7\u7EED\u6216\u5148\u653E\u5F03\u3002", INVALID_PROFILE: "\u5408\u4F5C\u8EAB\u4EFD\u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5\u672C\u673A\u4FDD\u5B58\u7684\u8EAB\u4EFD\u51ED\u636E\u3002", RUN_OWNER_REQUIRED: "\u8BF7\u4F7F\u7528\u53C2\u52A0\u8FD9\u573A\u8FDC\u5F81\u65F6\u7684\u5408\u4F5C\u8EAB\u4EFD\u3002", RUN_NOT_FOUND: "\u6CA1\u6709\u53EF\u7EE7\u7EED\u7684\u5408\u4F5C\u8FDC\u5F81\u3002", COOP_BUSY: "\u6B63\u5728\u5904\u7406\u64CD\u4F5C\uFF0C\u8BF7\u7A0D\u5019\u3002", COOP_LOADING: "\u6B63\u5728\u8F7D\u5165\u8FDC\u5F81\u3002", STALE_GENERATION: "\u8FDC\u5F81\u5DF2\u7ECF\u66F4\u65B0\uFF0C\u8BF7\u7B49\u5F85\u6700\u65B0\u753B\u9762\u3002" });

// public/network/invite.mjs
function invitationError(config2, pageUrl) {
  const expected = new URL(pageUrl).searchParams.get("service");
  return expected && config2.managedServiceId && expected !== config2.managedServiceId ? "\u8FD9\u4E0D\u662F\u623F\u4E3B\u6240\u5728\u7684\u670D\u52A1\u5668\u3002\u8BF7\u6253\u5F00\u623F\u4E3B\u53D1\u6765\u7684\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\uFF0C\u4E0D\u8981\u5728\u81EA\u5DF1\u7684\u7535\u8111\u53E6\u5F00\u540E\u53F0\u3002" : "";
}
function invitationUrl(config2, pageUrl, code, endpoint = config2.serverUrl) {
  if (config2.managedServiceId && endpoint !== config2.serverUrl) throw Error("\u5F53\u524D\u624B\u52A8\u8FDE\u63A5\u7684\u540E\u53F0\u4E0E\u672C\u9875\u4E0D\u540C\uFF0C\u8BF7\u6062\u590D\u672C\u9875\u9ED8\u8BA4\u8FDE\u63A5\u5730\u5740\u540E\u751F\u6210\u9080\u8BF7\u3002");
  const page = new URL(pageUrl), url = new URL(page.pathname, config2.inviteOrigin || page.origin);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw Error("\u9080\u8BF7\u5730\u5740\u65E0\u6548\u3002");
  if (!/^[A-Z2-9]{6}$/.test(code ?? "")) return "";
  url.searchParams.set("room", code);
  if (config2.managedServiceId && endpoint === config2.serverUrl) url.searchParams.set("service", config2.managedServiceId);
  return url.href;
}
function installInvitation({ config: config2, getCode, getEndpoint, feedback: feedback2 }) {
  const input = document.querySelector("#invite-url"), button = document.querySelector("#copy"), hint = document.querySelector("#join-hint"), mismatch = invitationError(config2, location.href);
  if (hint) {
    hint.hidden = !config2.managedServiceId;
    hint.textContent = config2.networkMode === "local" ? "\u5F53\u524D\u4EC5\u9650\u672C\u673A\u3002\u8DE8\u7535\u8111\u6E38\u73A9\u8BF7\u7531\u623F\u4E3B\u542F\u52A8\u5C40\u57DF\u7F51\u670D\u52A1\uFF0C\u518D\u5206\u4EAB\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u3002" : "\u52A0\u5165\u670B\u53CB\u7684\u623F\u95F4\uFF0C\u8BF7\u6253\u5F00\u623F\u4E3B\u53D1\u6765\u7684\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u3002\u53EA\u6709\u623F\u4E3B\u9700\u8981\u542F\u52A8\u670D\u52A1\u3002";
  }
  const assertDestination = () => {
    if (mismatch) throw Error(mismatch);
  };
  function update2() {
    if (input) {
      try {
        input.value = invitationUrl(config2, location.href, getCode(), getEndpoint());
      } catch (error) {
        input.value = "";
        return error.message;
      }
    }
  }
  button.onclick = async () => {
    try {
      const error = update2();
      if (error) throw Error(error);
      if (!input?.value) throw Error("\u8BF7\u5148\u521B\u5EFA\u6216\u52A0\u5165\u623F\u95F4\u3002");
      try {
        await navigator.clipboard.writeText(input.value);
        feedback2("\u9080\u8BF7\u94FE\u63A5\u5DF2\u590D\u5236\u3002");
      } catch {
        input.focus();
        input.select();
        feedback2("\u8BF7\u590D\u5236\u5DF2\u9009\u4E2D\u7684\u5B8C\u6574\u9080\u8BF7\u94FE\u63A5\u53D1\u7ED9\u670B\u53CB\u3002");
      }
    } catch (error) {
      feedback2(error.message);
    }
  };
  if (mismatch) feedback2(mismatch);
  return { update: update2, assertDestination };
}

// public/network/endpoint.mjs
var get = (storage, key) => {
  try {
    return storage?.getItem(key) || "";
  } catch {
    return "";
  }
};
var put = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
  } catch {
  }
};
var scoped = (config2, key) => `${key}:instance:${config2.managedServiceId}`;
function selectEndpoint(config2, { hostname, local, session, key = "game-center:server-url", fallbackKey } = {}) {
  const saved = config2.managedServiceId ? get(session, scoped(config2, key)) : get(local, key) || (fallbackKey ? get(local, fallbackKey) : "");
  return saved || config2.serverUrl || (!config2.offlineCollection && ["localhost", "127.0.0.1", "[::1]"].includes(hostname) ? "ws://127.0.0.1:8891/socket" : "");
}
function saveEndpoint(config2, value, { local, session, key = "game-center:server-url" } = {}) {
  put(local, key, value);
  if (config2.managedServiceId) put(session, scoped(config2, key), value);
}
function browserStorage() {
  let local, session;
  try {
    local = globalThis.localStorage;
  } catch {
  }
  try {
    session = globalThis.sessionStorage;
  } catch {
  }
  return { local, session, hostname: globalThis.location?.hostname };
}

// integrations/bell-corridor/authority.mjs
function decodeOriginalWire(value) {
  if (value && typeof value === "object") {
    if (!Array.isArray(value) && Object.keys(value).length === 1 && value.$number === "Infinity") return Infinity;
    return Array.isArray(value) ? value.map(decodeOriginalWire) : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decodeOriginalWire(v)]));
  }
  return value;
}

// integrations/bell-corridor/client.mjs
globalThis.__bellPresentationStorage = true;
var $ = (s) => document.querySelector(s);
var config = await (await fetch("config.json", { cache: "no-store" })).json();
var feedback = (text) => $("#coop-feedback").textContent = text;
var preview;
var previewToken = 0;
var client;
var state;
var presentation;
var loadingPresentation;
var modulePromise;
var profile;
var profileRevision = 0;
var activeRun;
var busy = false;
var disposed = false;
var frameTime = performance.now();
var lastInput = 0;
var latestInput;
var pendingActions = /* @__PURE__ */ new Set();
var identity = "";
var showRematch = false;
var pending = /* @__PURE__ */ new Map();
var serial = 0;
var lifetime = new AbortController();
var endpointOptions = { ...browserStorage(), key: "game-center:bell-coop:server-url", fallbackKey: "game-center:server-url" };
$("#coop-server").value = selectEndpoint(config, endpointOptions);
$("#coop-code").value = new URLSearchParams(location.search).get("room")?.toUpperCase().slice(0, 6) || "";
var invite = installInvitation({ config, getCode: () => client?.session?.code, getEndpoint: () => $("#coop-server").value.trim(), feedback });
var rid = () => crypto.randomUUID() + ":" + ++serial;
function clearPending() {
  for (const p of pending.values()) {
    clearTimeout(p.timer);
    p.reject(Error("\u623F\u95F4\u5DF2\u66F4\u65B0\uFF0C\u8BF7\u91CD\u65B0\u64CD\u4F5C\u3002"));
  }
  pending.clear();
}
function clearPresentation() {
  previewToken++;
  preview?.dispose();
  preview = null;
  loadingPresentation = null;
  presentation?.dispose();
  presentation = null;
  identity = "";
  latestInput = null;
  pendingActions.clear();
  clearPending();
}
function result(type, message) {
  const p = pending.get(message.requestId);
  if (!p || p.type !== type) return;
  if (type === "command" && (message.matchId !== p.matchId || message.generation !== p.generation || message.runId !== p.runId)) return;
  pending.delete(message.requestId);
  clearTimeout(p.timer);
  message.error ? p.reject(Error("\u64CD\u4F5C\u672A\u5B8C\u6210\uFF0C\u8BF7\u91CD\u8BD5\u3002")) : p.resolve(message.result);
}
function request(type, request2) {
  const c = client, context = type === "command" ? c.coopEnvelope() : {};
  return new Promise((resolve, reject) => {
    const requestId = request2.requestId || rid(), timer = setTimeout(() => {
      pending.delete(requestId);
      reject(Error("\u64CD\u4F5C\u4ECD\u672A\u786E\u8BA4\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"));
    }, 15e3);
    pending.set(requestId, { type, resolve, reject, timer, ...context });
    if (type === "command") c.sendCoopCommand({ ...request2, requestId });
    else c.send({ type: "coop-profile-command", request: { ...request2, requestId } });
  });
}
function command(requestData) {
  return request("command", requestData);
}
function send(type, extra = {}) {
  if (!client?.state?.original) return;
  client.send({ type, ...client.coopEnvelope(), ...extra });
}
function release() {
  if (presentation) {
    presentation.view.input.resetState();
    const a = presentation.actor.player;
    if (a) client?.sendInput({ move: { x: 0, z: 0 }, aimPoint: { ...a.aimPoint }, actions: [], keys: [] });
  }
  latestInput = null;
  pendingActions.clear();
}
function reset() {
  state = null;
  showRematch = false;
  clearPresentation();
  $("#coop-panel").hidden = false;
  $("#coop-room").hidden = true;
  $("#coop-entrance").hidden = false;
  $("#coop-partner").hidden = true;
  $("#coop-barrier").hidden = true;
  $("#coop-leave").hidden = true;
  $("#coop-status").textContent = "\u9080\u8BF7\u4E00\u4F4D\u670B\u53CB\u5E76\u80A9\u51FA\u53D1";
  $("#screen-loading")?.classList.add("hidden");
  $("#hud")?.classList.add("hidden");
  client?.listCoopRuns();
}
function getClient() {
  const url = new URL($("#coop-server").value.trim());
  if (!["ws:", "wss:"].includes(url.protocol) || url.search || url.hash || url.username || url.password) throw Error("\u8BF7\u8F93\u5165\u6709\u6548\u7684\u8054\u673A\u670D\u52A1\u5730\u5740\u3002");
  if (location.protocol === "https:" && url.protocol !== "wss:") throw Error("\u6B64\u9875\u9762\u9700\u8981\u5B89\u5168\u8FDE\u63A5\u3002");
  if (client?.url === url.href) return client;
  client?.dispose();
  clearPresentation();
  client = new RoomClient(url.href, config);
  client.addEventListener("connected", () => client.listCoopRuns());
  client.addEventListener("problem", (e) => feedback(e.detail));
  client.addEventListener("coop-command-result", (e) => result("command", e.detail));
  client.addEventListener("coop-profile-result", (e) => result("profile", e.detail));
  client.addEventListener("coop-runs", (e) => {
    profile = e.detail.profile;
    profileRevision = e.detail.revision;
    activeRun = e.detail.run;
    renderProfile();
    renderContinue();
  });
  client.addEventListener("session", () => {
    invite.update();
    $("#coop-leave").hidden = false;
  });
  client.addEventListener("left", reset);
  client.addEventListener("disconnected", () => {
    release();
    clearPending();
    $("#coop-status").textContent = "\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u6B63\u5728\u6062\u590D\u2026";
  });
  client.addEventListener("coop-error", () => {
    $("#coop-status").textContent = "\u4FDD\u5B58\u672A\u5B8C\u6210\uFF0C\u8FDC\u5F81\u5DF2\u6682\u505C";
  });
  client.addEventListener("state", (e) => {
    const next = decodeOriginalWire(e.detail);
    update(next).catch((error) => {
      feedback(error.message);
      $("#coop-panel").hidden = false;
      $("#coop-status").textContent = "\u753B\u9762\u672A\u80FD\u8F7D\u5165\uFF0C\u8BF7\u91CD\u65B0\u8FDB\u5165";
      clearPresentation();
    });
  });
  return client;
}
async function run(fn) {
  if (busy) return;
  busy = true;
  feedback("");
  try {
    invite.assertDestination();
    const c = getClient();
    await c.connect();
    await fn(c);
  } catch (e) {
    feedback(e.message);
  } finally {
    busy = false;
  }
}
function renderContinue() {
  const root = $("#coop-continue");
  root.replaceChildren();
  if (!activeRun) return;
  const title = document.createElement("p");
  title.textContent = "\u8FD8\u6709\u4E00\u573A\u672A\u7ED3\u675F\u7684\u5408\u4F5C\u8FDC\u5F81\u3002";
  root.append(title);
  for (const [label, fn] of [["\u7EE7\u7EED\u8FDC\u5F81", () => client.continueCoopRun(activeRun.id)], ["\u653E\u5F03\u8FD9\u573A\u8FDC\u5F81", () => client.abandonCoopRun()]]) {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = label;
    b.onclick = fn;
    root.append(b);
  }
}
function renderProfile() {
  const root = $("#coop-profile");
  if (!profile) return;
  root.replaceChildren();
  const canvas = document.createElement("canvas");
  canvas.className = "coop-preview";
  canvas.setAttribute("aria-label", "\u6240\u9009\u539F\u82F1\u96C4\u4E0E\u8D77\u59CB\u6B66\u5668\u5916\u89C2");
  root.append(canvas);
  const token = ++previewToken;
  preview?.dispose();
  preview = null;
  originalModules().then((m) => {
    if (token === previewToken && canvas.isConnected) preview = new m.OriginalLoadoutPreview(canvas, profile.selection);
  }).catch((e) => feedback(e.message));
  const balance = document.createElement("p");
  balance.textContent = "\u949F\u9B42 " + profile.souls;
  root.append(balance);
  const me = state?.players?.find((p) => p.id === client?.session?.id), selection = { ...profile.selection, ...me?.build ? { hero: me.build.heroId, paint: me.build.paint, sidearm: me.build.sidearm, supply: me.build.supply, route: me.build.route } : {} };
  for (const [category, label] of [["hero", "\u82F1\u96C4"], ["paint", "\u6D82\u88C5"], ["sidearm", "\u8D77\u59CB\u526F\u6B66\u5668"], ["supply", "\u51FA\u5F81\u8865\u7ED9"], ["route", "\u6784\u7B51\u8DEF\u7EBF"], ["modifier", "\u5168\u961F\u6311\u6218\uFF08\u9996\u4F4D\u73A9\u5BB6\u9009\u62E9\uFF09"]]) {
    const row = document.createElement("label");
    row.className = "coop-choice";
    row.textContent = label;
    const select = document.createElement("select");
    select.id = "coop-" + category;
    for (const item of profile.catalog[category]) {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.cn + (item.owned ? "" : ` \xB7 ${item.price ?? "\u5C1A\u672A\u5F00\u653E"} \u949F\u9B42`);
      select.append(option);
    }
    select.value = selection[category] ?? "";
    select.disabled = !!activeRun || !me?.build || category === "modifier" && me?.actorId !== "player";
    if (category === "modifier" && me?.actorId !== "player" && state?.teamModifier) select.value = state.teamModifier.id;
    const buy = document.createElement("button");
    buy.type = "button";
    buy.className = "btn small";
    const description = document.createElement("p");
    const refresh = () => {
      const item = profile.catalog[category].find((d) => d.id === select.value);
      buy.hidden = !!item?.owned;
      buy.textContent = "\u89E3\u9501";
      buy.disabled = !item || item.price === null || item.price > profile.souls || !!activeRun || category === "modifier" && me?.actorId !== "player";
      description.textContent = item?.desc || "";
    };
    const act = async (kind) => {
      try {
        const response = await request("profile", { kind, category, id: select.value, revision: profileRevision });
        profile = response.profile;
        profileRevision = response.revision;
        if (kind === "profile.buy") {
          const selected = await request("profile", { kind: "profile.select", category, id: select.value, revision: profileRevision });
          profile = selected.profile;
          profileRevision = selected.revision;
        }
        sendBuild();
        renderProfile();
      } catch (e) {
        feedback(e.message);
        refresh();
      }
    };
    select.onchange = () => {
      refresh();
      if (profile.catalog[category].find((i) => i.id === select.value)?.owned) act("profile.select");
    };
    buy.onclick = () => act("profile.buy");
    row.append(select, buy, description);
    root.append(row);
    refresh();
  }
}
function sendBuild() {
  if (!state || !profile || activeRun) return;
  const sel = profile.selection;
  client.send({ type: "build", build: { heroId: sel.hero, heroRuleVersion: 3, paint: sel.paint, sidearm: sel.sidearm, supply: sel.supply, route: sel.route, scheme: sel.hero === "foldshadow" ? "foldshadow" : null } });
}
function originalModules() {
  return modulePromise ??= (async () => {
    const module = await import("./original/src/runtime/browser_presentation.js");
    await module.preloadPresentationAssets();
    return module;
  })();
}
async function mount(next, me) {
  const key = [next.code, next.matchId, next.generation, next.runId, me.actorId].join(":");
  if (presentation && identity === key) return presentation;
  if (loadingPresentation?.key === key) return loadingPresentation.promise;
  clearPresentation();
  const token = { key };
  loadingPresentation = token;
  token.promise = (async () => {
    const m = await originalModules();
    if (disposed || loadingPresentation !== token) return null;
    const p = new m.OriginalCoopPresentation($("#game"), { localPlayerId: me.actorId, command, pause: (value) => send("coop-pause", { value }), onError: (e) => feedback(e.message) });
    p.onRelease = release;
    presentation = p;
    identity = key;
    return p;
  })();
  return token.promise;
}
async function update(next) {
  if (disposed) return;
  const me = next.players.find((p2) => p2.id === client.session?.id);
  if (!me) return;
  const old = state;
  state = next;
  if (next.state === "initializing") showRematch = false;
  $("#coop-room").hidden = false;
  $("#coop-entrance").hidden = true;
  $("#coop-leave").hidden = false;
  $("#coop-room-code").textContent = next.code;
  invite.update();
  const lobby = ["waiting", "initializing"].includes(next.state) || next.state === "result" && showRematch;
  $("#coop-panel").hidden = !lobby;
  $("#coop-preparation").hidden = !["waiting", "result"].includes(next.state);
  if (lobby) {
    if (presentation) clearPresentation();
    $("#coop-status").textContent = next.state === "initializing" ? "\u6B63\u5728\u51C6\u5907\u8FDC\u5F81\u2026" : "\u7B49\u5F85\u4F19\u4F34\u51C6\u5907";
    $("#coop-ready").hidden = !["waiting", "result"].includes(next.state);
    $("#coop-start").hidden = next.host !== me.id || !["waiting", "result"].includes(next.state);
    $("#coop-start").disabled = next.players.length !== 2 || !next.players.every((p2) => p2.connected && p2.ready);
    $("#coop-ready").textContent = me.ready ? "\u53D6\u6D88\u51C6\u5907" : "\u51C6\u5907";
    if (JSON.stringify(old?.players) !== JSON.stringify(next.players) || old?.teamModifier?.id !== next.teamModifier?.id) renderProfile();
    $("#coop-mode").disabled = next.host !== me.id || !!activeRun;
    $("#coop-difficulty").disabled = next.host !== me.id || !!activeRun;
    $("#coop-mode").value = next.settings.scope === "classic" ? "classic" : next.settings.profile;
    $("#coop-difficulty").value = next.settings.difficulty;
    $("#coop-players").replaceChildren(...next.players.map((p2) => {
      const li = document.createElement("li");
      li.textContent = (p2.id === me.id ? "\u4F60" : "\u961F\u53CB") + " \xB7 " + (profile?.catalog.hero.find((h) => h.id === p2.build?.heroId)?.cn || "\u6B63\u5728\u51C6\u5907") + " \xB7 " + (!p2.connected ? "\u7B49\u5F85\u91CD\u8FDE" : p2.ready ? "\u5DF2\u51C6\u5907" : "\u672A\u51C6\u5907");
      return li;
    }));
    return;
  }
  const p = await mount(next, me);
  if (!p || state !== next) return;
  if (!p.apply(next)) return;
  if (next.static) send("coop-static-ack", { revision: next.staticRevision });
  const event = next.events?.at(-1);
  if (event) send("coop-event-ack", { sequence: event.sequence });
  const connection = next.original.lifecycle.connections[me.actorId];
  if (connection.status === "loading" && p.connectionReady !== connection.epoch) {
    p.connectionReady = connection.epoch;
    send("coop-ready", { actorEpoch: connection.epoch });
  }
  const other = next.original.players.find((a) => a.id !== me.actorId);
  $("#coop-partner").hidden = false;
  $("#coop-partner").textContent = other ? (profile?.catalog.hero.find((h) => h.id === other.hero)?.cn || "\u961F\u53CB") + " \xB7 " + (other.alive ? `\u751F\u547D ${other.hp} \xB7 \u62A4\u7532 ${other.armor}` : "\u5012\u5730 \xB7 \u7B49\u5F85\u590D\u8D77") + ` \xB7 \u76F8\u8DDD ${Math.hypot(other.x - p.actor.player.x, other.z - p.actor.player.z).toFixed(0)} \u6B65` : "";
  const life = next.original.lifecycle, b = life.barrier, blocked = next.error || next.original.persistence.blocked || Object.values(life.connections).some((c) => c.status !== "ready");
  $("#coop-status").textContent = next.error || next.original.persistence.blocked ? "\u4FDD\u5B58\u672A\u5B8C\u6210\uFF0C\u8FDC\u5F81\u5DF2\u6682\u505C" : Object.values(life.connections).some((c) => c.status === "disconnected") ? "\u961F\u53CB\u6389\u7EBF\uFF0C\u7B49\u5F85\u91CD\u8FDE" : b ? "\u7B49\u5F85\u4E24\u4EBA\u4E00\u8D77\u524D\u8FDB" : next.state === "paused" ? next.pauseOwners?.includes(me.actorId) ? "\u8FDC\u5F81\u5DF2\u6682\u505C \xB7 \u4F60\u53EF\u4EE5\u7EE7\u7EED" : "\u7B49\u5F85\u961F\u53CB\u7EE7\u7EED" : next.state === "result" ? "\u672C\u6B21\u8FDC\u5F81\u7ED3\u675F" : "\u5E76\u80A9\u524D\u884C";
  const resume = $("#btn-resume");
  if (resume) {
    resume.disabled = next.state === "paused" && !next.pauseOwners?.includes(me.actorId);
    resume.textContent = resume.disabled ? "\u7B49\u5F85\u961F\u53CB\u7EE7\u7EED" : "\u7EE7\u7EED\u8FDC\u5F81";
  }
  const bar = $("#coop-barrier");
  bar.hidden = !b && !blocked;
  bar.querySelector("span").textContent = blocked ? "\u6B63\u5728\u7B49\u5F85\u8FDE\u63A5\u4E0E\u4FDD\u5B58\u786E\u8BA4\u2026" : b?.phase === "ready" ? "\u6B63\u5728\u8F7D\u5165\u4E0B\u4E00\u5904\u56DE\u5ECA\u2026" : b?.confirmed.includes(me.actorId) ? "\u5DF2\u51C6\u5907\uFF0C\u7B49\u5F85\u961F\u53CB\u4E00\u8D77\u524D\u8FDB" : "\u961F\u53CB\u5728\u7B49\u4F60\uFF0C\u4E00\u8D77\u524D\u5F80\u4E0B\u4E00\u5904\u56DE\u5ECA";
  bar.querySelector("button").hidden = !b || b.phase !== "confirm" || b.confirmed.includes(me.actorId) || blocked;
  bar.querySelector("button").onclick = () => command({ kind: "lifecycle.confirm", barrierId: b.id }).catch((e) => feedback(e.message));
  if (b?.phase === "ready" && !b.ready.includes(me.actorId) && p.readyBarrier !== b.id) {
    p.readyBarrier = b.id;
    command({ kind: "lifecycle.ready", barrierId: b.id }).catch((e) => {
      p.readyBarrier = null;
      feedback(e.message);
    });
  }
}
$("#coop-create").onclick = () => run((c) => c.send({ type: "create" }));
$("#coop-join").onsubmit = (e) => {
  e.preventDefault();
  run((c) => c.send({ type: "join", code: $("#coop-code").value.trim().toUpperCase() }));
};
$("#coop-ready").onclick = () => client.send({ type: "ready", value: !state.players.find((p) => p.id === client.session.id).ready });
$("#coop-start").onclick = () => client.send({ type: "start" });
$("#coop-leave").onclick = () => {
  release();
  client.leave();
};
for (const id of ["btn-save-quit", "btn-quit", "btn-death-hub", "btn-victory-hub", "btn-death-title", "btn-victory-title"]) {
  const button = document.getElementById(id);
  if (button) button.onclick = () => {
    release();
    client.leave();
  };
}
for (const id of ["btn-death-again", "btn-victory-again"]) {
  const button = document.getElementById(id);
  if (button) {
    button.textContent = "\u518D\u6765\u4E00\u5C40";
    button.onclick = () => {
      showRematch = true;
      clearPresentation();
      $("#coop-panel").hidden = false;
      $("#coop-preparation").hidden = false;
      client.listCoopRuns();
      client.send({ type: "ready", value: true });
    };
  }
}
function configure() {
  const mode = $("#coop-mode").value;
  client.send({ type: "configure", settings: { seed: state.settings.seed, profile: mode === "classic" ? "standard" : mode, scope: mode === "classic" ? "classic" : "full3", difficulty: $("#coop-difficulty").value } });
}
$("#coop-mode").onchange = configure;
$("#coop-difficulty").onchange = configure;
$("#coop-save-server").onclick = () => {
  try {
    client?.dispose();
    client = null;
    clearPresentation();
    getClient();
    saveEndpoint(config, $("#coop-server").value.trim(), endpointOptions);
    reset();
    feedback("\u8FDE\u63A5\u5730\u5740\u5DF2\u4FDD\u5B58\u3002");
  } catch (e) {
    feedback(e.message);
  }
};
function frame(now) {
  if (disposed) return;
  const dt = Math.min(0.05, (now - frameTime) / 1e3);
  frameTime = now;
  if (presentation) {
    try {
      const input = presentation.inputFrame();
      if (input) {
        latestInput = input;
        for (const action of input.actions) pendingActions.add(action);
      }
      if (now - lastInput >= 1e3 / 30 && latestInput && state?.state === "playing") {
        lastInput = now;
        client.sendInput({ ...latestInput, actions: [...pendingActions] });
        pendingActions.clear();
      }
      presentation.render(dt);
      presentation.view.input.endFrame();
    } catch (e) {
      feedback(e.message);
      $("#coop-status").textContent = "\u753B\u9762\u672A\u80FD\u7EE7\u7EED\uFF0C\u8BF7\u91CD\u65B0\u8FDB\u5165";
      clearPresentation();
    }
  }
  raf = requestAnimationFrame(frame);
}
window.addEventListener("blur", release, { signal: lifetime.signal });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) release();
}, { signal: lifetime.signal });
window.addEventListener("pagehide", () => {
  disposed = true;
  release();
  cancelAnimationFrame(raf);
  lifetime.abort();
  clearPresentation();
  client?.dispose();
}, { once: true });
var raf = requestAnimationFrame(frame);
reset();
try {
  const c = getClient();
  await c.connect({ resume: !!c.session });
  c.listCoopRuns();
} catch (e) {
  feedback(e.message);
}
if (new URLSearchParams(location.search).get("test") === "1") Object.defineProperty(window, "__BELL_COOP__", { get: () => ({ state, client, presentation, profile, profileRevision, pending: pending.size }) });
