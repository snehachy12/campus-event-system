"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  IndianRupee,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"

interface MenuItem {
  _id: string
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
  canteenName: string
  canteenId: string
}

interface OrderItem extends MenuItem {
  quantity: number
}

interface OrderDialogProps {
  isOpen: boolean
  onClose: () => void
  menuItem: MenuItem | null
  onOrderSuccess: (order: any) => void
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function OrderDialog({ isOpen, onClose, menuItem, onOrderSuccess }: OrderDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    specialInstructions: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Load user info on mount
  useEffect(() => {
    try {
      const user = localStorage.getItem('currentUser')
      if (user) {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        setCustomerInfo(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }, [])

  // Initialize order items when menu item changes
  useEffect(() => {
    if (menuItem && isOpen) {
      setOrderItems([{ ...menuItem, quantity: 1 }])
    }
  }, [menuItem, isOpen])

  // Load Razorpay script
  useEffect(() => {
    if (isOpen && !window.Razorpay) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [isOpen])

  const updateQuantity = (itemId: string, change: number) => {
    setOrderItems(prev => prev.map(item => {
      if (item._id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change)
        return { ...item, quantity: newQuantity }
      }
      return item
    }))
  }

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item._id !== itemId))
  }

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = 0 // No tax for now
    const deliveryFee = 0 // No delivery fee for now
    const total = subtotal + tax + deliveryFee
    
    return { subtotal, tax, deliveryFee, total }
  }

  const handleRazorpayPayment = (orderData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.razorpayOrder.amount,
      currency: orderData.razorpayOrder.currency,
      name: 'ACE Campus Food',
      description: `Order ${orderData.order.orderId}`,
      order_id: orderData.razorpayOrder.id,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyResponse = await fetch('/api/orders/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.order.orderId
            })
          })

          const verifyResult = await verifyResponse.json()
          
          if (verifyResponse.ok) {
            onOrderSuccess(verifyResult.data)
            onClose()
            alert('Payment successful! Your order has been placed.')
          } else {
            alert('Payment verification failed: ' + verifyResult.error)
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          alert('Payment verification failed. Please contact support.')
        } finally {
          setIsLoading(false)
        }
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      theme: {
        color: '#e78a53'
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false)
        }
      }
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      alert('Please login to place an order')
      return
    }

    if (orderItems.length === 0) {
      alert('Please add items to your order')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Please fill in your contact information')
      return
    }

    setIsLoading(true)

    try {
      const { total } = calculateTotals()
      
      const orderData = {
        customerId: currentUser.id,
        customerName: customerInfo.name,
        customerRole: currentUser.role,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        canteenId: menuItem?.canteenId,
        items: orderItems.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity
        })),
        paymentMethod,
        specialInstructions: customerInfo.specialInstructions,
        deliveryType: 'pickup'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (response.ok) {
        if (paymentMethod === 'online') {
          // Handle Razorpay payment
          handleRazorpayPayment(result.data)
        } else {
          // Offline payment - order is placed immediately
          onOrderSuccess(result.data.order)
          onClose()
          alert('Order placed successfully! Please pay at the canteen.')
          setIsLoading(false)
        }
      } else {
        alert('Error placing order: ' + result.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order. Please try again.')
      setIsLoading(false)
    }
  }

  const { subtotal, tax, deliveryFee, total } = calculateTotals()
  const maxPrepTime = Math.max(...orderItems.map(item => item.prepTime))

  if (!menuItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#e78a53]" />
            Place Order - {menuItem.canteenName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Items</h3>
            {orderItems.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-zinc-400">₹{item.price} each</p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.isVeg && (
                      <Badge className="bg-green-500/10 text-green-400 text-xs">Veg</Badge>
                    )}
                    {item.isSpicy && (
                      <Badge className="bg-red-500/10 text-red-400 text-xs">Spicy</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item._id, -1)}
                    disabled={item.quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item._id, 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name *
                </Label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-700"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone (Optional)
              </Label>
              <Input
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Special Instructions (Optional)</Label>
              <Textarea
                value={customerInfo.specialInstructions}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, specialInstructions: e.target.value }))}
                placeholder="Any special requests or dietary requirements..."
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'online' | 'offline') => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border border-zinc-700 rounded-lg">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="h-4 w-4 text-[#e78a53]" />
                  <div>
                    <p className="font-medium">Pay Online</p>
                    <p className="text-sm text-zinc-400">Pay securely with Razorpay</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border border-zinc-700 rounded-lg">
                <RadioGroupItem value="offline" id="offline" />
                <Label htmlFor="offline" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Wallet className="h-4 w-4 text-[#e78a53]" />
                  <div>
                    <p className="font-medium">Pay at Canteen</p>
                    <p className="text-sm text-zinc-400">Pay when you collect your order</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="p-4 bg-zinc-800/30 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
              )}
              <Separator className="bg-zinc-700" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-[#e78a53]">₹{total}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Clock className="h-4 w-4" />
                <span>Estimated prep time: {maxPrepTime + 10} minutes</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-zinc-700 text-zinc-400 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={isLoading || orderItems.length === 0}
              className="flex-1 bg-[#e78a53] hover:bg-[#e78a53]/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'online' ? (
                    <CreditCard className="h-4 w-4 mr-2" />
                  ) : (
                    <Wallet className="h-4 w-4 mr-2" />
                  )}
                  Place Order (₹{total})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}