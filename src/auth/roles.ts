import type { UserRole } from "@/types";

export function dashboardForRole(role: UserRole): string {
  if (role === "GERENTE") return "/gerente";
  if (role === "COCINERO") return "/cocina";
  return "/cliente";
}
