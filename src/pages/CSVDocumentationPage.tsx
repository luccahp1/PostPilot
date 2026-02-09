import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileText, Upload, Edit, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function CSVDocumentationPage() {
  const navigate = useNavigate()

  const downloadSampleCSV = () => {
    const sampleContent = `Name,Price,Description,Ingredients
"Caramel Latte","$5.50","Smooth espresso with vanilla and caramel","Espresso, Milk, Vanilla, Caramel"
"Matcha Latte","$6.00","Premium matcha with oat milk","Matcha, Oat Milk, Honey"
"Cold Brew","$4.50","Smooth, bold cold brew","Coffee, Water"
"Avocado Toast","$8.00","Fresh avocado on artisan bread","Avocado, Sourdough, Olive Oil, Salt"
"Croissant","$4.00","Buttery, flaky French croissant","Flour, Butter, Yeast"`

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">CSV Import Guide</h1>
            <p className="text-muted-foreground">
              Learn how to create, edit, and upload your menu as a CSV file
            </p>
          </div>

          {/* Step 1 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Step 1: Download Sample CSV
              </CardTitle>
              <CardDescription>
                Start with our pre-formatted template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                The easiest way to get started is to download our sample CSV file. This file is already formatted correctly and includes example menu items you can replace with your own.
              </p>
              <Button onClick={downloadSampleCSV}>
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-primary" />
                Step 2: Edit in Excel/Google Sheets
              </CardTitle>
              <CardDescription>
                Modify the template with your menu items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Opening the File:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Excel:</strong> Right-click the downloaded file → Open with Microsoft Excel</li>
                    <li>• <strong>Google Sheets:</strong> Go to sheets.google.com → File → Import → Upload tab → Select the CSV file</li>
                    <li>• <strong>Mac Numbers:</strong> Double-click the file to open in Numbers</li>
                  </ul>
                </div>

                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">CSV Column Format:</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Name</span> <span className="text-red-500">(Required)</span>
                      <p className="text-muted-foreground">The name of your product or service</p>
                    </div>
                    <div>
                      <span className="font-medium">Price</span> <span className="text-muted-foreground">(Optional)</span>
                      <p className="text-muted-foreground">Format: $5.50 or 5.50</p>
                    </div>
                    <div>
                      <span className="font-medium">Description</span> <span className="text-muted-foreground">(Optional)</span>
                      <p className="text-muted-foreground">Brief description of the item</p>
                    </div>
                    <div>
                      <span className="font-medium">Ingredients</span> <span className="text-muted-foreground">(Optional)</span>
                      <p className="text-muted-foreground">Comma-separated list of ingredients</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Important Rules:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Do NOT change the column headers (Name, Price, Description, Ingredients)</li>
                    <li>• Each row represents one menu item</li>
                    <li>• Keep text inside quotes if it contains commas</li>
                    <li>• Leave optional fields blank if not needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Step 3: Save as CSV
              </CardTitle>
              <CardDescription>
                Export your edited file in the correct format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">Excel:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Click File → Save As</li>
                    <li>Choose location to save</li>
                    <li>In "Save as type" dropdown, select "CSV (Comma delimited) (*.csv)"</li>
                    <li>Click Save</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Google Sheets:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Click File → Download</li>
                    <li>Select "Comma Separated Values (.csv)"</li>
                    <li>The file will download to your computer</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Mac Numbers:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Click File → Export To → CSV</li>
                    <li>Choose "UTF-8" encoding</li>
                    <li>Click Next → Export</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Step 4: Upload to PostPilot
              </CardTitle>
              <CardDescription>
                Import your CSV file into the app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="text-sm text-muted-foreground space-y-2 ml-4 list-decimal">
                <li>Go to Settings → Menu Management</li>
                <li>Click "Import CSV" button</li>
                <li>Click the upload area or drag your CSV file</li>
                <li>Wait for confirmation that items were imported</li>
                <li>Review and edit items if needed</li>
              </ol>

              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">💡 Pro Tips:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Import adds to existing items (doesn't replace them)</li>
                  <li>• You can import multiple times to add more items</li>
                  <li>• Use "Export CSV" to create a backup of your current menu</li>
                  <li>• After importing, you can still edit individual items</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Example */}
          <Card>
            <CardHeader>
              <CardTitle>Example CSV Content</CardTitle>
              <CardDescription>
                This is what your CSV file should look like inside
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-accent/20 p-4 rounded-lg text-xs overflow-x-auto">
{`Name,Price,Description,Ingredients
"Caramel Latte","$5.50","Smooth espresso with vanilla and caramel","Espresso, Milk, Vanilla, Caramel"
"Matcha Latte","$6.00","Premium matcha with oat milk","Matcha, Oat Milk, Honey"
"Cold Brew","$4.50","Smooth, bold cold brew","Coffee, Water"
"Avocado Toast","$8.00","Fresh avocado on artisan bread","Avocado, Sourdough, Olive Oil, Salt"`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
