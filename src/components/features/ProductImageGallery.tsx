import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, X, Star, Loader2, Image as ImageIcon, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

interface ProductImage {
  id: string
  user_id: string
  menu_item_id: string
  image_url: string
  image_path: string
  product_name: string
  description?: string
  is_featured: boolean
  display_order: number
  created_at: string
}

interface ProductImageGalleryProps {
  menuItemId: string
  productName: string
}

export default function ProductImageGallery({ menuItemId, productName }: ProductImageGalleryProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['product-images', menuItemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('menu_item_id', menuItemId)
        .order('display_order', { ascending: true })

      if (error) throw error
      return data as ProductImage[]
    },
    enabled: !!menuItemId && !!user
  })

  const convertToJPEG = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          
          // Resize if image is too large (max 1920px width)
          const maxWidth = 1920
          const scaleFactor = img.width > maxWidth ? maxWidth / img.width : 1
          
          canvas.width = img.width * scaleFactor
          canvas.height = img.height * scaleFactor
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to convert image'))
            }
          }, 'image/jpeg', 0.85)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return

    setUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Convert to JPEG
        const jpegBlob = await convertToJPEG(file)

        // Upload to Supabase Storage
        const fileName = `product-${menuItemId}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, jpegBlob, { contentType: 'image/jpeg' })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        // Save to database
        const { data: imageData, error: dbError } = await supabase
          .from('product_images')
          .insert({
            user_id: user.id,
            menu_item_id: menuItemId,
            image_url: publicUrl,
            image_path: fileName,
            product_name: productName,
            is_featured: images.length === 0, // First image is featured by default
            display_order: images.length
          })
          .select()
          .single()

        if (dbError) throw dbError
        return imageData
      })

      await Promise.all(uploadPromises)
      
      queryClient.invalidateQueries({ queryKey: ['product-images', menuItemId] })
      toast.success(`Uploaded ${files.length} image${files.length > 1 ? 's' : ''}!`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const handleSetFeatured = async (imageId: string) => {
    try {
      // Unset all featured images for this menu item
      await supabase
        .from('product_images')
        .update({ is_featured: false })
        .eq('menu_item_id', menuItemId)

      // Set the selected image as featured
      const { error } = await supabase
        .from('product_images')
        .update({ is_featured: true })
        .eq('id', imageId)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['product-images', menuItemId] })
      toast.success('Featured image updated!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update featured image')
    }
  }

  const handleDeleteImage = async (imageId: string, imagePath: string) => {
    if (!window.confirm('Delete this image?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([imagePath])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (dbError) throw dbError

      queryClient.invalidateQueries({ queryKey: ['product-images', menuItemId] })
      toast.success('Image deleted!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </div>

      {/* Image Gallery */}
      {images.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              No product images yet. Upload photos to help AI generate more accurate Instagram posts!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.product_name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Featured Badge */}
                  {image.is_featured && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Featured
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!image.is_featured && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetFeatured(image.id)}
                      >
                        <Star className="mr-2 h-3 w-3" />
                        Set as Featured
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id, image.image_path)}
                    >
                      <X className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {images.length > 0 ? (
          <>
            {images.length} image{images.length !== 1 ? 's' : ''} uploaded. 
            {images.find(img => img.is_featured) ? ' Featured image will be used for AI generation.' : ' Set a featured image for best results.'}
          </>
        ) : (
          'Upload multiple product images. The featured image will be used as reference when AI generates Instagram posts about this item.'
        )}
      </p>
    </div>
  )
}
