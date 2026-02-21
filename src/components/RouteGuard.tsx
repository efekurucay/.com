"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { routes } from "@/app/resources";
import { Flex, Spinner } from "@/once-ui/components";
import NotFound from "@/app/not-found";

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const [isRouteEnabled, setIsRouteEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRouteEnabled = () => {
      if (!pathname) return false;

      if (pathname in routes) {
        return routes[pathname as keyof typeof routes];
      }

      const dynamicRoutes = ["/blog", "/work", "/admin"] as const;
      for (const route of dynamicRoutes) {
        if (pathname?.startsWith(route) && routes[route]) {
          return true;
        }
      }

      return false;
    };

    setIsRouteEnabled(checkRouteEnabled());
    setLoading(false);
  }, [pathname]);

  if (loading) {
    return (
      <Flex fillWidth paddingY="128" horizontal="center">
        <Spinner />
      </Flex>
    );
  }

  if (!isRouteEnabled) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export { RouteGuard };
