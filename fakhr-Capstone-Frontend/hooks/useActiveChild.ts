import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getChildren } from "../api/children.api";
import { useAuth } from "../context/AuthContext";
import { Child } from "../api/children.api";

export function useActiveChild() {
  const {user} = useAuth();
  const [selection, setSelection] = useState<{account?:string; id:string|null}>({id:null});
  const activeChildId = selection.account === user?.id ? selection.id : null;
  const setActiveChildId = (id:string|null) => setSelection({account:user?.id,id});

  const { data: rawChildren } = useQuery({
    queryKey: ["children", user?.id],
    enabled: !!user,
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
  }, [children, activeChildId, user?.id]);

  return {
    activeChild,
    activeChildId,
    setActiveChildId,
  };
}

