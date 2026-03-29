<script setup lang="ts">
import {CheckIcon, ChevronsUpDownIcon, Loader2} from 'lucide-vue-next'
import {computed, ref} from 'vue'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,} from '@/components/ui/command'
import {Popover, PopoverContent, PopoverTrigger,} from '@/components/ui/popover'

const props = defineProps<{
  items: Array<string>,
  hint: string,
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [value: string]
  search: [query: string]
}>()

const open = ref(false)
const value = ref('')
const selectedItems = computed(() =>
    props.items.find(item => item === value.value),
)

function handleSearchInput(e: Event) {
  emit('search', (e.target as HTMLInputElement).value)
}

function selectItem(selectedValue: string) {
  value.value = selectedValue === value.value ? '' : selectedValue
  open.value = false
  if (value.value) {
    emit('select', value.value)
    value.value = ''
  }
}
</script>
<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="w-[200px] justify-between"
      >
        {{ selectedItems ?? hint }}
        <ChevronsUpDownIcon class="opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput class="h-9" placeholder="Search..." @input="handleSearchInput" />
        <CommandList>
          <CommandEmpty>
            <span v-if="loading" class="flex items-center gap-2 justify-center text-muted-foreground text-sm">
              <Loader2 class="size-4 animate-spin" /> Loading...
            </span>
            <span v-else>No items found.</span>
          </CommandEmpty>
          <CommandGroup>
            <CommandItem
                v-for="item in items"
                :key="item"
                :value="item"
                @select="(ev) => {
                selectItem(ev.detail.value as string)
              }"
            >
              {{ item }}
              <CheckIcon
                  :class="cn(
                  'ml-auto',
                  value === item ? 'opacity-100' : 'opacity-0',
                )"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
