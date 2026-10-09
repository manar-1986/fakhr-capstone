import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getChildren } from "../api/care-path.api";
import { Child } from "../types/child.types";

export function useActiveChild() {
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  const { data: rawChildren } = useQuery({
    queryKey: ["children"],
    queryFn: getChildren,
    retry: false,
  });

  const children = Array.isArray(rawChildren) ? rawChildren : [];
  const activeChild =
    children.find((child: Child) => child.id === activeChildId) || children[0];

  useEffect(() => {
    if (children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0].id);
    }
  }, [children, activeChildId]);

  return {
    activeChild,
    activeChildId,
    setActiveChildId,
  };
}
