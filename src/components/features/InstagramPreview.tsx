import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface InstagramPreviewProps {
  businessName: string
  avatar?: string
  postType: string
  caption: string
  hashtags: string[]
}

export function InstagramPreview({ 
  businessName, 
  avatar, 
  postType, 
  caption, 
  hashtags 
}: InstagramPreviewProps) {
  const displayCaption = caption.length > 125 ? caption.substring(0, 125) + '...' : caption
  const displayHashtags = hashtags.slice(0, 5).join(' ')

  return (
    <Card className="max-w-sm overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={businessName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold">{businessName[0]}</span>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{businessName}</p>
        </div>
        <button className="text-xl font-bold">···</button>
      </div>

      {/* Image Placeholder */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-2">
            {postType === 'reel' ? '🎥' : 
             postType === 'carousel' ? '🖼️' : 
             postType === 'story' ? '⚡' : '📷'}
          </div>
          <p className="text-sm font-medium text-gray-600 capitalize">{postType}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6" />
            <MessageCircle className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
          <Bookmark className="w-6 h-6" />
        </div>

        <div className="text-xs font-semibold">1,234 likes</div>

        {/* Caption */}
        <div className="text-sm">
          <span className="font-semibold mr-2">{businessName}</span>
          <span>{displayCaption}</span>
          {caption.length > 125 && (
            <button className="text-gray-500 ml-1">more</button>
          )}
        </div>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="text-sm text-blue-900">
            {displayHashtags}
            {hashtags.length > 5 && (
              <button className="text-gray-500 ml-1">more</button>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500">2 HOURS AGO</div>
      </div>
    </Card>
  )
}