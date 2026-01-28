"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CanteenSidebar } from "@/components/canteen-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  IndianRupee,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  CookingPot,
  Truck,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Bell,
  RefreshCw,
  User,
  Phone,
  Mail,
  CreditCard,
  Wallet
} from "lucide-react"

interface Order {
  _id: string
  orderId: string
  customerId: string
  customerName: string
  customerRole: string
  customerEmail: string
  customerPhone?: string
  canteenId: string
  canteenName: string
  items: Array<{
    menuItemId: string
    name: string
    price: number
    quantity: number
    image?: string
    isVeg: boolean
    isSpicy: boolean
    prepTime: number
  }>
  subtotal: number
  tax: number
  deliveryFee: number
  discount: number
  totalAmount: number
  paymentMethod: 'online' | 'offline'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  orderDate: string
  estimatedTime: string
  completedAt?: string
  specialInstructions?: string
  createdAt: string
  updatedAt: string
}

export default function CanteenOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [canteenId, setCanteenId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

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

  // Load orders from database when canteenId is available
  useEffect(() => {
    if (canteenId) {
      fetchOrders()
    }
  }, [canteenId])

  const fetchOrders = async () => {
    if (!canteenId) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/orders?canteenId=${canteenId}&limit=50`)
      const result = await response.json()
      
      if (response.ok) {
        setOrders(result.data || [])
      } else {
        console.error('Error fetching orders:', result.error)
        alert('Error loading orders: ' + result.error)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Error loading orders. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, note })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Refresh orders
        await fetchOrders()
        alert(`Order ${status} successfully!`)
      } else {
        alert('Error updating order: ' + result.error)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order. Please try again.')
    }
  }

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Calculate stats from real orders
  const stats = {
    pendingOrders: orders.filter(order => ['placed', 'confirmed', 'preparing'].includes(order.status)).length,
    readyOrders: orders.filter(order => order.status === 'ready').length,
    completedToday: orders.filter(order => {
      const today = new Date().toDateString()
      const orderDate = new Date(order.createdAt).toDateString()
      return orderDate === today && order.status === 'completed'
    }).length,
    todayRevenue: orders
      .filter(order => {
        const today = new Date().toDateString()
        const orderDate = new Date(order.createdAt).toDateString()
        return orderDate === today && order.status === 'completed'
      })
      .reduce((sum, order) => sum + order.totalAmount, 0),
    avgOrderValue: orders.length > 0 
      ? Math.round(orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length)
      : 0
  }

  const getStatusColor = (status: string) => {
    const colors = {
      placed: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      confirmed: "bg-green-500/10 border-green-500/30 text-green-400",
      preparing: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      ready: "bg-[#e78a53]/10 border-[#e78a53]/30 text-[#e78a53]",
      completed: "bg-green-500/10 border-green-500/30 text-green-400",
      cancelled: "bg-red-500/10 border-red-500/30 text-red-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      placed: <Clock className="h-4 w-4" />,
      confirmed: <CheckCircle className="h-4 w-4" />,
      preparing: <CookingPot className="h-4 w-4" />,
      ready: <CheckCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    }
    return icons[status as keyof typeof icons] || <ClipboardList className="h-4 w-4" />
  }

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
      paid: "bg-green-500/10 border-green-500/30 text-green-400",
      failed: "bg-red-500/10 border-red-500/30 text-red-400",
      refunded: "bg-blue-500/10 border-blue-500/30 text-blue-400"
    }
    return colors[status as keyof typeof colors] || "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-black flex">
      <CanteenSidebar />
      
      <main className="flex-1 overflow-auto">
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Order Management</h1>
                <p className="text-zinc-400">Manage current orders and view order history</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-zinc-800/50 border-zinc-700 text-white placeholder-zinc-400"
                  />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700 text-white rounded-md px-3 py-2"
                >
                  <option value="all">All Orders</option>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-400 hover:text-white"
                  onClick={fetchOrders}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? "Loading..." : "Refresh"}
                </Button>
                <Button className="bg-[#e78a53] hover:bg-[#e78a53]/90">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-zinc-400" />
                </Button>
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Order Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Order Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
                      <p className="text-zinc-400 text-sm">Pending Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.readyOrders}</p>
                      <p className="text-zinc-400 text-sm">Ready to Serve</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#e78a53]/10 rounded-lg">
                      <IndianRupee className="h-6 w-6 text-[#e78a53]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">₹{stats.todayRevenue.toLocaleString()}</p>
                      <p className="text-zinc-400 text-sm">Today's Revenue</p>
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
                      <p className="text-2xl font-bold text-white">₹{stats.avgOrderValue}</p>
                      <p className="text-zinc-400 text-sm">Avg Order Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Orders List */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Orders ({filteredOrders.length})
            </h2>
          </div>

          {isLoading ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e78a53] mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading orders...</h3>
                <p className="text-zinc-400">Please wait while we fetch your orders.</p>
              </CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-12 text-center">
                <ClipboardList className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No orders found</h3>
                <p className="text-zinc-400 mb-6">
                  {orders.length === 0 
                    ? "No orders have been placed yet."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                <Button 
                  className="bg-[#e78a53] hover:bg-[#e78a53]/90"
                  onClick={fetchOrders}
                >
                  Refresh Orders
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <Card key={order._id} className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900/70 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg">{order.orderId}</CardTitle>
                        <p className="text-zinc-400 text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getStatusColor(order.status)} border`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Customer Info */}
                      <div className="p-3 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-[#e78a53]" />
                          <span className="text-white font-medium">{order.customerName}</span>
                          <Badge className="bg-zinc-700 text-zinc-300 text-xs">
                            {order.customerRole}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <Mail className="h-3 w-3" />
                          <span>{order.customerEmail}</span>
                        </div>
                        {order.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Phone className="h-3 w-3" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="text-zinc-300 font-medium mb-2">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-300">{item.name}</span>
                                <span className="text-zinc-500 text-sm">x{item.quantity}</span>
                                {item.isVeg && (
                                  <div className="w-3 h-3 border border-green-500 rounded-sm flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  </div>
                                )}
                                {item.isSpicy && <span className="text-red-500 text-xs">🌶️</span>}
                              </div>
                              <span className="text-[#e78a53]">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment & Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
                        <div className="flex items-center gap-2">
                          {order.paymentMethod === 'online' ? (
                            <CreditCard className="h-4 w-4 text-[#e78a53]" />
                          ) : (
                            <Wallet className="h-4 w-4 text-[#e78a53]" />
                          )}
                          <Badge className={`${getPaymentStatusColor(order.paymentStatus)} border text-xs`}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-[#e78a53] font-bold text-lg">₹{order.totalAmount}</p>
                          <p className="text-zinc-400 text-xs">
                            {order.paymentMethod === 'online' ? 'Paid Online' : 'Pay at Counter'}
                          </p>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {order.specialInstructions && (
                        <div className="p-2 bg-zinc-800/30 rounded text-sm text-zinc-300">
                          <strong>Note:</strong> {order.specialInstructions}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        {order.status === 'placed' && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => updateOrderStatus(order.orderId, 'confirmed', 'Order confirmed by canteen')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            onClick={() => updateOrderStatus(order.orderId, 'preparing', 'Started preparing order')}
                          >
                            <CookingPot className="h-4 w-4 mr-2" />
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
                            onClick={() => updateOrderStatus(order.orderId, 'ready', 'Order is ready for pickup')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button 
                            size="sm" 
                            className="flex-1 bg-green-500 hover:bg-green-600"
                            onClick={() => updateOrderStatus(order.orderId, 'completed', 'Order completed and served')}
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Mark Completed
                          </Button>
                        )}
                        {['placed', 'confirmed'].includes(order.status) && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                            onClick={() => updateOrderStatus(order.orderId, 'cancelled', 'Order cancelled by canteen')}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
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