import type { DemoAccount, DemoUser } from "@/types"

export const DEMO_PASSWORD = "Solandre2026"

export const initialDemoAccounts: DemoAccount[] = [
  {
    user: {
      id: "manager-demo",
      name: "Lucía Arancibia",
      email: "gerente@solandre.bo",
      role: "GERENTE",
    },
    password: DEMO_PASSWORD,
  },
  {
    user: {
      id: "kitchen-demo",
      name: "Marcos Quispe",
      email: "cocina@solandre.bo",
      role: "COCINERO",
    },
    password: DEMO_PASSWORD,
  },
  {
    user: {
      id: "client-demo",
      name: "Valeria Rojas",
      email: "cliente@solandre.bo",
      role: "CLIENTE",
    },
    password: DEMO_PASSWORD,
  },
]

export function authenticateDemoAccount(
  accounts: DemoAccount[],
  email: string,
  password: string,
): DemoUser | null {
  const normalizedEmail = email.trim().toLowerCase()
  const account = accounts.find(
    (candidate) =>
      candidate.user.email.toLowerCase() === normalizedEmail &&
      candidate.password === password,
  )

  return account?.user ?? null
}

export function createDemoAccount(
  accounts: DemoAccount[],
  name: string,
  email: string,
  password: string,
): { account?: DemoAccount; message?: string } {
  const normalizedEmail = email.trim().toLowerCase()
  const alreadyExists = accounts.some(
    (account) => account.user.email.toLowerCase() === normalizedEmail,
  )

  if (alreadyExists) {
    return { message: "Ya existe una cuenta con ese correo." }
  }

  const user: DemoUser = {
    id: `client-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    role: "CLIENTE",
  }

  return { account: { user, password } }
}

export function dashboardForRole(role: DemoUser["role"]): string {
  if (role === "GERENTE") return "/gerente"
  if (role === "COCINERO") return "/cocina"
  return "/cliente"
}
