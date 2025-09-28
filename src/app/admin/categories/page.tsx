"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  TrendingUp,
  Package
} from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  description?: string
  productCount: number
  createdAt: string
}

export default function AdminCategoriesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [editCategory, setEditCategory] = useState({ name: "", description: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin?callbackUrl=/admin/categories")
      return
    }
    
    if (session.user?.role !== "ADMIN") {
      router.push("/")
      return
    }
    
    fetchCategories()
  }, [session, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategory.name.trim()) return

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      })
      
      if (response.ok) {
        setSuccess("Category created successfully")
        setNewCategory({ name: "", description: "" })
        setShowAddForm(false)
        fetchCategories()
      } else {
        setError("Failed to create category")
      }
    } catch (error) {
      console.error("Error creating category:", error)
      setError("Error creating category")
    }
  }

  const updateCategory = async (categoryId: string) => {
    if (!editCategory.name.trim()) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editCategory),
      })
      
      if (response.ok) {
        setSuccess("Category updated successfully")
        setEditingId(null)
        fetchCategories()
      } else {
        setError("Failed to update category")
      }
    } catch (error) {
      console.error("Error updating category:", error)
      setError("Error updating category")
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? This will affect all products in this category.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      })
      
      if (response.ok) {
        setSuccess("Category deleted successfully")
        fetchCategories()
      } else {
        setError("Failed to delete category")
      }
    } catch (error) {
      console.error("Error deleting category:", error)
      setError("Error deleting category")
    }
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditCategory({
      name: category.name,
      description: category.description || ""
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditCategory({ name: "", description: "" })
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
              <p className="mt-2 text-gray-600">
                Organize your product categories
              </p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Add Category Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add New Category</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Category Name</Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Create Category
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No categories yet</h2>
              <p className="text-gray-600 mb-6">
                Create your first category to organize your products.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {editingId === category.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${category.id}`}>Category Name</Label>
                          <Input
                            id={`edit-name-${category.id}`}
                            value={editCategory.name}
                            onChange={(e) => setEditCategory(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                          <Input
                            id={`edit-description-${category.id}`}
                            value={editCategory.description}
                            onChange={(e) => setEditCategory(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={cancelEditing}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => updateCategory(category.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {category.productCount} products
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary">
                              {new Date(category.createdAt).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => startEditing(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
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