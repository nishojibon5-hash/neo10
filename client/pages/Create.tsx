import Layout from "@/components/neo10/Layout";
import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Image as ImageIcon, AlertCircle } from "lucide-react";
import Composer from "@/components/neo10/Composer";
import { getToken } from "@/lib/auth";

interface CreateTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
}

const templates: CreateTemplate[] = [
  {
    id: "post",
    name: "Text Post",
    description: "Share your thoughts with the community",
    icon: FileText,
  },
  {
    id: "photo",
    name: "Photo Post",
    description: "Share a photo or image",
    icon: ImageIcon,
  },
  {
    id: "video",
    name: "Video Post",
    description: "Share a video or reel",
    icon: Video,
  },
];

const Template = memo(({ template, onSelect }: any) => (
  <button
    onClick={() => onSelect(template.id)}
    className="rounded-lg border bg-card p-4 text-left hover:border-primary hover:shadow-md transition-all"
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-muted/60">
        <template.icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>
    </div>
  </button>
));

Template.displayName = "Template";

function CreateContent() {
  const [tab, setTab] = useState("templates");

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Create Content</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Share what's on your mind with JOY BANGLA
            </p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="composer">Composer</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-3">
                {templates.map((template) => (
                  <Template
                    key={template.id}
                    template={template}
                    onSelect={() => setTab("composer")}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="composer" className="space-y-4">
              <div className="rounded-lg border bg-card p-4">
                <Composer />
              </div>
            </TabsContent>
          </Tabs>

          {/* Content Tips */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-blue-900">Tips for better content</h4>
                <ul className="text-xs text-blue-800 mt-2 space-y-1">
                  <li>• Be authentic and share genuine moments</li>
                  <li>• Use clear, engaging descriptions</li>
                  <li>• High-quality images and videos perform better</li>
                  <li>• Engage with your audience through comments</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default memo(CreateContent);
