<template>
  <div :class="$style.add">
    <input
      type="text"
      :class="$style.input"
      v-model="newTagName"
      placeholder="タグを追加"
      minlength="1"
      maxlength="30"
    />
    <button
      :class="$style.button"
      @click="addTag"
      :disabled="newTagName.length === 0 || adding"
    >
      <icon name="plus" mdi :class="$style.icon" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from '@vue/composition-api'
import apis from '@/lib/apis'
import { UserId } from '@/types/entity-ids'
import Icon from '@/components/UI/Icon.vue'

export default defineComponent({
  name: 'TagsTab',
  props: {
    userId: {
      type: String as PropType<UserId>,
      required: true
    }
  },
  setup(props) {
    const newTagName = ref('')
    const adding = ref(false)

    const addTag = async () => {
      adding.value = true
      await apis.addUserTag(props.userId, {
        tag: newTagName.value
      })
      adding.value = false
      newTagName.value = ''
    }

    return { newTagName, addTag, adding }
  },
  components: {
    Icon
  }
})
</script>

<style lang="scss" module>
.add {
  display: flex;
  flex-direction: row;
  margin: 8px;
}

.input {
  @include color-ui-secondary;
  @include background-secondary;
  flex: 1 1;
  padding: 4px;
  padding-left: 16px;
  border-radius: 6px;
  &::placeholder {
    @include color-ui-secondary;
  }
}

.button {
  @include color-ui-secondary;
  @include background-secondary;
  padding: 0 12px;
  margin-left: 8px;
  border-radius: 6px;
  cursor: pointer;
}

.icon {
  vertical-align: middle;
}
</style>
