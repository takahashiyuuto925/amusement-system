<template>
  <div class="upload-container">
      <el-upload
        :action="action"
        :headers="headers"
        :multiple="false"
        :limit="1"
        :before-upload="beforeUpload"
        :on-success="onSuccess"
        :on-error="onError"
        :on-remove="onRemove"
        :file-list="fileList"
        :on-exceed="onExceed"
        :disabled="disabled"
        drag
        show-file-list
        accept="application/epub+zip" 
        class="image-upload"
      ><i class="el-icon-upload" />
      <div v-if="fileList.length === 0" class="el-upload__text">
          拖入电子书或 <em>点此上传</em>
      </div>
      <div v-else class="el-upload__text">图书已上传</div>
      </el-upload>
  </div>
</template>

<script>
import { getToken } from '../../utils/auth'
export default {
    props: {
        fileList: {
            type: Array,
            default(){
                return []
            }
        },
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return{
            action: `${process.env.VUE_APP_BASE_API}/book/upload`
        }
    },
    computed: {
        headers() {
            return {
                Authorization: `Bearer ${getToken()}`
            }
        }
    },
    methods: {
        beforeUpload(file){
            this.$emit('beforeUpload', file)
        },
        onSuccess(res, file){
            const {code, msg, data} = res
            if (code === 0) {
                this.$message({
                    message: msg,
                    type: 'success'
                })
                this.$emit('onSuccess',data)
            }else {
                this.$message({
                    message: (msg && `上传失败${msg}`) || '上传失败',
                    type: 'error'
                })
                this.$emit('onError',file)
            }
        },
        onError(err){
            const errMsg = err.message && JSON.parse(err.message)
            this.$message({
                message: (errMsg && errMsg.msg && `上传失败：${errMsg.msg}`) || '上传失败',
                type: 'error'
            })
            this.$emit('onError', err)
        },
        onRemove(){
            this.$message({
                message: '电子书删除成功',
                type: 'success'
            })
            this.$emit('onRemove')
        },
        onExceed(){
            this.$message({
                message: '每次只能上传一本书籍',
                type: 'warning'
            })
        }
    }
}
</script>

<style>

</style>