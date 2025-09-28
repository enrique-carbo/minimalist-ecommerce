"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { 
  Search, 
  User, 
  Mail, 
  Calendar,
  Shield,
  Users
} from "lucide-react"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  orderCount: number
  totalSpent: number
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/users")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchUsers()
  }, [session, router])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (roleFilter && roleFilter !== "all") params.append("role", roleFilter)
      if (sortBy) params.append("sort", sortBy)

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800"
      case "USER":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, roleFilter, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
              <p className="mt-2 text-gray-600">
                View and manage user accounts
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="orders">Most Orders</SelectItem>
                <SelectItem value="spent">Most Spent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No users found</h2>
              <p className="text-gray-600">
                {searchTerm || roleFilter 
                  ? "Try adjusting your search criteria." 
                  : "There are no users in the system yet."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge className={getRoleColor(user.role)}>
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.orderCount} orders • ${user.totalSpent.toFixed(2)}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}