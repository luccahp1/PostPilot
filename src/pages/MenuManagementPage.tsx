import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Edit2, Save, X, Trash2, Plus, Upload, Download, GripVertical, FolderPlus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/api'

interface MenuItem {
  id: string
  name: string
  price?: string
  description?: string
  ingredients?: string
  category?: string
  order?: number
}

const DEFAULT_CATEGORIES = [
  'Drinks',
  'Food',
  'Desserts',
  'Appetizers',
  'Main Course',
  'Sides',
  'Beverages',
  'Specials',
  'Other'
]

export default function MenuManagementPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<MenuItem | null>(null)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [customCategories, setCustomCategories] = useState<string[]>([])

  const { data: profile } = useQuery({
    queryKey: ['business-profile'],
    queryFn: api.getBusinessProfile,
  })

  const allMenuItems: MenuItem[] = profile?.menu_items || []
  
  // Extract unique categories from menu items
  const existingCategories = Array.from(
    new Set(allMenuItems.map(item => item.category).filter(Boolean))
  ) as string[]
  
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories, ...customCategories])]
  
  // Filter items by selected category
  const menuItems = selectedCategory === 'all'
    ? allMenuItems
    : allMenuItems.filter(item => item.category === selectedCategory || (!item.category && selectedCategory === 'uncategorized'))
  
  // Sort items by order within category
  const sortedItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0))

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setEditForm({ ...item })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleSaveEdit = async () => {
    if (!editForm || !profile) return

    try {
      const updatedItems = allMenuItems.map(item =>
        item.id === editingId ? editForm : item
      )

      await api.updateBusinessProfile(profile.id, {
        menu_items: updatedItems
      })

      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Menu item updated!')
      setEditingId(null)
      setEditForm(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this menu item?')) return

    if (!profile) return

    try {
      const updatedItems = allMenuItems.filter(item => item.id !== id)

      await api.updateBusinessProfile(profile.id, {
        menu_items: updatedItems
      })

      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Menu item deleted')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleAddNew = async () => {
    if (!profile) return

    const categoryToUse = selectedCategory === 'all' || selectedCategory === 'uncategorized' ? '' : selectedCategory
    const maxOrder = allMenuItems
      .filter(item => item.category === categoryToUse)
      .reduce((max, item) => Math.max(max, item.order || 0), 0)

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: '',
      price: '',
      description: '',
      ingredients: '',
      category: categoryToUse,
      order: maxOrder + 1
    }

    setEditingId(newItem.id)
    setEditForm(newItem)

    try {
      const updatedItems = [...allMenuItems, newItem]
      await api.updateBusinessProfile(profile.id, {
        menu_items: updatedItems
      })

      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  
  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }
  
  const handleDrop = async (targetId: string) => {
    if (!draggedItem || !profile || draggedItem === targetId) return
    
    const draggedIndex = sortedItems.findIndex(item => item.id === draggedItem)
    const targetIndex = sortedItems.findIndex(item => item.id === targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    // Create new array with reordered items
    const reordered = [...sortedItems]
    const [removed] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, removed)
    
    // Update order numbers
    const updatedItems = allMenuItems.map(item => {
      const newIndex = reordered.findIndex(r => r.id === item.id)
      if (newIndex !== -1) {
        return { ...item, order: newIndex }
      }
      return item
    })
    
    try {
      await api.updateBusinessProfile(profile.id, {
        menu_items: updatedItems
      })
      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success('Order updated!')
    } catch (error: any) {
      toast.error(error.message)
    }
    
    setDraggedItem(null)
  }
  
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name')
      return
    }
    
    if (allCategories.includes(newCategoryName)) {
      toast.error('Category already exists')
      return
    }
    
    setCustomCategories([...customCategories, newCategoryName])
    setSelectedCategory(newCategoryName)
    setNewCategoryName('')
    setShowCategoryDialog(false)
    toast.success('Category added!')
  }

  const handleExportCSV = () => {
    const headers = ['Name', 'Price', 'Description', 'Ingredients', 'Category']
    const rows = allMenuItems.map(item => [
      item.name,
      item.price || '',
      item.description || '',
      item.ingredients || '',
      item.category || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${profile?.business_name}-menu.csv`
    link.click()

    toast.success('Menu exported!')
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid')
      }

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''))
      const nameIndex = headers.findIndex(h => h === 'name')
      const priceIndex = headers.findIndex(h => h === 'price')
      const descIndex = headers.findIndex(h => h === 'description')
      const ingredIndex = headers.findIndex(h => h === 'ingredients')
      const categoryIndex = headers.findIndex(h => h === 'category')

      if (nameIndex === -1) {
        throw new Error('CSV must contain a "Name" column')
      }

      const importedItems: MenuItem[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        
        if (values[nameIndex]) {
          importedItems.push({
            id: `item-${Date.now()}-${i}`,
            name: values[nameIndex],
            price: priceIndex !== -1 ? values[priceIndex] : '',
            description: descIndex !== -1 ? values[descIndex] : '',
            ingredients: ingredIndex !== -1 ? values[ingredIndex] : '',
            category: categoryIndex !== -1 ? values[categoryIndex] : '',
            order: i
          })
        }
      }

      await api.updateBusinessProfile(profile.id, {
        menu_items: [...allMenuItems, ...importedItems]
      })

      queryClient.invalidateQueries({ queryKey: ['business-profile'] })
      toast.success(`Imported ${importedItems.length} items!`)
      setShowImportDialog(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const downloadSampleCSV = () => {
    const sampleContent = `Name,Price,Description,Ingredients,Category
"Caramel Latte","$5.50","Smooth espresso with vanilla and caramel","Espresso, Milk, Vanilla, Caramel","Drinks"
"Matcha Latte","$6.00","Premium matcha with oat milk","Matcha, Oat Milk, Honey","Drinks"
"Avocado Toast","$8.00","Fresh avocado on artisan bread","Avocado, Sourdough, Olive Oil, Salt","Food"`

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'menu-sample.csv'
    link.click()

    toast.success('Sample CSV downloaded!')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/settings')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Settings
        </Button>

        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Menu Management</h1>
              <p className="text-muted-foreground">
                Organize your products and services by category
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={() => setShowCategoryDialog(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Category
              </Button>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </div>
          
          {/* Category Filter */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <Label className="text-sm font-medium">Filter by Category:</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories ({allMenuItems.length})</SelectItem>
                    <SelectItem value="uncategorized">Uncategorized</SelectItem>
                    {allCategories.map(cat => {
                      const count = allMenuItems.filter(item => item.category === cat).length
                      return count > 0 ? (
                        <SelectItem key={cat} value={cat}>
                          {cat} ({count})
                        </SelectItem>
                      ) : null
                    })}
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  Showing {sortedItems.length} item{sortedItems.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Import Dialog */}
          {showImportDialog && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Import Menu from CSV</CardTitle>
                    <CardDescription>
                      Upload a CSV file with your menu items
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowImportDialog(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-accent/10 p-4 rounded-lg space-y-2">
                  <p className="font-semibold text-sm">CSV Format Requirements:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Required:</strong> Name</li>
                    <li>• <strong>Optional:</strong> Price, Description, Ingredients, Category</li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <Download className="mr-2 h-3 w-3" />
                    Download Sample CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/csv-docs')}
                  >
                    View Documentation
                  </Button>
                </div>

                <div>
                  <Label htmlFor="csvUpload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload CSV file
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="csvUpload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleImportCSV}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Dialog */}
          {showCategoryDialog && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="max-w-md w-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Add New Category</CardTitle>
                      <CardDescription>
                        Create a custom category for organizing your menu items
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowCategoryDialog(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category Name</Label>
                    <Input
                      placeholder="e.g., Seasonal Specials, Kids Menu, etc."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddCategory}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                    <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Menu Items List */}
          <div className="space-y-4">
            {sortedItems.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {selectedCategory === 'all'
                    ? 'No menu items yet. Add your first item or import from CSV!'
                    : `No items in ${selectedCategory} category yet.`}
                </CardContent>
              </Card>
            ) : (
              sortedItems.map((item) => (
                <Card
                  key={item.id}
                  draggable={editingId !== item.id}
                  onDragStart={() => handleDragStart(item.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(item.id)}
                  className={draggedItem === item.id ? 'opacity-50' : 'cursor-move'}
                >
                  <CardContent className="p-6">
                    {editingId === item.id && editForm ? (
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="Product name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              value={editForm.price || ''}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              placeholder="$5.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                              value={editForm.category || 'none'}
                              onValueChange={(value) => setEditForm({ ...editForm, category: value === 'none' ? '' : value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No category</SelectItem>
                                {allCategories.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Brief description"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ingredients</Label>
                          <Input
                            value={editForm.ingredients || ''}
                            onChange={(e) => setEditForm({ ...editForm, ingredients: e.target.value })}
                            placeholder="Comma-separated ingredients"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} disabled={!editForm.name.trim()}>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {item.price && (
                              <span className="text-primary font-medium">{item.price}</span>
                            )}
                            {item.category && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {item.category}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          {item.ingredients && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Ingredients:</strong> {item.ingredients}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
