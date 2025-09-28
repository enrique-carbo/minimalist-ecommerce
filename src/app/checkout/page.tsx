"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import { Progress } from "@/src/components/ui/progress"
import { Alert, AlertDescription } from "@/src/components/ui/alert"
import { useCartStore } from "@/src/stores/cart"
import { ArrowLeft, CreditCard, Truck, FileText, CheckCircle, Upload, Building2 } from "lucide-react"

type CheckoutStep = "shipping" | "payment" | "review" | "confirmation"

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

interface PaymentInfo {
  method: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardName: string
  bankTransferFile?: File
}

interface BankDetails {
  cbu: string
  alias: string
  accountHolder: string
  bankName: string
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  })
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: "credit_card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    bankTransferFile: undefined,
  })
  
  const [orderNotes, setOrderNotes] = useState("")
  
  const [bankDetails] = useState<BankDetails>({
    cbu: "0110099400000099999999",
    alias: "MIEMPRESA.ECOMMERCE",
    accountHolder: "Ecommerce Store S.A.",
    bankName: "Banco Nacional",
  })
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState("")

  const subtotal = getTotalPrice()
  const tax = subtotal * 0.08
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + tax + shipping

  const steps = [
    { id: "shipping", title: "Shipping", icon: Truck },
    { id: "payment", title: "Payment", icon: CreditCard },
    { id: "review", title: "Review", icon: FileText },
    { id: "confirmation", title: "Confirmation", icon: CheckCircle },
  ]

  const handleNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as CheckoutStep)
    }
  }

  const handlePreviousStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as CheckoutStep)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Please upload a PDF, JPG, or PNG file")
        return
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File size must be less than 10MB")
        return
      }
      
      setPaymentInfo(prev => ({ ...prev, bankTransferFile: file }))
      setUploadError("")
      
      // Simulate upload progress
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)
        if (progress >= 100) {
          clearInterval(interval)
        }
      }, 100)
    }
  }

  const removeUploadedFile = () => {
    setPaymentInfo(prev => ({ ...prev, bankTransferFile: undefined }))
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handlePlaceOrder = async () => {
    setIsLoading(true)
    
    try {
      // For bank transfer, require file upload
      if (paymentInfo.method === "bank_transfer" && !paymentInfo.bankTransferFile) {
        setUploadError("Please upload proof of transfer for bank transfer payment")
        setIsLoading(false)
        return
      }
      
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress,
          paymentMethod: paymentInfo.method,
          subtotal,
          tax,
          shipping,
          total,
          notes: orderNotes,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // If bank transfer with file, upload the file after order creation
        if (paymentInfo.method === "bank_transfer" && paymentInfo.bankTransferFile) {
          const formData = new FormData()
          formData.append("file", paymentInfo.bankTransferFile)
          formData.append("orderId", data.order.id)
          
          await fetch(`/api/orders/${data.order.id}/files`, {
            method: "POST",
            body: formData,
          })
        }
        
        clearCart()
        setCurrentStep("confirmation")
      } else {
        console.error("Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  /* if (!session) {
    router.push("/auth/signin?callbackUrl=/checkout")
    return null
  }

  if (items.length === 0) {
    router.push("/cart")
    return null
  } */

    useEffect(() => {
      if (!session) {
        router.replace("/auth/signin?callbackUrl=/checkout")
        return
      }
      if (items.length === 0) {
        router.replace("/cart")
      }
    }, [session, items.length, router])
  
    /* Mientras verificamos no pintamos nada (evita parpadeos) */
    if (!session || items.length === 0) return null  

  const renderStepContent = () => {
    switch (currentStep) {
      case "shipping":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={shippingAddress.firstName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={shippingAddress.lastName}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select value={shippingAddress.country} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, country: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case "payment":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentInfo.method} onValueChange={(value) => setPaymentInfo(prev => ({ ...prev, method: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {paymentInfo.method === "credit_card" || paymentInfo.method === "debit_card" ? (
                <>
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : paymentInfo.method === "bank_transfer" ? (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-900">Bank Transfer Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Bank:</span>
                        <span>{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Account Holder:</span>
                        <span>{bankDetails.accountHolder}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">CBU:</span>
                        <span className="font-mono">{bankDetails.cbu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Alias:</span>
                        <span className="font-mono">{bankDetails.alias}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Upload Proof of Transfer
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Please upload a screenshot or PDF of your transfer confirmation
                    </p>
                    
                    {!paymentInfo.bankTransferFile ? (
                      <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-4">
                          Upload your transfer confirmation
                        </p>
                        <Label htmlFor="bank-transfer-file" className="cursor-pointer">
                          <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                            Choose File
                          </div>
                          <Input
                            ref={fileInputRef}
                            id="bank-transfer-file"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </Label>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, JPG, PNG up to 10MB
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">
                                {paymentInfo.bankTransferFile.name}
                              </p>
                              <p className="text-xs text-green-700">
                                {(paymentInfo.bankTransferFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={removeUploadedFile}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <Progress value={uploadProgress} className="w-full" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {uploadError && (
                      <Alert variant="destructive" className="mt-3">
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  You will be redirected to complete your payment after placing the order.
                </div>
              )}
            </CardContent>
          </Card>
        )

      case "review":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 py-2 border-b">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <CreditCard className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p>{shippingAddress.address}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>{shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="capitalize">{paymentInfo.method.replace("_", " ")}</p>
                {paymentInfo.cardName && (
                  <p className="text-sm text-gray-600">{paymentInfo.cardName}</p>
                )}
                {paymentInfo.method === "bank_transfer" && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">Bank:</span>
                        <span>{bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">CBU:</span>
                        <span className="font-mono text-xs">{bankDetails.cbu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Alias:</span>
                        <span className="font-mono text-xs">{bankDetails.alias}</span>
                      </div>
                    </div>
                    {paymentInfo.bankTransferFile && (
                      <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
                        <FileText className="h-4 w-4" />
                        <span>Proof of transfer uploaded: {paymentInfo.bankTransferFile.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {orderNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{orderNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "confirmation":
        return (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase. You will receive a confirmation email shortly.
              </p>
              <div className="space-y-2">
                <Button asChild>
                  <Link href="/orders">View Order History</Link>
                </Button>
                <Button variant="outline" asChild className="ml-2">
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="mt-2 text-gray-600">
                {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your order
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center justify-center">
            <ol className="flex items-center space-x-2 sm:space-x-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isCurrent = currentStep === step.id
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index
                
                return (
                  <li key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isCurrent 
                        ? 'border-primary bg-primary text-white' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 text-gray-300'
                    }`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`ml-4 w-8 h-0.5 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              {currentStep !== "confirmation" && (
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === "shipping"}
                  >
                    Previous
                  </Button>
                  
                  {currentStep === "review" ? (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isLoading}
                    >
                      {isLoading ? "Placing Order..." : "Place Order"}
                    </Button>
                  ) : (
                    <Button onClick={handleNextStep}>
                      Next
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            {currentStep !== "confirmation" && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    {currentStep === "shipping" && (
                      <div>
                        <Label htmlFor="orderNotes">Order Notes (Optional)</Label>
                        <Textarea
                          id="orderNotes"
                          placeholder="Special instructions for your order..."
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div className="text-xs text-gray-500 text-center">
                      <p>Free shipping on orders over $50</p>
                      <p>Secure checkout powered by NextAuth</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}