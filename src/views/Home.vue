<template>

  <el-container class="container" v-loading="loading">
    <el-main>
      <el-row style="height: 100px">
        <el-col :span="24">
          <el-row justify="center" style="margin: 10px;box-sizing:border-box;">
            <el-col :span="4">
              <el-upload
                  ref="uploadRef"
                  class="upload-demo"
                  action="#"
                  :on-change="changeUpload"
                  :auto-upload="false"
              >
                <template #trigger>
                  <el-button type="primary">select file</el-button>
                </template>
                <template #default>
                  <el-button class="ml-3" type="success" @click="setUpload" style="margin: 0 10px">
                    upload to server
                  </el-button>
                </template>
              </el-upload>
            </el-col>
            <el-col :span="5">
              <el-button type="primary" @click="submit">submit</el-button>
            </el-col>
            <el-col :span="5" style="margin-right: 10px">
              <el-alert title="文件还未未上传" type="error" center show-icon v-if="!fileIsUpload" :closable="false"/>
              <el-alert type="success" center show-icon v-else-if="fileIsUpload&&this.fileList.length !== 0"
                        :closable="false">
                <template #title>
                  {{ "[" + this.fileList[0].name + "]--文件上传成功" }}
                </template>
              </el-alert>
              <el-alert type="success" center show-icon v-else :closable="false">
                <template #title>
                  本次上传不需要提交文件
                </template>
              </el-alert>
            </el-col>
            <el-col :span="4" v-if="fileList.length === 0">
              <el-switch v-model="fileIsUpload"/>
              提交数据不上传文件
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row style="height: 80px;">
        <el-col>
          <el-tag
              v-for="(tag, index) in parameterSetList"
              :key="tag.title"
              style="margin: 0 10px;justify-content: space-between"
              closable
              effect="dark"
              type="warning"
              size="large"
              @click="addParamterSet(tag)"
              @close="delParamterSet(tag.title, index)"
          >
            {{ tag.title }}
          </el-tag>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-row class="file-wrap">
            <el-card class="data_area">
              <template #header>
                <div class="card-header">
                  <span>Time line</span>
                </div>
              </template>
              <el-timeline style="height: 480px;overflow: auto">
                <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :timestamp="activity.timestamp"
                >
                  {{ activity.content }}
                </el-timeline-item>
              </el-timeline>
            </el-card>
          </el-row>
        </el-col>

        <el-col :span="5">
          <el-card class="box-card">
            <template #header>
              <div class="card-header">
                <span>Layer</span>
              </div>
            </template>
            <el-row>
              <component v-for="(item,index) in componentsList" :is="item.type" :data="item.tempData" :isTemplate="true"
                         :key="index" @click.capture="tapComponents(item)"/>
            </el-row>
          </el-card>
        </el-col>
        <el-col :span="5">
          <el-row>
            <el-card class="code_area">
              <template #header>
                <div class="card-header">
                  <span>Model:</span>
                  <el-button type="primary" @click="saveParam" circle>
                    <el-icon size="16px">
                      <CirclePlus />
                    </el-icon>
                  </el-button>
                  <el-button type="danger" @click="cleanAllData" circle>
                    <el-icon size="16px">
                      <Delete/>
                    </el-icon>
                  </el-button>
                </div>

              </template>
              <BaseParameter :data="baseData" :isTemplate="true" @getType="openDiv"></BaseParameter>
              <draggable
                  id="code"
                  group="lowCode"
                  :animation="300"
                  filter=".unmover"
                  v-model="list"
                  item-key="id"
                  ghostClass="ghost"
                  @dragstart="showBin=true"
                  @dragend="handleDragEnd"
              >

                <template v-slot:item="{element}">
                  <component v-if="element.id" :is="element.type" :data="element" :key="element.id" :isTemplate="true"
                             :isParam="true" @open="openDiv"/>
                </template>
              </draggable>
            </el-card>
          </el-row>
        </el-col>
        <el-col :span="8">
          <el-popover
              placement="bottom"
              title="Title"
              :width="200"
              :visible="tipVisible"
              content="按enter切换到下一个"
          >
            <template #reference>
              <el-card>
                <template #header>
                  <div class="card-header">
                    <span>Layer Parameter:</span>
                  </div>
                </template>
                <component
                    :is="currentComponents.type"
                    :data="currentComponents"
                    :key="currentComponents.id"
                    :isTemplate="false"
                    ref="childRules"
                    @isNext="isNext"
                />
              </el-card>
            </template>
          </el-popover>

        </el-col>
      </el-row>
    </el-main>
    <div id="bin" :class="{'bin-show':showBin}">
      <el-icon size="32px">
        <Delete/>
      </el-icon>
      <draggable
          group="lowCode"
          v-model="binList"
          item-key="item"
          ghostClass="ghost"
          chosenClass="will_delete"
          @dragenter="willDelete=true"
          @dragleave="willDelete=false"
          @add="deleteItem"
      >
        <template v-slot:item="{element}">
          <div>{{ element.id }}</div>
        </template>
      </draggable>
    </div>
    <el-dialog
        v-model="dialogVisible"
        title="Tips"
        width="70%"
        :before-close="handleClose"
    >
      <template #header>
        <div class="card-header">
          <span>Result from Server:</span>
        </div>
      </template>
      <div style="height: 400px; overflow: auto">
        <div v-for="(item,index) in returnData" :key="index">
          {{ item }}
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
// 导入拖拽
import draggable from "vuedraggable";
import {Delete, CirclePlus} from '@element-plus/icons-vue'

// 导入组件
import LcData from "@/components/LCData";
import LcNumber from "@/components/LCNumber";
import Convolution2D from "@/components/Convolution2D";
import MaxPooling2D from "@/components/MaxPooling2D";
import Dense from "@/components/Dense";
import Dropout from "@/components/Dropout";
import BatchNormalization from "@/components/BatchNormalization";
import GlobalAveragePooling2D from "@/components/GlobalAveragePooling2D";
import BaseParameter from "@/components/BaseParameter";
import Flatten from "@/components/Flatten";
// 导入工具
import {ComponentItem} from "@/components/ComponentItem";
import {getReturnData} from "@/api/getReturnData";
import {uploadFile} from "@/api/uploadFile";
import {stopReturnData} from "@/api/stopReturnData";


// 定义初始id
let id = 1

export default {
  name: "HomePage",
  components: {
    Delete,
    CirclePlus,
    draggable,
    LcData,
    LcNumber,
    BaseParameter,
    Convolution2D,
    MaxPooling2D,
    Dropout,
    Dense,
    BatchNormalization,
    GlobalAveragePooling2D,
    Flatten,
  },
  data() {
    return {
      activities: [],
      willDelete: false, // 是否删除已选组件
      showBin: false,
      dialogVisible: false,  //  显示隐藏对话框
      list: [], // 拖拽的列表,
      formDataT: new FormData(),  // 传给后端的文件放在这里
      parameterSetList: [],
      componentsList: [
        {
          type: 'Convolution2D',
          tempData: {
            text: 'Text'
          },
          data: {
            filter: null,
            kernelSize: null,
            activation: '',
            padding: '',
            isActive: '',
            isValid: {
              filter: false,
              kernelSize: false,
              activation: false
            }
          },
        },
        {
          type: 'MaxPooling2D',
          tempData: {
            text: 'Number'
          },
          data: {
            poolSize: null,
            padding: null,
            isActive: '',
            isValid: {
              poolSize: false
            }
          }
        },
        {
          type: 'Dropout',
          tempData: {
            text: 'Number'
          },
          data: {rate: null, isActive: null, isValid: false},
        },
        {
          type: 'Dense',
          tempData: {
            text: 'Object'
          },
          data: {
            units: null, activation: null, isActive: '',
            isValid: {
              units: false,
              activation: false
            }
          }
        },
        {
          type: 'BatchNormalization',
          tempData: {
            text: 'Text'
          },
          data: ['value', 'isActive']
        },
        {
          type: 'GlobalAveragePooling2D',
          tempData: {
            text: 'Text'
          },
          data: ['value', 'isActive']
        },
        {
          type: 'Flatten',
          tempData: {
            text: 'Text'
          },
          data: ['value', 'isActive']
        }
      ],
      fileList: [],
      binList: [],
      submitList: [],
      baseData: null,
      loading: false,
      returnData: [],  //  后端返回的数据
      currentComponents: null,
      wsUrl: 'ws://localhost:8080/websocket/ai',
      webSocket: null,
      fileIsUpload: false,  // 判断文件是否上传
      test: false,
      file: [],
      tipVisible: false
    };
  },
  created() {
    this.baseData = new ComponentItem(0, 'BaseParameter', {
      numClasses: '',
      toCategorical: '',
      isActive: '',
      isValid: false
    })
    this.currentComponents = this.baseData
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      this.parameterSetList.push({
        title: key,
        value: localStorage.getItem(key)
      })
    }
  },
  mounted() {
    this.initWebSocket()
    window.addEventListener("keydown", this.handleEnter)
  },
  computed: {},
  methods: {
    isNext() {
      if(this.list.length === 0) return false
      if (this.currentComponents.id === this.list[this.list.length-1].id) {
        return false
      }
      if (this.currentComponents.isValid === false) {
         return false
      }else if (this.currentComponents.isValid instanceof Object){
        for (const validKey in this.currentComponents.isValid) {
          if (this.currentComponents.isValid[validKey] === false) {
            return false
          }
        }
      }
      this.tipVisible = true
      return true
    },
    handleEnter(e) {
      if (e.keyCode === 13 && this.tipVisible) {
        if (this.currentComponents.id === 0) {
          this.currentComponents = this.list[0]
          this.openDiv(this.currentComponents)
          this.tipVisible = false
          this.currentComponents.isActive = true
          return
        }
        for (let i = 0; i < this.list.length; i++) {
          if (this.currentComponents.id === this.list[i].id) {
            if (!this.list[i+1]) return
            this.currentComponents = this.list[i+1]
            this.currentComponents.isActive = true
            this.openDiv(this.currentComponents)
            this.tipVisible = false
          }
        }
      }
    },
    addParamterSet(tag) {
      const list = JSON.parse(tag.value)
      for (let i = 0; i < list.length; i++) {
        if (list[i].isActive === true && list[i].isActive) {
          this.currentComponents = list[i]
          this.openDiv(this.currentComponents)
        }
      }
      this.baseData.numClasses = list[0].numClasses
      this.baseData.isActive = list[0].isActive
      list.shift()
      this.list = []
      this.list = list
      this.activities.unshift({
        content: 'use parameterSet --- [' + tag.title +']',
        timestamp: this.getCurrentTime(),
      })
    },
    delParamterSet(title, index) {
      this.parameterSetList.splice(index, 1)
      localStorage.removeItem(title)
      this.activities.unshift({
        content: 'delete parameterSet --- [' + title +']',
        timestamp: this.getCurrentTime(),
      })
    },
    saveParam() {
      this.$messageBox.prompt("为参数组设置一个名称", "添加", {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /^[a-zA-Z0-9]{1,20}/,
        inputErrorMessage: "名字长度1-20之间"
      })
          .then(({value}) => {
            this.activities.unshift({
              content: 'Add parameterSet ' + value,
              timestamp: this.getCurrentTime(),
            })
            localStorage.setItem(value, JSON.stringify([this.baseData, ...this.list]))
            this.parameterSetList.push({
              title: value,
              value: JSON.stringify([this.baseData, ...this.list]),
            })
          })
    },
    handleDragEnd() {
      this.showBin = false
    },
    tapComponents(e) {
      const obj = new ComponentItem(id++, e.type, this.deepClone(e.data) || null)
      this.list.push(obj)
      this.currentComponents = obj
      obj.isActive = true
      this.openDiv(obj)
      this.activities.unshift({
        content: 'Add Component ' + e.type,
        timestamp: this.getCurrentTime(),
      })

    },
    clearAttr(oldArr) {
      let arr = oldArr
      for (let i = 0; i < arr.length; i++) {
        if (this.hasProperty(arr[i], 'isActive')) {
          Reflect.deleteProperty(arr[i], 'isActive')
        }
        if (this.hasProperty(arr[i], 'isValid')) {
          Reflect.deleteProperty(arr[i], 'isValid')
        }
      }
      return arr
    },
    hasProperty(obj, key) {
      return Object.keys(obj).includes(key)
    },
    // delFile(id) {
    //   for (let i = 0; i < this.fileList.length; i++) {
    //     if (this.fileList[i].id === id) {
    //       this.fileList.splice(i, 1)
    //     }
    //   }
    // },
    // 修改过
    cleanAllData() {
      this.$messageBox.confirm(
          'Are you sure to clear the list?',
          'clean Message',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }).then(() => {
        this.$message({
          type: 'success',
          message: 'clean completed',
        })
        id = 1
        this.list = []
        this.baseData.isActive = true
        this.baseData.numClasses = ''
        this.baseData.toCategorical = 'False'
        this.baseData.isValid = false
        this.currentComponents = this.baseData
        this.activities.unshift({
          content: 'Clean All Component',
          timestamp: this.getCurrentTime(),
        })
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: 'clean canceled',
        })
      })

    },
    validSubmit(forList) {
      for (let i = 0; i < forList.length; i++) {
        if (forList[i].isValid === false) {
          this.$notify.warning({
            title: "Submit Invalid",
            message: "id为" + forList[i].id + "的" + forList[i].type + "未写",
          })
          this.currentComponents = forList[i]
          this.openDiv(forList[i].type)
          forList[i].isActive = true
          setTimeout(() => {
            this.$refs['childRules'].methods.validateForm()
          }, 10)
          return false
        } else if (forList[i].isValid instanceof Object) {
          for (const key in forList[i].isValid) {
            if (forList[i].isValid[key]) continue
            this.$notify.warning({
              title: "Submit Invalid",
              message: "id为" + forList[i].id + "的" + forList[i].type + "的" + key + "未写",
            })
            this.currentComponents = forList[i]
            this.openDiv(forList[i].type)
            forList[i].isActive = true
            setTimeout(() => {
              this.$refs['childRules'].methods.validateForm()
            }, 10)
            return false
          }
        }
      }
      return true
    },
    // 修改提交数据
    submit: function () {
      let forList = [this.baseData, ...this.list]
      let isSubmit = this.validSubmit(forList)
      if (!isSubmit) {
        return
      }
      if (!this.fileIsUpload) {
        this.$notify.warning({
          title: "file err",
          message: "文件还未上传",
        })
        return;
      }
      this.dialogVisible = true
      this.submitList = JSON.stringify(this.clearAttr([this.baseData, ...this.list, this.file]));
      // this.websocketsend(this.submitList)
      this.activities.unshift({
        content: '提交了数据',
        timestamp: this.getCurrentTime(),
      })
      getReturnData(this.submitList).then((res) => {
        if (res === "success") {
          this.$message({
            message: "success",
            type: "success"
          })
        } else {
          this.$message({
            message: "failure",
            type: "warning"
          })
        }
      })
    },
    // 新增文件上传
    setUpload() {
      //确认上传
      const _this = this;
      //如果没有选择文件则不允许点击,并给出提示选择文件后点击上传按钮
      if (_this.fileList.length === 0) {
        this.$notify.warning({
          title: 'message',
          message: 'Please click the [select file] to upload the file'
        });
      } else {
        //创建formData对象
        const param = new FormData();
        //将文件append到formData对象
        param.append("file", _this.fileList[0].raw);
        param.append("name", _this.fileList[0].name);
        uploadFile(param).then(() => {
          this.fileIsUpload = true
          this.activities.unshift({
            content: '上传了文件' + _this.fileList[0].name,
            timestamp: this.getCurrentTime(),
          })
        })
      }
    },

    // 新增数据对话框被关闭之前
    handleClose() {
      this.$messageBox.confirm(
          'you want to stop?',
          'stop Message',
          {
            confirmButtonText: 'yes',
            cancelButtonText: 'no',
            type: 'warning',
          }).then(() => {

        stopReturnData(false).then((res) => {
          if (res) {
            this.returnData = []
            this.dialogVisible = false
            this.$message({
              type: 'success',
              message: 'already stopped',
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'warning',
          message: 'stop canceled',
        })
      })

    },
    changeUpload(file, fileList) {
      this.fileIsUpload = false
      let componentItem = new ComponentItem(id++, 'lc-data', ['file'])
      componentItem.set('file', file)
      this.file = componentItem
      this.fileList = fileList;
    },
    deleteItem() {
      this.binList = [];
      this.willDelete = false
      this.showBin = false
    },
    // 把除了传入的组件的活跃清除
    openDiv(res) {
      if (res.type === "BaseParameter") {
        this.currentComponents = this.baseData
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].isActive = false
        }
      } else {
        this.baseData.isActive = false
        for (let i = 0; i < this.list.length; i++) {
          if (this.list[i].type === res.type && this.list[i].id === res.id) {
            this.currentComponents = this.list[i]
          } else {
            this.list[i].isActive = false
          }
        }
      }
    },
    judgeType(obj) {
      // tostring会返回对应不同的标签的构造函数
      const toString = Object.prototype.toString
      const map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
      }
      if (obj instanceof Element) {
        return 'element'
      }
      return map[toString.call(obj)]
    },
    deepClone(data) {
      const type = this.judgeType(data)
      let obj
      if (type === 'array') {
        obj = []
      } else if (type === 'object') {
        obj = {}
      } else {
        // 不再具有下一层次
        return data
      }
      if (type === 'array') {
        for (let i = 0, len = data.length; i < len; i++) {
          obj.push(this.deepClone(data[i]))
        }
      } else if (type === 'object') {
        // 对原型上的方法也拷贝了....
        for (const key in data) {
          obj[key] = this.deepClone(data[key])
        }
      }
      return obj
    },
    initWebSocket() {

      if (typeof WebSocket === 'undefined')
        throw new Error('您的浏览器不支持websocket')
      this.websock = new WebSocket(this.wsUrl)
      this.activities.unshift({
        content: 'init websocket',
        timestamp: this.getCurrentTime(),
      })
      this.websock.onmessage = this.websocketonmessage
      this.websock.onopen = this.websocketonopen
      this.websock.onerror = this.websocketonerror
      this.websock.onclose = this.websocketclose
    },
    websocketonopen() {
      this.activities.unshift({
        content: 'open websocket',
        timestamp: this.getCurrentTime(),
      })
    },
    websocketonerror() {
      this.activities.unshift({
        content: 'connect websocket fail',
        timestamp: this.getCurrentTime(),
      })
      // 连接建立失败重连
      this.initWebSocket()
    },
    websocketonmessage(e) {
      // 数据接收
      const redata = (e.data)
      this.returnData.push(redata)
      this.activities.unshift({
        content: '接收到了数据',
        timestamp: this.getCurrentTime(),
      })
    },
    websocketsend(Data) {
      // 数据发送
      this.websock.send(Data)
    },
    websocketclose() {
      this.activities.unshift({
        content: 'close websocket connection',
        timestamp: this.getCurrentTime(),
      })
      // 关闭
    },
    getCurrentTime() {
      //获取当前时间并打印
      let yy = new Date().getFullYear();
      let mm = new Date().getMonth() + 1;
      let dd = new Date().getDate();
      let hh = new Date().getHours();
      let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes() : new Date().getMinutes();
      let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds() : new Date().getSeconds();
      return yy + '/' + mm + '/' + dd + ' ' + hh + ':' + mf + ':' + ss;

    }
  }
}
;
</script>

<style lang="scss" scoped>
@import "src/components/LCComponents.scss";

.container {
  width: 100vw;
  min-height: 100vh;
}

.code_area,
.data_area {
  width: 100%;
  height: 100%;
  margin-bottom: 20px;
}

.code_area {
  overflow: visible;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

#code {
  min-height: 200px;

  .lc-item {
    width: 10%;
  }
}

#bin {
  position: fixed;
  width: 100vw;
  height: 100vh;
  bottom: -110vh;
  left: 0;
  border-radius: 50%;
  box-shadow: 0 0 60px 30px rgba(255, 0, 0, 0.3) inset;
  overflow: hidden;
  transition: .3s bottom ease-out;

  &.bin-show {
    bottom: -90vh;
  }

  .el-icon {
    top: calc((10vh - 32px) / 2);
    left: calc((100% - 32px) / 2);
    color: red;
    position: absolute;
  }

  draggable {
    min-height: 100%;
  }

  .ghost {
    opacity: 0;
  }

  .will_delete,
  .sortable-chosen {
    background: rgba(255, 0, 0, 0.3);
  }

}

.comp-item {
  cursor: pointer;
  margin: 10px 0;
}

.file-wrap > div > div > div {
  display: flex;
  flex-wrap: wrap;

  > div {
    width: 30%;
  }

  .file {
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
  }

}
</style>
