<script setup lang="ts">
import { Button } from '@/components/ui/button'

import { useInterval } from '@vueuse/core'

// const counter = useInterval(200)

const { counter ,reset, pause ,resume , isActive} = useInterval(1000, {
  controls: true,
   callback: (count) => {
    console.log(`Tick ${count}`)
  },
})

</script>

<template>
   <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="bg-muted/50 aspect-video rounded-xl">
             <h1>{{ counter }}</h1> - <h1>{{ isActive }}</h1>
      <Button @click="reset">Reset</Button>
      <br/>
      <Button @click="pause">Pause</Button>
      <br/>
          <Button @click="resume">Resume</Button>
      <br/>
    <Button>Click me{{ counter }}</Button>
          </div>
          <div class="bg-muted/50 aspect-video rounded-xl" />
          <div class="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
</template>
