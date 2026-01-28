"use client"

import { useState, useEffect } from "react"
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
  Package,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  PackageX,
  Bell,
  Save,
  X,
  RefreshCw,
  Calendar,
  MapPin,
  Truck,
  Database,
  IndianRupee,
  TrendingUp
} from "lucide-react"

interface StockItem {
  _id: string
  canteenId: string
  name: string
  category: string
  currentStock: number
  unit: string
  minimumStock: number
  maximumStock: number
  costPerUnit: number
  supplier: string
  lastRestocked: string
  expiryDate: string | null
  status: 'good' | 'low' | 'critical' | 'out_of_stock'
  description: string
  location: string
  batchNumber: string
  createdAt: string
  updatedAt: string
}

export default function CanteenStocksPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [restockingItem, setRestockingItem] = useState<StockItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    unit: "",
    minimumStock: "",
    maximumStock: "",
    costPerUnit: "",
    supplier: "",
    expiryDate: "",
    description: "",
    location: "",
    batchNumber: ""
  })

  const [restockData, setRestockData] = useState({
    quantity: "",
    costPerUnit: "",
    supplier: "",
    expiryDate: "",
    batchNumber: ""
  })

  const categories = [
    "Grains",
    "Vegetables", 
    "Fruits",
    "Meat",
    "Dairy",
    "Oils",
    "Spices",
    "Beverages",
    "Snacks",
    "Cleaning Supplies",
    "Other"
  ]

  const units = [
    "kg",
    "grams",
    "liters",
    "ml",
    "pieces",
    "packets",
    "boxes",
    "bottles",
    "cans"
  ]

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

  // Load stock items from database when canteenId is available
  useEffect(() => {
    if (canteenId) {
      fetchStockItems()
    }
  }, [canteenId])

  const fetchStockItems = async () => {
    if (!canteenId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/canteen/stocks?canteenId=${canteenId}`)
      const result = await response.json()
      
      if (response.ok) {
        setStockItems(result.data || [])
      } else {
        console.error('Error fetching stock items:', result.error)
        alert('Error loading stock items: ' + result.error)
      }
    } catch (error) {
      console.error('Error fetching stock items:', error)
      alert('Error loading stock items. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      currentStock: "",
      unit: "",
      minimumStock: "",
      maximumStock: "",
      costPerUnit: "",
      supplier: "",
      expiryDate: "",
      description: "",
      location: "",
      batchNumber: ""
    })
    setEditingItem(null)
  }

  const resetRestockForm = () => {
    setRestockData({
      quantity: "",
      costPerUnit: "",
      supplier: "",
      expiryDate: "",
      batchNumber: ""
    })
    setRestockingItem(null)
  }

  const openEditDialog = (item: StockItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      unit: item.unit,
      minimumStock: item.minimumStock.toString(),
      maximumStock: item.maximumStock.toString(),
      costPerUnit: item.costPerUnit.toString(),
      supplier: item.supplier,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : "",
      description: item.description,
      location: item.location,
      batchNumber: item.batchNumber
    })
    setIsDialogOpen(true)
  }

  const openRestockDialog = (item: StockItem) => {
    setRestockingItem(item)
    setRestockData({
      quantity: "",
      costPerUnit: item.costPerUnit.toString(),
      supplier: item.supplier,
      expiryDate: "",
      batchNumber: ""
    })
    setIsRestockDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.currentStock || !formData.unit || 
        !formData.minimumStock || !formData.maximumStock || !formData.costPerUnit) {
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
        category: formData.category,
        currentStock: formData.currentStock,
        unit: formData.unit,
        minimumStock: formData.minimumStock,
        maximumStock: formData.maximumStock,
        costPerUnit: formData.costPerUnit,
        supplier: formData.supplier,
        expiryDate: formData.expiryDate || null,
        description: formData.description,
        location: formData.location,
        batchNumber: formData.batchNumber
      }

      let response
      if (editingItem) {
        // Update existing item
        response = await fetch('/api/canteen/stocks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...itemData, id: editingItem._id })
        })
      } else {
        // Create new item
        response = await fetch('/api/canteen/stocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(itemData)
        })
      }

      const result = await response.json()
      
      if (response.ok) {
        // Refresh stock items
        await fetchStockItems()
        setIsDialogOpen(false)
        resetForm()
        alert(editingItem ? "Stock item updated successfully!" : "Stock item created successfully!")
      } else {
        alert('Error saving stock item: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving stock item:', error)
      alert('Error saving stock item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!restockData.quantity || !restockingItem) {
      alert("Please enter restock quantity")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/canteen/stocks/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: restockingItem._id,
          quantity: restockData.quantity,
          costPerUnit: restockData.costPerUnit || restockingItem.costPerUnit,
          supplier: restockData.supplier || restockingItem.supplier,
          expiryDate: restockData.expiryDate || null,
          batchNumber: restockData.batchNumber || restockingItem.batchNumber
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Refresh stock items
        await fetchStockItems()
        setIsRestockDialogOpen(false)
        resetRestockForm()
        alert(result.message)
      } else {
        alert('Error restocking item: ' + result.error)
      }
    } catch (error) {
      console.error('Error restocking item:', error)
      alert('Error restocking item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this stock item?")) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/canteen/stocks?id=${id}`, {
          method: 'DELETE'
        })
        
        const result = await response.json()
        
        if (response.ok) {
          // Refresh stock items
          await fetchStockItems()
          alert("Stock item deleted successfully!")
        } else {
          alert('Error deleting stock item: ' + result.error)
        }
      } catch (error) {
        console.error('Error deleting stock item:', error)
        alert('Error deleting stock item. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLoadSampleData = async () => {
    if (!canteenId) {
      alert("Canteen ID not found. Please login again.")
      return
    }

    if (confirm("This will add sample stock items to your database. Continue?")) {
      setIsLoading(true)
      try {
        // Load sample data and save each item to database
        const { sampleStockItems } = await import("@/lib/sample-stock-data")
        
        for (const item of sampleStockItems) {
          const itemData = {
            ...item,
            canteenId: canteenId
          }
          
          const response = await fetch('/api/canteen/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemData)
          })
          
          if (!response.ok) {
            const error = await response.json()
            console.error('Error creating sample item:', error)
          }
        }
        
        // Refresh the stock items
        await fetchStockItems()
        alert("Sample stock data loaded successfully!")
      } catch (error) {
        console.error('Error loading sample data:', error)
        alert('Error loading sample data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors = {
      good: "bg-green-500/10 border-green-500/30 text-green-400",
      low: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      critical: "bg-red-500/10 border-red-500/30 text-red-400",
      out_of_stock: "bg-gray-500/10 border-gray-500/30 text-gray-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      good: <CheckCircle className="h-4 w-4" />,
      low: <AlertTriangle className="h-4 w-4" />,
      critical: <AlertTriangle className="h-4 w-4" />,
      out_of_stock: <PackageX className="h-4 w-4" />
    }
    return icons[status as keyof typeof icons] || <Package className="h-4 w-4" />
  }

  const stats = {
    total: stockItems.length,
    good: stockItems.filter(item => item.status === 'good').length,
    low: stockItems.filter(item => item.status === 'low').length,
    critical: stockItems.filter(item => item.status === 'critical').length,
    outOfStock: stockItems.filter(item => item.status === 'out_of_stock').length,
    totalValue: stockItems.reduce((sum, item) => sum + (item.currentStock * item.costPerUnit), 0)
  }

  return (
    <div className="min-h-screen bg-black flex">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Stock Management</h1>
                <p className="text-zinc-400">Monitor and manage your inventory levels</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search items..."
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40 bg-zinc-800/50 border-zinc-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90" onClick={resetForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stock Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        {editingItem ? "Edit Stock Item" : "Add New Stock Item"}
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
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Current Stock *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.currentStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                            placeholder="0"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Unit *</Label>
                          <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                            <SelectTrigger className="bg-zinc-800/50 border-zinc-700 text-white">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-800">
                              {units.map(unit => (
                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Cost per Unit (₹) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.costPerUnit}
                            onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                            placeholder="0.00"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Minimum Stock *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.minimumStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: e.target.value }))}
                            placeholder="0"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Maximum Stock *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.maximumStock}
                            onChange={(e) => setFormData(prev => ({ ...prev, maximumStock: e.target.value }))}
                            placeholder="0"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Supplier</Label>
                          <Input
                            value={formData.supplier}
                            onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                            placeholder="Enter supplier name"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Expiry Date</Label>
                          <Input
                            type="date"
                            value={formData.expiryDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Storage Location</Label>
                          <Input
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="e.g., Storage Room A"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Batch Number</Label>
                          <Input
                            value={formData.batchNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                            placeholder="Enter batch number"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter item description..."
                          className="bg-zinc-800/50 border-zinc-700 text-white min-h-[80px]"
                        />
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

                {/* Restock Dialog */}
                <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
                  <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        Restock {restockingItem?.name}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRestock} className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-800/30 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-zinc-400">Current Stock:</span>
                            <span className="text-white font-semibold">
                              {restockingItem?.currentStock} {restockingItem?.unit}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-zinc-400">Maximum Stock:</span>
                            <span className="text-white font-semibold">
                              {restockingItem?.maximumStock} {restockingItem?.unit}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Restock Quantity *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={restockData.quantity}
                            onChange={(e) => setRestockData(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder={`Enter quantity in ${restockingItem?.unit}`}
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Cost per Unit (₹)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={restockData.costPerUnit}
                            onChange={(e) => setRestockData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                            placeholder="Update cost if changed"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Supplier</Label>
                          <Input
                            value={restockData.supplier}
                            onChange={(e) => setRestockData(prev => ({ ...prev, supplier: e.target.value }))}
                            placeholder="Update supplier if changed"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">New Expiry Date</Label>
                          <Input
                            type="date"
                            value={restockData.expiryDate}
                            onChange={(e) => setRestockData(prev => ({ ...prev, expiryDate: e.target.value }))}
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Batch Number</Label>
                          <Input
                            value={restockData.batchNumber}
                            onChange={(e) => setRestockData(prev => ({ ...prev, batchNumber: e.target.value }))}
                            placeholder="Enter new batch number"
                            className="bg-zinc-800/50 border-zinc-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit" disabled={isLoading} className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isLoading ? "Restocking..." : "Restock Item"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsRestockDialogOpen(false)}
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
          {/* Stats Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Stock Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <Package className="h-6 w-6 text-[#e78a53]" />
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
                      <p className="text-2xl font-bold text-white">{stats.good}</p>
                      <p className="text-zinc-400 text-sm">Good Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.low}</p>
                      <p className="text-zinc-400 text-sm">Low Stock</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.critical + stats.outOfStock}</p>
                      <p className="text-zinc-400 text-sm">Critical/Out</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{Math.round(stats.totalValue).toLocaleString()}</p>
                      <p className="text-zinc-400 text-sm">Total Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stock Items */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Stock Items ({filteredItems.length})
            </h2>
          </div>

          {isLoading ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e78a53] mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading stock items...</h3>
                <p className="text-zinc-400">Please wait while we fetch your inventory.</p>
              </CardContent>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No stock items found</h3>
                <p className="text-zinc-400 mb-6">
                  {stockItems.length === 0 
                    ? "Start by adding your first stock item to get started."
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
                    Add Stock Item
                  </Button>
                  {stockItems.length === 0 && (
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Item</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Category</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Stock</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Status</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Value</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Supplier</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Last Restocked</th>
                    <th className="text-left py-4 px-4 text-zinc-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          {item.location && (
                            <p className="text-zinc-400 text-sm flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-semibold">
                            {item.currentStock} {item.unit}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            Min: {item.minimumStock} | Max: {item.maximumStock}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(item.status)} border`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-[#e78a53] font-semibold">
                            ₹{Math.round(item.currentStock * item.costPerUnit).toLocaleString()}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            ₹{item.costPerUnit}/{item.unit}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-zinc-300">{item.supplier || '-'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-zinc-300">
                            {item.lastRestocked ? new Date(item.lastRestocked).toLocaleDateString() : '-'}
                          </p>
                          {item.expiryDate && (
                            <p className="text-zinc-400 text-sm flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Exp: {new Date(item.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                            onClick={() => openRestockDialog(item)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Restock
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-zinc-700 text-zinc-400 hover:text-white"
                            onClick={() => openEditDialog(item)}
                            disabled={isLoading}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={() => deleteItem(item._id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}