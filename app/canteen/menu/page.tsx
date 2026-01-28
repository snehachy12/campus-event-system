"use client"

import { useState, useEffect } from "react"
import { MenuImageExtractor } from "@/components/menu-image-extractor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Eye,
  EyeOff,
  Star,
  Clock,
  IndianRupee,
  Utensils,
  Bell,
  Save,
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Database
} from "lucide-react"


interface MenuItem {
  _id: string
  canteenId: string
  name: string
  description: string
  price: number
  category: string
  image: string | null
  isVeg: boolean
  isSpicy: boolean
  prepTime: number
  rating: number
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export default function CanteenMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isVeg: true,
    isSpicy: false,
    prepTime: "",
    isAvailable: true
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const categories = [
    "Main Course",
    "Appetizers", 
    "Beverages",
    "Desserts",
    "Snacks",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Healthy Options"
  ]

  const [isLoading, setIsLoading] = useState(false)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [currentDigitalMenuId, setCurrentDigitalMenuId] = useState<string | null>(null)
  const [digitalMenuLink, setDigitalMenuLink] = useState<string | null>(null)

  // Get canteen ID from localStorage on component mount
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        if (user.role === 'canteen' && user.id) {
          setCanteenId(user.id)
        }
      }
    } catch (error) {
      console.error('Error getting canteen ID:', error)
    }
  }, [])

  // Load menu items from database when canteenId is available
  useEffect(() => {
    if (canteenId) {
      fetchMenuItems()
    }
  }, [canteenId])

  const fetchMenuItems = async () => {
    if (!canteenId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/canteen/menu?canteenId=${canteenId}`)
      const result = await response.json()
      
      if (response.ok) {
        setMenuItems(result.data || [])
      } else {
        console.error('Error fetching menu items:', result.error)
        alert('Error loading menu items: ' + result.error)
      }
    } catch (error) {
      console.error('Error fetching menu items:', error)
      alert('Error loading menu items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExtractedItem = async (item: any, digitalMenuId: string) => {
    if (!canteenId) {
      alert("Canteen ID not found. Please login again.")
      return
    }

    try {
      const itemData = {
        canteenId: canteenId,
        name: item.name,
        description: `Extracted from menu image`,
        price: item.price,
        category: item.category || "Extracted Items",
        image: null,
        isVeg: true, // default
        isSpicy: false, // default
        prepTime: 10, // default
        isAvailable: true,
        digitalMenuId: digitalMenuId // Use the passed ID
      }

      const response = await fetch('/api/canteen/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      })

      const result = await response.json()
      
      if (response.ok) {
        // Refresh menu items
        await fetchMenuItems()
      } else {
        alert('Error adding item: ' + result.error)
      }
    } catch (error) {
      console.error('Error adding extracted item:', error)
      alert('Error adding item. Please try again.')
    }
  }

  const handleLoadSampleData = async () => {
    if (!canteenId) {
      alert("Canteen ID not found. Please login again.")
      return
    }

    if (confirm("This will add sample menu items to your database. Continue?")) {
      setIsLoading(true)
      try {
        // Load sample data and save each item to database
        const { sampleMenuItems } = await import("@/lib/sample-menu-data")
        
        for (const item of sampleMenuItems) {
          const itemData = {
            ...item,
            canteenId: canteenId,
            id: undefined // Remove the id so MongoDB can generate a new one
          }
          
          const response = await fetch('/api/canteen/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Error creating sample item:', error)
          }
        }
        
        // Refresh the menu items
        await fetchMenuItems()
        alert("Sample menu data loaded successfully!")
      } catch (error) {
        console.error('Error loading sample data:', error)
        alert('Error loading sample data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      isVeg: true,
      isSpicy: false,
      prepTime: "",
      isAvailable: true
    })
    setImageFile(null)
    setImagePreview(null)
    setEditingItem(null)
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      isVeg: item.isVeg,
      isSpicy: item.isSpicy,
      prepTime: item.prepTime.toString(),
      isAvailable: item.isAvailable
    })
    setImagePreview(item.image)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      alert("Please fill in all required fields")
      return
    }

    if (!canteenId) {
      alert("Canteen ID not found. Please login again.")
      return
    }

    setIsLoading(true)
    try {
      const itemData = {
        canteenId: canteenId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        image: imagePreview,
        isVeg: formData.isVeg,
        isSpicy: formData.isSpicy,
        prepTime: formData.prepTime,
        isAvailable: formData.isAvailable,
      }

      let response
      if (editingItem) {
        // Update existing item
        response = await fetch('/api/canteen/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...itemData, id: editingItem._id })
        })
      } else {
        // Create new item
        response = await fetch('/api/canteen/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
      }

      const result = await response.json()
      
      if (response.ok) {
        // Refresh menu items
        await fetchMenuItems()
        setIsDialogOpen(false)
        resetForm()
        alert(editingItem ? "Menu item updated successfully!" : "Menu item created successfully!")
      } else {
        alert('Error saving menu item: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert('Error saving menu item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/canteen/menu?id=${id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (response.ok) {
          // Refresh menu items
          await fetchMenuItems()
          alert("Menu item deleted successfully!")
        } else {
          alert('Error deleting menu item: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting menu item:', error)
        alert('Error deleting menu item. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleAvailability = async (id: string) => {
    const item = menuItems.find(item => item._id === id)
    if (!item) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/canteen/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          canteenId: canteenId,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          isVeg: item.isVeg,
          isSpicy: item.isSpicy,
          prepTime: item.prepTime,
          isAvailable: !item.isAvailable,
        })
      })
      
      const result = await response.json()
      
      if (response.ok) {
        // Refresh menu items
        await fetchMenuItems()
      } else {
        alert('Error updating availability: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Error updating availability. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesAvailability = selectedAvailability === "all" || 
                               (selectedAvailability === "available" && item.isAvailable) ||
                               (selectedAvailability === "unavailable" && !item.isAvailable)
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const stats = {
    total: menuItems.length,
    available: menuItems.filter(item => item.isAvailable).length,
    unavailable: menuItems.filter(item => !item.isAvailable).length,
    categories: new Set(menuItems.map(item => item.category)).size
  }

  const [showImageScan, setShowImageScan] = useState(false)

  return (
    <div className="min-h-screen bg-black flex">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Menu Management</h1>
                <p className="text-zinc-400">Create, edit, and manage your menu items</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                  <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90" onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Item Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter item name"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Price (₹) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            placeholder="0.00"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your menu item..."
                          className="bg-zinc-800/50 border-zinc-700 text-white min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Category *</Label>
                          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              {categories.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Prep Time (minutes)</Label>
                          <Input
                            type="number"
                            value={formData.prepTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
                            placeholder="15"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-white">Item Image</Label>
                        <div className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center">
                          {imagePreview ? (
                            <div className="relative">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-48 object-cover rounded-lg mb-4"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setImagePreview(null)
                                  setImageFile(null)
                                }}
                                className="absolute top-2 right-2 bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="py-8">
                              <Camera className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                              <p className="text-zinc-400 mb-2">Upload item image</p>
                              <p className="text-zinc-500 text-sm">PNG, JPG up to 5MB</p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <Button type="button" variant="outline" className="border-zinc-700 text-zinc-400 hover:text-white" asChild>
                              <span className="cursor-pointer">
                                <Upload className="h-4 w-4 mr-2" />
                                {imagePreview ? "Change Image" : "Upload Image"}
                              </span>
                            </Button>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isVeg"
                            checked={formData.isVeg}
                            onChange={(e) => setFormData(prev => ({ ...prev, isVeg: e.target.checked }))}
                            className="rounded border-zinc-700 bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                          />
                          <Label htmlFor="isVeg" className="text-white">Vegetarian</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isSpicy"
                            checked={formData.isSpicy}
                            onChange={(e) => setFormData(prev => ({ ...prev, isSpicy: e.target.checked }))}
                            className="rounded border-zinc-700 bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                          />
                          <Label htmlFor="isSpicy" className="text-white">Spicy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isAvailable"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="rounded border-zinc-700 bg-zinc-800 text-[#e78a53] focus:ring-[#e78a53]/20"
                          />
                          <Label htmlFor="isAvailable" className="text-white">Available</Label>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90">
                          <Save className="h-4 w-4 mr-2" />
                          {isLoading ? "Saving..." : (editingItem ? "Update Item" : "Add Item")}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                          className="border-zinc-700 text-zinc-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Image Scan Toggle */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu Overview</h2>
              <Button
                variant={showImageScan ? "outline" : "default"}
                className={`${showImageScan ? 'border-zinc-700 text-zinc-300 hover:text-white' : 'bg-[#e78a53] hover:bg-[#e78a53]/90'}`}
                onClick={() => {
                  setShowImageScan(prev => !prev)
                  if (!showImageScan) {
                    // Reset digital menu link when opening scanner
                    setDigitalMenuLink(null)
                    setCurrentDigitalMenuId(null)
                  }
                }}
              >
                {showImageScan ? 'Hide Image Scanner' : 'Scan Menu Image'}
              </Button>
            </div>
            {showImageScan && (
              <MenuImageExtractor 
                onItemsExtracted={async (items) => {
                  // Generate a unique digital menu ID for this extraction session
                  const digitalMenuId = `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  setCurrentDigitalMenuId(digitalMenuId)
                  
                  // Set the digital menu link
                  const link = `${window.location.origin}/digital-menu/${digitalMenuId}`
                  setDigitalMenuLink(link)
                  
                  // Add all items with the same digitalMenuId
                  for (const item of items) {
                    await handleAddExtractedItem(item, digitalMenuId)
                  }
                }}
                digitalMenuLink={digitalMenuLink || undefined}
              />
            )}
          </div>
          {/* Stats Overview */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Utensils className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                      <p className="text-zinc-400 text-sm">Total Items</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.available}</p>
                      <p className="text-zinc-400 text-sm">Available</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.unavailable}</p>
                      <p className="text-zinc-400 text-sm">Unavailable</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Filter className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.categories}</p>
                      <p className="text-zinc-400 text-sm">Categories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Menu Items ({filteredItems.length})
            </h2>
          </div>

          {isLoading ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e78a53] mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading menu items...</h3>
                <p className="text-zinc-400">Please wait while we fetch your menu.</p>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Utensils className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No menu items found</h3>
                <p className="text-zinc-400 mb-6">
                  {menuItems.length === 0 
                    ? "Start by adding your first menu item to get started."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                    onClick={() => {
                      resetForm()
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu Item
                  </Button>
                  {menuItems.length === 0 && (
                    <Button 
                      variant="outline"
                      className="border-zinc-700 text-zinc-400 hover:text-white"
                      onClick={handleLoadSampleData}
                    >
                      <Database className="h-4 w-4 mr-2" />
                      Load Sample Data
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card key={item._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors group">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative h-48 bg-zinc-800 rounded-t-lg overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="h-12 w-12 text-zinc-600" />
                        </div>
                      )}
                      
                      {/* Availability Toggle */}
                      <div className="absolute top-3 left-3">
                        <Button
                          size="sm"
                          variant={item.isAvailable ? "default" : "secondary"}
                          className={`${
                            item.isAvailable 
                              ? "bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30" 
                              : "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                          } border`}
                          onClick={() => toggleAvailability(item._id)}
                          disabled={isLoading}
                        >
                          {item.isAvailable ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Available
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Unavailable
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white"
                            onClick={() => openEditDialog(item)}
                            disabled={isLoading}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                            onClick={() => deleteItem(item._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-lg leading-tight">{item.name}</h3>
                        <div className="flex gap-1 ml-2">
                          {item.isVeg && (
                            <div className="w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          )}
                          {item.isSpicy && (
                            <span className="text-red-500 text-sm">🌶️</span>
                          )}
                        </div>
                      </div>

                      <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53] mb-2">
                        {item.category}
                      </Badge>

                      {item.description && (
                        <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-white text-sm">{item.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-zinc-400" />
                            <span className="text-zinc-400 text-sm">{item.prepTime}m</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-5 w-5 text-[#e78a53]" />
                          <span className="text-[#e78a53] font-bold text-xl">{item.price}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-zinc-700 text-zinc-400 hover:text-white"
                          onClick={() => openEditDialog(item)}
                          disabled={isLoading}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}