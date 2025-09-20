import { sqliteDB } from './sqliteDatabase';
import { v4 as uuidv4 } from 'uuid';

// Local Authentication Service - No external dependencies
export class LocalAuthService {
  private currentUser: any = null;
  private sessionToken: string | null = null;

  constructor() {
    this.loadStoredSession();
  }

  private loadStoredSession() {
    const storedSession = localStorage.getItem('agentricai_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session.expiresAt > Date.now()) {
          this.currentUser = session.user;
          this.sessionToken = session.token;
        } else {
          localStorage.removeItem('agentricai_session');
        }
      } catch (error) {
        console.warn('Failed to load stored session:', error);
        localStorage.removeItem('agentricai_session');
      }
    }
  }

  private saveSession(user: any, token: string) {
    const session = {
      user,
      token,
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem('agentricai_session', JSON.stringify(session));
    this.currentUser = user;
    this.sessionToken = token;
  }

  private clearSession() {
    localStorage.removeItem('agentricai_session');
    this.currentUser = null;
    this.sessionToken = null;
  }

  async signIn(email: string, password: string): Promise<{ user: any; role: string }> {
    // Check for admin credentials
    if (email === 'agentricaiuiux@gmail.com' && password === 'agentricaiADMIN') {
      const adminUser = {
        id: 'admin-user',
        email: 'agentricaiuiux@gmail.com',
        name: 'AgentricAI Admin',
        role: 'admin',
        user_metadata: { name: 'AgentricAI Admin' }
      };
      
      const token = uuidv4();
      this.saveSession(adminUser, token);
      
      // Log authentication
      await sqliteDB.logAuthEvent(adminUser.id, 'sign_in', email);
      
      return { user: adminUser, role: 'admin' };
    }

    // Check for demo student
    if (email === 'student@example.com' && password === 'demo123') {
      const studentUser = {
        id: 'student-demo',
        email: 'student@example.com',
        name: 'Demo Student',
        role: 'student',
        user_metadata: { name: 'Demo Student' }
      };
      
      const token = uuidv4();
      this.saveSession(studentUser, token);
      
      // Log authentication
      await sqliteDB.logAuthEvent(studentUser.id, 'sign_in', email);
      
      return { user: studentUser, role: 'student' };
    }

    // Check database for other users
    const user = await sqliteDB.getUserByEmail(email);
    if (user) {
      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll accept any password for existing users
      const token = uuidv4();
      const authUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        user_metadata: { name: user.name }
      };
      
      this.saveSession(authUser, token);
      
      // Log authentication
      await sqliteDB.logAuthEvent(user.id, 'sign_in', email);
      
      return { user: authUser, role: user.role };
    }

    throw new Error('Invalid email or password');
  }

  async signUp(email: string, password: string, name: string): Promise<{ user: any; role: string }> {
    // Check if user already exists
    const existingUser = await sqliteDB.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const userData = {
      email,
      name,
      role: 'student',
      permissions: ['basic_access']
    };

    const user = await sqliteDB.createUser(userData);
    
    const token = uuidv4();
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      user_metadata: { name: user.name }
    };
    
    this.saveSession(authUser, token);
    
    // Log authentication
    await sqliteDB.logAuthEvent(user.id, 'sign_up', email);
    
    return { user: authUser, role: user.role };
  }

  async signOut(): Promise<void> {
    if (this.currentUser) {
      // Log sign out
      await sqliteDB.logAuthEvent(this.currentUser.id, 'sign_out', this.currentUser.email);
    }
    
    this.clearSession();
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  getSession(): { user: any; token: string } | null {
    if (this.currentUser && this.sessionToken) {
      return {
        user: this.currentUser,
        token: this.sessionToken
      };
    }
    return null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.sessionToken !== null;
  }

  // Session management
  onAuthStateChange(callback: (event: string, session: any) => void): () => void {
    // Simple event listener for auth state changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'agentricai_session') {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue);
            if (session.expiresAt > Date.now()) {
              this.currentUser = session.user;
              this.sessionToken = session.token;
              callback('SIGNED_IN', session);
            }
          } catch (error) {
            console.warn('Failed to parse session from storage:', error);
          }
        } else {
          this.currentUser = null;
          this.sessionToken = null;
          callback('SIGNED_OUT', null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
}

// Export singleton instance
export const localAuth = new LocalAuthService();