import { useEffect, useState } from 'react';
import type { Post } from '~/types';

interface Props {
  post: Post;
  children: React.ReactNode;
}

export default function ProtectedContent({ post, children }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          // 如果未登录，立即重定向到登录页面
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
          return;
        }
      } catch (error) {
        // 静默处理错误，返回未授权状态
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (post.protected) {
      checkAuth();
    } else {
      setIsLoggedIn(true);
      setIsLoading(false);
    }
  }, [post.protected]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isLoggedIn && post.protected) {
    return null; // 不显示任何内容，因为我们会重定向到登录页面
  }

  return <>{children}</>;
}
