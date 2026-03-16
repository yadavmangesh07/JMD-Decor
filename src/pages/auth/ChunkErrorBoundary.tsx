import  { Component, type ErrorInfo, type ReactNode } from "react";
import { authService } from "@/services/authService";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ChunkErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    // If the error is a "Loading chunk failed" or "JWT expired", 
    // we want to trigger our custom UI
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Auth/Chunk Error:", error, errorInfo);
    
    // If it's specifically a JWT expiry, clear local storage 
    // and force a refresh to the login page
    if (error.message.includes("JWT expired")) {
        authService.logout();
        window.location.reload();
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Session Synchronized</h2>
          <p className="text-slate-500 mt-2 font-medium">Your security token has expired for your protection.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
          >
            Re-authenticate
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}