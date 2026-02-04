import { useEffect, useState } from "react";

interface Props {
  href: string;
  title: string;
  className?: string;
  children: React.ReactNode;
}

export default function ProtectedLink({
  href,
  title,
  className,
  children,
}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查登录状态
    fetch("/api/auth/status")
      .then((response) =>
        response.ok ? setIsLoggedIn(true) : setIsLoggedIn(false),
      )
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isLoggedIn) {
      // 已登录，正常导航
      return;
    }

    e.preventDefault();
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const loginUrl = new URL("/login", window.location.href);
    loginUrl.searchParams.set("redirect", href);
    loginUrl.searchParams.set("reason", "protected_post");
    loginUrl.searchParams.set("title", title);

    const loginWindow = window.open(
      loginUrl.toString(),
      "Login",
      `width=${width},height=${height},left=${left},top=${top},popup=1,toolbar=0`,
    );

    if (!loginWindow) {
      window.location.href = loginUrl.toString();
      return;
    }

    // 监听登录窗口关闭事件
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkLoginInterval: any = setInterval(() => {
      if (loginWindow.closed) {
        clearInterval(checkLoginInterval);
        // 检查登录状态
        fetch("/api/auth/status").then((response) => {
          if (response.ok) {
            // 登录成功，跳转到目标页面
            window.location.href = href;
          }
        });
      }
    }, 500);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
