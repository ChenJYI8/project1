<template>
  <div style="width: 100%;" class="comp-item">
<!--    <div @click="methods.handleClick" v-if="isTemplate" :style="{color: (CData.isActive ? 'blue' : 'black')}">-->
<!--      <span style="color: red; font-weight: bold" v-if="CData.id !== undefined">{{"("+CData.id+")"}}</span> Flatten-->
<!--    </div>-->
    <el-collapse v-if="!isTemplate">
      <el-collapse-item>
        <template #title>
          Flatten
        </template>
        <div>
          content
        </div>
      </el-collapse-item>
    </el-collapse>
    <div @click="methods.handleClick()" :style="{color: (CData.isActive ? 'blue' : 'black')}" v-else>
      <span style="color: red; font-weight: bold" v-if="CData.id !== undefined">{{ "(" + CData.id + ")" }}</span>
      Flatten
    </div>
    <el-collapse v-if="!isTemplate">
      <el-form>
        <el-collapse-item>
          <template #title>
            <el-form-item>
              <el-input type="text" disabled v-model="CData.value"/>
            </el-form-item>
          </template>
          <div>
            内容
          </div>
        </el-collapse-item>
      </el-form>
    </el-collapse>

  </div>
</template>

<script>
import {reactive} from "vue";
import {ComponentItem} from "@/components/ComponentItem";
import {onMounted} from "vue";

export default {
  name: "Flatten",
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
  setup(props, ctx) {
    onMounted(() => {
      CData.value = "Flatten"
    })
    const methods = {
      handleClick() {
        if (props.isTemplate) {
          ctx.emit('open', {type: 'Flatten', id: CData.id})
          if (props.isParam) {
            CData.isActive = true
          }
        }
      }
    }
    const CData = reactive(props.data)
    return {
      methods,
      CData
    }
  }
}
</script>

<style scoped>

</style>