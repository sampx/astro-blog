import { useEffect, useState } from "react";

interface Props {
  initialAuth: boolean;
  initialUsername?: string;
}

export default function AuthButtonsClient({ initialAuth, initialUsername }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuth);
  const [username, setUsername] = useState(initialUsername);

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
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (response.ok) {
        setIsLoggedIn(false);
        setUsername(undefined);
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="auth-buttons flex items-center gap-2">
      {isLoggedIn ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {username}
          </span>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
          >
            Logout
          </button>
        </>
      ) : (
        <a
          href="/login/github"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4"
        >
          Login
        </a>
      )}
    </div>
  );
}
