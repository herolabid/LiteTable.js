/**
 * Mock data utilities for testing
 */

export interface User {
  id: number
  name: string
  email: string
  age: number
  department: string
  status: 'active' | 'inactive'
  salary: number
  joinDate: string
}

export function generateUser(id: number): User {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance']

  const firstName = firstNames[id % firstNames.length]
  const lastName = lastNames[Math.floor(id / firstNames.length) % lastNames.length]

  return {
    id,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    age: 25 + (id % 40),
    department: departments[id % departments.length],
    status: id % 3 === 0 ? 'inactive' : 'active',
    salary: 50000 + (id * 1000),
    joinDate: new Date(2020 + (id % 5), (id % 12), 1).toISOString()
  }
}

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) => generateUser(i + 1))
}

export const mockUsers = generateUsers(100)

export const mockColumns = [
  { id: 'id', header: 'ID', sortable: true },
  { id: 'name', header: 'Name', sortable: true },
  { id: 'email', header: 'Email', sortable: true },
  { id: 'age', header: 'Age', sortable: true },
  { id: 'department', header: 'Department', sortable: true },
  { id: 'status', header: 'Status', sortable: true },
  { id: 'salary', header: 'Salary', sortable: true }
]
