<template>
  <div style="width: 100%" class="comp-item">
    <el-collapse v-if="!isTemplate">
      <el-collapse-item>
        <template #title>
          BatchNormalization
        </template>
        <div>
          content
        </div>
      </el-collapse-item>
    </el-collapse>
    <div @click="methods.handleClick()" :style="{color: (CData.isActive ? 'blue' : 'black')}" v-else>
      <span style="color: red; font-weight: bold" v-if="CData.id !== undefined">{{ "(" + CData.id + ")" }}</span>
      BatchNormalization
    </div>
    <el-form :model="CData" v-if="!isTemplate">
      <el-form-item>
        <el-input type="text"
                  disabled v-model="CData.value"
                  @keyup.enter.stop
                  @keyup.space.stop
                  @click.stop/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {reactive, onMounted} from 'vue'
import {ComponentItem} from "@/components/ComponentItem";

export default {
  name: "BatchNormalization",
  props: {
    data: [ComponentItem, Object],
    isTemplate: {
      type: Boolean,
      default: false
    },
    isParam: {
      type: Boolean,
      default: false
    }
  },
  emits: ['open'],
  setup(props, ctx) {
    onMounted(() => {
      CData.value = "BatchNormalization"
    })
    const CData = reactive(props.data)

    const methods = {
      handleClick() {
        if (props.isTemplate) {
          ctx.emit('open', {type: 'BatchNormalization', id: CData.id})
          if (props.isParam) {
            CData.isActive = true
          }
        }
      }
    }
    return {
      CData,
      methods
    }
  }
}
</script>

<style scoped>
@import "./LCComponents.scss";
</style>