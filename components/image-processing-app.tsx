'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageCompressor } from './image-compressor'
import { ImageCropper } from './image-cropper'

export function ImageProcessingAppComponent() {
  const [activeTab, setActiveTab] = useState('compress')

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Processing App</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="compress">Compress</TabsTrigger>
          <TabsTrigger value="crop">Crop</TabsTrigger>
        </TabsList>
        <TabsContent value="compress">
          <ImageCompressor />
        </TabsContent>
        <TabsContent value="crop">
          <ImageCropper />
        </TabsContent>
      </Tabs>
    </div>
  )
}