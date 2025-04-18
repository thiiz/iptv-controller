class SessionManager {
    constructor() {
        this.sessions = new Map();
        // Em ambiente serverless, não é possível usar intervalos
        // pois o contexto não é mantido entre requisições
        if (process.env.NODE_ENV !== 'production') {
            this.cleanupInterval = setInterval(() => this.cleanup(), 1000 * 60 * 15);
        }
    }

    createSession(username, providerId) {
        const sessionId = `${username}_${providerId}_${Date.now()}`;
        this.sessions.set(sessionId, {
            username,
            providerId,
            createdAt: Date.now(),
            lastAccess: Date.now()
        });
        return sessionId;
    }

    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastAccess = Date.now();
            this.sessions.set(sessionId, session);
        }
        return session;
    }

    updateSession(sessionId, data) {
        const session = this.sessions.get(sessionId);
        if (session) {
            this.sessions.set(sessionId, {
                ...session,
                ...data,
                lastAccess: Date.now()
            });
            return true;
        }
        return false;
    }

    removeSession(sessionId) {
        return this.sessions.delete(sessionId);
    }

    getActiveSessions() {
        return Array.from(this.sessions.entries()).map(([id, session]) => ({
            id,
            ...session
        }));
    }

    getActiveSessionsByProviderId(providerId) {
        return this.getActiveSessions().filter(session =>
            session.providerId === providerId
        );
    }

    cleanup() {
        const now = Date.now();
        const timeout = 1000 * 60 * 60; // 1 hour

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastAccess > timeout) {
                this.sessions.delete(sessionId);
            }
        }
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.sessions.clear();
    }
}

module.exports = new SessionManager(); 