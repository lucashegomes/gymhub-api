export interface User {
  id: string
  name: string
  email: string
  cpf: string
  passwordHash: string
  photoUrl?: string
  roleId: string
  status: "active" | "inactive" | "blocked"
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}
