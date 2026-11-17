import { useQuery } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { db, documents } from "../../db";

export function useDocument(id: string | undefined) {
  return useQuery({
    queryKey: ["documents", id],
    queryFn: () =>
      db
        .select()
        .from(documents)
        .where(eq(documents.id, id as string))
        .get(),
    enabled: !!id,
  });
}
