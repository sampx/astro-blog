import { useEffect, useState } from "react";

interface Props {
  initialAuth: boolean;
  initialUsername?: string;
}

export default function AuthButtonsClient({ initialAuth, initialUsername }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuth);
  const [username, setUsername] = useState(initialUsername);
  const [loginHref, setLoginHref] = useState("/login/github");

  useEffect(() => {
    // 在客户端更新登录链接
    const currentPath = window.location.pathname + window.location.search;
    setLoginHref(`/login/github?redirect=${encodeURIComponent(currentPath)}`);
  }, []);

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      loginHref,
      "Login with GitHub",
      `width=${width},height=${height},left=${left},top=${top},popup=1,toolbar=0`
    );
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUsername(data.username);
      } else {
        setIsLoggedIn(false);
        setUsername(undefined);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setIsLoggedIn(false);
      setUsername(undefined);
    }
  };

  useEffect(() => {
    // 初始加载时检查状态
    checkAuthStatus();

    // 设置定期检查
    const interval = setInterval(checkAuthStatus, 60000);

    // 页面可见性变化时检查
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAuthStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 监听路由变化
    const handleRouteChange = () => {
      checkAuthStatus();
    };
    document.addEventListener("astro:page-load", handleRouteChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("astro:page-load", handleRouteChange);
    };
  }, []);

  // 当 props 变化时更新状态
  useEffect(() => {
    setIsLoggedIn(initialAuth);
    setUsername(initialUsername);
  }, [initialAuth, initialUsername]);

  const handleLogout = async () => {
    try {
      const currentPath = window.location.pathname + window.location.search;
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (response.ok) {
        setIsLoggedIn(false);
        setUsername(undefined);
        window.location.href = currentPath;
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="auth-buttons flex items-center gap-2">
      {isLoggedIn ? (
        <>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.5a5.5 5.5 0 00-3.096 10.047 9.005 9.005 0 00-5.9 8.18.75.75 0 001.5.045 7.5 7.5 0 0114.993 0 .75.75 0 001.499-.044 9.005 9.005 0 00-5.9-8.181A5.5 5.5 0 0012 2.5zM8 8a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
            </svg>
            {username}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none bg-white hover:bg-gray-50 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white h-8 px-3 ml-2 border border-gray-400 dark:border-slate-600 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </>
      ) : (
        <a
          href={loginHref}
          onClick={handleLogin}
          className="inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:opacity-50 disabled:pointer-events-none bg-white hover:bg-gray-50 text-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white h-8 px-3 border border-gray-400 dark:border-slate-600 shadow-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Login
        </a>
      )}
    </div>
  );
}
