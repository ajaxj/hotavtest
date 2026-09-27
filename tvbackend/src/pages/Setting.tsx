

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button.tsx"
import { fetchHomePage, fetchTvDetail } from "@/hooks/other.ts"

export default function Setting() {

  const handleFetchHomePage = async () => {
    await fetchHomePage()
  }

  const handleFetchTvDetail = async () => {
    await fetchTvDetail()
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="fetch">手动抓取</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="fetch">
        <div className="flex flex-row gap-2">
       <Button onClick={handleFetchHomePage}>抓取首页</Button>
       <Button onClick={handleFetchTvDetail}>抓取TV详情</Button>
       <Button>抓取首页3</Button>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        View your analytics here.
      </TabsContent>
      <TabsContent value="reports">View your reports here.</TabsContent>
    </Tabs>
  )
}
