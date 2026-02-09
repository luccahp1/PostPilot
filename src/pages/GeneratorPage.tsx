import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Sparkles, Loader2, Upload, Plus, X, Pencil, Check, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { api, MenuItem } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { FunctionsHttpError } from '@supabase/supabase-js'

export default function GeneratorPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [uploadingMenu, setUploadingMenu] = useState(false)
  const [showMenuEditor, setShowMenuEditor] = useState(false)
  const [menuImage, setMenuImage] = useState<File | null>(null)
  const [primaryOffer, setPrimaryOffer] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', category: '' })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [focusOnCategories, setFocusOnCategories] = useState(false)

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  // Initialize menu items from profile
  useState(() => {
    if (profile?.menu_items) {
      setMenuItems(profile.menu_items)
    }
  })
  
  // Get unique categories
  const categories = Array.from(
    new Set(profile?.menu_items?.map((item: any) => item.category).filter(Boolean))
  ) as string[]

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast.error('Please enter an item name')
      return
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      category: newItem.category,
    }

    setMenuItems([...menuItems, item])
    setNewItem({ name: '', description: '', price: '', category: '' })
  }

  const handleRemoveItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setMenuImage(file)
    setUploadingMenu(true)

    try {
      toast.info('Analyzing menu...')
      
      // Upload image to Supabase Storage
      const fileName = `menu-${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, { contentType: file.type })
      
      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName)

      // Call AI menu analysis function
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
      
      setMenuItems([...menuItems, ...data.items])
      setShowMenuEditor(true)
      toast.success('Menu scanned! Please verify the items below')
    } catch (error: any) {
      console.error('Menu scan error:', error)
      toast.error(error.message || 'Failed to scan menu')
    } finally {
      setUploadingMenu(false)
    }
  }

  const handleSaveMenu = async () => {
    if (!profile) return

    try {
      await api.updateBusinessProfile(profile.id, { menu_items: menuItems })
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Menu saved successfully!')
      setShowMenuEditor(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleGenerate = async () => {
    if (!profile) {
      toast.error('Please complete your business profile first')
      return
    }

    setLoading(true)

    try {
      const now = new Date()
      const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      const { data, error } = await supabase.functions.invoke('generate-calendar', {
        body: {
          businessName: profile.business_name,
          businessType: profile.business_type,
          city: profile.city,
          province: profile.province,
          instagramHandle: profile.instagram_handle,
          websiteUrl: profile.website_url,
          primaryOffer,
          brandVibe: profile.brand_vibe,
          postingFrequency: profile.posting_frequency,
          primaryGoal: profile.primary_goal,
          monthYear,
          businessDescription: profile.business_description,
          productsServices: profile.products_services,
          permanentContext: profile.permanent_context,
          menuItems: profile.menu_items,
          categoryFocus: focusOnCategories && selectedCategories.length > 0 ? selectedCategories : null,
        }
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

      const calendar = await api.createCalendar({
        business_profile_id: profile.id,
        month_year: monthYear,
      })

      const calendarItems = data.items.map((item: any, index: number) => ({
        calendar_id: calendar.id,
        day_number: index + 1,
        post_date: item.date,
        post_type: item.postType,
        theme: item.theme,
        caption_short: item.captionShort,
        caption_long: item.captionLong,
        hashtags: item.hashtags,
        cta: item.cta,
        canva_prompt: item.canvaPrompt,
        image_ideas: item.imageIdeas || null,
      }))

      await api.createCalendarItems(calendarItems)

      toast.success('Calendar generated successfully!')
      navigate(`/calendar/${calendar.id}`)
    } catch (error: any) {
      console.error('Generation error:', error)
      toast.error(error.message || 'Failed to generate calendar')
    } finally {
      setLoading(false)
    }
  }

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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Generate Your Calendar</h1>
            <p className="text-lg text-muted-foreground">
              Creating 30 days of content for {profile.business_name}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Primary Offer This Month */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Offers This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="primaryOffer">Current Promotion or Special Offer</Label>
                  <Textarea
                    id="primaryOffer"
                    placeholder="New spring menu, 20% off all services, Buy one get one free, Limited time offer, etc."
                    value={primaryOffer}
                    onChange={(e) => setPrimaryOffer(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    What special promotions or offers should we highlight in this month's content?
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category Focus (Optional) */}
            {categories.length > 0 && (
              <Card className="border-primary/20 bg-accent/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    <CardTitle>Category-Specific Content (Optional)</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generate a calendar focused on specific menu categories for more targeted promotions
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="focus-categories"
                      checked={focusOnCategories}
                      onCheckedChange={(checked) => {
                        setFocusOnCategories(checked as boolean)
                        if (!checked) setSelectedCategories([])
                      }}
                    />
                    <Label htmlFor="focus-categories" className="cursor-pointer">
                      Focus this calendar on specific categories
                    </Label>
                  </div>
                  
                  {focusOnCategories && (
                    <div className="pl-7 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Select the categories you want to feature in this calendar:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map(category => {
                          const itemCount = profile.menu_items?.filter((item: any) => item.category === category).length || 0
                          return (
                            <label
                              key={category}
                              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedCategories.includes(category)
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <Checkbox
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={(checked) => {
                                  setSelectedCategories(
                                    checked
                                      ? [...selectedCategories, category]
                                      : selectedCategories.filter(c => c !== category)
                                  )
                                }}
                              />
                              <div>
                                <div className="font-medium text-sm">{category}</div>
                                <div className="text-xs text-muted-foreground">{itemCount} items</div>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      {selectedCategories.length > 0 && (
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">✨ Content will focus on:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedCategories.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Menu/Services Manager */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Menu / Services</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your complete offerings for AI-powered content
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMenuEditor(!showMenuEditor)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {showMenuEditor ? 'Close Editor' : 'Edit Details'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Menu Items Display */}
                {menuItems.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Current Items ({menuItems.length})</p>
                    <div className="grid gap-2 max-h-48 overflow-y-auto">
                      {menuItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              {item.price && <span>💰 {item.price}</span>}
                              {item.category && <span>📁 {item.category}</span>}
                            </div>
                          </div>
                          {showMenuEditor && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showMenuEditor && (
                  <>
                    {/* Add Item Manually */}
                    <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
                      <p className="font-medium">Add Item Manually</p>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Item name *"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        />
                        <Input
                          placeholder="Price (optional)"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                        />
                        <Input
                          placeholder="Category (optional)"
                          value={newItem.category}
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddItem} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                      </Button>
                    </div>

                    {/* Upload Menu Image */}
                    <div className="space-y-3 p-4 border-2 border-dashed rounded-lg">
                      <p className="font-medium">Or Scan Menu Image</p>
                      <p className="text-sm text-muted-foreground">
                        Upload a clear photo of your menu and AI will extract items and prices
                      </p>
                      <div className="flex gap-3">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleMenuImageUpload}
                          disabled={uploadingMenu}
                        />
                        {uploadingMenu && <Loader2 className="h-5 w-5 animate-spin" />}
                      </div>
                    </div>

                    {/* Save Button */}
                    <Button onClick={handleSaveMenu} className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Save Menu Updates
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Business Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Business</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {profile.business_type}
                  </div>
                  {profile.city && (
                    <div>
                      <span className="font-medium">Location:</span> {profile.city}
                      {profile.province && `, ${profile.province}`}
                    </div>
                  )}
                  {profile.instagram_handle && (
                    <div>
                      <span className="font-medium">Instagram:</span> {profile.instagram_handle}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Content Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Brand Vibe:</span> {profile.brand_vibe.join(', ')}
                  </div>
                  <div>
                    <span className="font-medium">Posting:</span>{' '}
                    {profile.posting_frequency === 'daily' ? 'Daily (7x/week)' :
                     profile.posting_frequency === '5x-week' ? '5x per week' : '3x per week'}
                  </div>
                  <div>
                    <span className="font-medium">Goals:</span> {Array.isArray(profile.primary_goal) ? profile.primary_goal.join(', ') : profile.primary_goal}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Generate?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                We'll create a complete 30-day content calendar with captions, hashtags, CTAs, and Canva prompts tailored to your business.
              </p>
              <Button size="lg" onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating... (this takes ~30 seconds)
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate 30-Day Calendar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
