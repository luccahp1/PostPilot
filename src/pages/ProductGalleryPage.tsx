import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Upload, Trash2, Star, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

export default function ProductGalleryPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('')

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const { data: productImages = [], isLoading } = useQuery({
    queryKey: ['product-images', profile?.user_id],
    queryFn: async () => {
      if (!profile?.user_id) return []
      
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!profile?.user_id
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!productName.trim()) {
      toast.error('Please enter a product name')
      return
    }

    setUploading(true)
    try {
      // Upload to storage
      const fileName = `product-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { contentType: file.type })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      // Save to database
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('product_images')
        .insert({
          user_id: user.id,
          menu_item_id: selectedMenuItemId || null,
          image_url: publicUrl,
          image_path: fileName,
          product_name: productName,
          description: description
        })

      if (insertError) throw insertError

      queryClient.invalidateQueries({ queryKey: ['product-images'] })
      toast.success('Product image uploaded!')
      
      // Reset form
      setProductName('')
      setDescription('')
      setSelectedMenuItemId('')
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string, imagePath: string) => {
    if (!window.confirm('Delete this product image?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([imagePath])

      if (storageError) console.error('Storage delete error:', storageError)

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', id)

      if (dbError) throw dbError

      queryClient.invalidateQueries({ queryKey: ['product-images'] })
      toast.success('Product image deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .update({ is_featured: !currentStatus })
        .eq('id', id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['product-images'] })
      toast.success(currentStatus ? 'Removed from featured' : 'Set as featured')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const menuItems = profile?.menu_items || []

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Product Gallery</h1>
            <p className="text-muted-foreground">
              Upload product images to enhance AI-generated content
            </p>
          </div>

          {/* Upload Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload Product Image</CardTitle>
              <CardDescription>
                These images will be used as references when AI generates content about your products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Caramel Latte"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Brief description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="menuItem">Link to Menu Item (Optional)</Label>
                    <Select value={selectedMenuItemId} onValueChange={setSelectedMenuItemId}>
                      <SelectTrigger id="menuItem">
                        <SelectValue placeholder="Select menu item" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {menuItems.map((item: any) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} {item.price && `- ${item.price}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageUpload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </Label>
                    <Input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-accent/5">
                  <p className="text-sm font-semibold mb-2">💡 How this helps:</p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>✓ AI can reference actual product appearance</li>
                    <li>✓ Generate more accurate visual descriptions</li>
                    <li>✓ Create consistent brand imagery</li>
                    <li>✓ Featured images prioritized in content</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : productImages.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productImages.map((image: any) => (
              <Card key={image.id} className="overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.product_name}
                    className="w-full h-full object-cover"
                  />
                  {image.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">{image.product_name}</h3>
                  {image.description && (
                    <p className="text-sm text-muted-foreground mb-2">{image.description}</p>
                  )}
                  {image.menu_item_id && (
                    <div className="flex items-center gap-1 text-xs text-primary mb-3">
                      <Link2 className="h-3 w-3" />
                      <span>Linked to menu item</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(image.id, image.is_featured)}
                    >
                      <Star className={`h-4 w-4 ${image.is_featured ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(image.id, image.image_path)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No product images yet. Upload your first product photo to get started!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
