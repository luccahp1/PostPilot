import { useState, useRef } from 'react'
import { Camera, Upload, Sparkles, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

interface MenuScannerProps {
  onMenuScanned: (items: any[]) => void
}

export default function MenuScanner({ onMenuScanned }: MenuScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [scannedItems, setScannedItems] = useState<any[]>([])
  const [editingItems, setEditingItems] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setScanning(true)
    try {
      // Convert image to JPEG format using canvas
      const jpegBlob = await convertToJPEG(file)

      // Upload to Supabase Storage
      const fileName = `menu-scan-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, jpegBlob, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      // Call AI vision to analyze menu
      const { data, error } = await supabase.functions.invoke('analyze-menu-image', {
        body: { imageUrl: publicUrl }
      })

      if (error) {
        let errorMessage = error.message
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500
            const textContent = await error.context?.text()
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`
          }
        }
        throw new Error(errorMessage)
      }

      const items = data.items || []
      setScannedItems(items)
      setEditingItems(items)
      setShowConfirmation(true)
      toast.success(`Found ${items.length} items!`)
    } catch (error: any) {
      console.error('Menu scan error:', error)
      toast.error(error.message || 'Failed to scan menu')
    } finally {
      setScanning(false)
    }
  }

  const convertToJPEG = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert image'))
            }
          }, 'image/jpeg', 0.9)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleConfirm = () => {
    onMenuScanned(editingItems)
    setShowConfirmation(false)
    setScannedItems([])
    setEditingItems([])
    toast.success('Menu items added!')
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setScannedItems([])
    setEditingItems([])
  }

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...editingItems]
    updated[index] = { ...updated[index], [field]: value }
    setEditingItems(updated)
  }

  const removeItem = (index: number) => {
    setEditingItems(editingItems.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => cameraInputRef.current?.click()}
          disabled={scanning}
        >
          <Camera className="mr-2 h-4 w-4" />
          {scanning ? 'Scanning...' : 'Take Photo'}
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={scanning}
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Image
        </Button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Verify Scanned Menu Items
                  </CardTitle>
                  <CardDescription>
                    Review and edit the detected items before adding to your menu
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold">Item #{index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Price</Label>
                        <Input
                          value={item.price || ''}
                          onChange={(e) => updateItem(index, 'price', e.target.value)}
                          placeholder="$5.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description (optional)"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleConfirm} disabled={editingItems.length === 0}>
                  <Check className="mr-2 h-4 w-4" />
                  Add {editingItems.length} Items
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
