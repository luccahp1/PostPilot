import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CSVDocumentationPage() {
  const navigate = useNavigate()

  const downloadSample = () => {
    const sampleContent = `Name,Price,Description,Ingredients,Category
"Caramel Latte","$5.50","Smooth espresso with vanilla and caramel","Espresso, Milk, Vanilla, Caramel","Drinks"
"Matcha Latte","$6.00","Premium matcha with oat milk","Matcha, Oat Milk, Honey","Drinks"
"Avocado Toast","$8.00","Fresh avocado on artisan bread","Avocado, Sourdough, Olive Oil, Salt","Food"
"Blueberry Muffin","$4.50","Freshly baked with wild blueberries","Flour, Eggs, Blueberries, Sugar","Desserts"`

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
        <Button variant="ghost" onClick={() => navigate('/menu-management')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu Management
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">CSV Import Documentation</h1>
            <p className="text-muted-foreground">
              Learn how to format your menu data for bulk import
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>Get started with a sample file</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadSample}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Download this sample file to see the correct format, then modify it with your own menu items.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>CSV Format Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Required Column:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Name</strong> - The name of your menu item (required)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Optional Columns:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Price</strong> - Item price (e.g., $5.50, $12.99)</li>
                  <li><strong>Description</strong> - Brief description of the item</li>
                  <li><strong>Ingredients</strong> - Comma-separated list of ingredients</li>
                  <li><strong>Category</strong> - Category name (e.g., Drinks, Food, Desserts)</li>
                </ul>
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Important Notes:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Column headers must be in the first row</li>
                  <li>Headers are case-insensitive (Name, name, NAME all work)</li>
                  <li>Use quotes around values containing commas</li>
                  <li>Empty optional fields can be left blank</li>
                  <li>Maximum file size: 5MB</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Example File Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
                <pre>{`Name,Price,Description,Ingredients,Category
"Caramel Latte","$5.50","Smooth espresso with vanilla and caramel","Espresso, Milk, Vanilla, Caramel","Drinks"
"Matcha Latte","$6.00","Premium matcha with oat milk","Matcha, Oat Milk, Honey","Drinks"
"Avocado Toast","$8.00","Fresh avocado on artisan bread","Avocado, Sourdough, Olive Oil, Salt","Food"
"Blueberry Muffin","$4.50","Freshly baked with wild blueberries","Flour, Eggs, Blueberries, Sugar","Desserts"`}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Common Mistakes to Avoid</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="text-destructive">❌</span>
                  <div>
                    <strong>Missing quotes around values with commas</strong>
                    <p className="text-muted-foreground">
                      ✅ Correct: "Flour, Eggs, Sugar"<br />
                      ❌ Wrong: Flour, Eggs, Sugar
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">❌</span>
                  <div>
                    <strong>Missing Name column</strong>
                    <p className="text-muted-foreground">
                      Name is the only required column. All rows must have a name value.
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">❌</span>
                  <div>
                    <strong>Inconsistent number of columns</strong>
                    <p className="text-muted-foreground">
                      Each row should have the same number of commas, even if some values are empty.
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="text-destructive">❌</span>
                  <div>
                    <strong>Using wrong file format</strong>
                    <p className="text-muted-foreground">
                      File must be .csv format. Excel files (.xlsx) won't work.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
