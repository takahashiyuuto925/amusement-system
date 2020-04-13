<template>
  <el-form ref="postForm" :model="postForm" :rules="rules">
    <sticky :class-name="'sub-navbar'">
      <el-button v-if="!isEdit" @click="showGuide">显示帮助</el-button>
      <el-button
        v-loading="loading"
        type="success"
        style="margin-left: 10px"
        @click="submitForm"
      >
        {{ isEdit ? '编辑电子书' : '新增电子书' }}</el-button>
    </sticky>
    <div class="detail-container">
      <el-row>
        <el-col :span="24">
          <ebook-upload
            :file-list="fileList"
            :disabled="isEdit"
            @onSuccess="onUploadSuccess"
            @onRemove="onUploadRemove"
          />
        </el-col>
        <el-col :span="24">
          <el-form-item prop="title">
            <MdInput v-model="postForm.title" :maxlength="100" name="name" required>
              书名
            </MdInput>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="author" label="作者：" :label-width="labelWidth">
                <el-input v-model="postForm.author" placeholder="作者" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="publisher" label="出版社：" :label-width="labelWidth">
                <el-input v-model="postForm.publisher" placeholder="出版社" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="language" label="语言：" :label-width="labelWidth">
                <el-input v-model="postForm.language" placeholder="语言" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="category" label="分类：" :label-width="labelWidth">
                <el-select v-model="postForm.category" placeholder="分类" clearable style="display: inline-flex;">
                  <el-option
                    v-for="(item, index) in categoryList"
                    :key="index"
                    :label="item.categoryText"
                    :value="item.category"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="filePath" label="文件路径:" :label-width="labelWidth">
                <el-input v-model="postForm.filePath" placeholder="文件路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="unzipPath" label="解压路径：" :label-width="labelWidth">
                <el-input v-model="postForm.unzipPath" placeholder="解压路径" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item prop="coverPath" label="封面路径:" :label-width="labelWidth">
                <el-input v-model="postForm.coverPath" placeholder="封面路径" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="fileName" label="文件名称：" :label-width="labelWidth">
                <el-input v-model="postForm.fileName" placeholder="文件名称" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="rootFile" label="根文件：" :label-width="labelWidth">
                <el-input v-model="postForm.rootFile" placeholder="根文件" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="cover" label="封面：" :label-width="labelWidth">
                <a v-if="postForm.cover" :href="postForm.cover" target="_blank">
                  <img :src="postForm.cover" class="preview-img">
                </a>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item prop="contents" label="目录：" :label-width="labelWidth">
                <div v-if="contentsTree && contentsTree.length > 0" class="contents-wrapper">
                  <el-tree :data="contentsTree" @node-click="onContentClick" />
                </div>
                <span v-else>无</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </el-form>
</template>

<script>
import Sticky from '../../../components/Sticky'
import EbookUpload from '../../../components/EbookUpload'
import MdInput from '../../../components/MDinput'
import { createBook, getBook, updateBook } from '../../../api/book'
import { categoryList } from '../../../utils/constant'

const defaultForm = {
  title: '',
  author: '',
  publisher: '',
  language: '',
  rootFile: '',
  cover: '',
  url: '',
  originalName: '',
  fileName: '',
  coverPath: '',
  filePath: '',
  unzipPath: '',
  categoryList: []
}

const fields = {
  title: '书名',
  author: '作者',
  publisher: '出版社',
  language: '语言',
  category: '分类'
}

export default {
  components: {
    Sticky,
    EbookUpload,
    MdInput
  },
  props: {
    isEdit: Boolean
  },
  data() {
    const validateRequire = (rule, value, callback) => {
      if (!value || value.length === 0) {
        callback(new Error(fields[rule.field] + '不能为空'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      postForm: {},
      fileList: [],
      contentsTree: [],
      labelWidth: '120px',
      categoryList,
      rules: {
        title: [{ validator: validateRequire }],
        author: [{ validator: validateRequire }],
        publisher: [{ validator: validateRequire }],
        language: [{ validator: validateRequire }],
        category: [{ validator: validateRequire }]
      }
    }
  },
  created() {
    if (this.isEdit) {
      const fileName = this.$route.params.fileName
      this.getBookData(fileName)
    }
  },
  methods: {
    getBookData(fileName) {
      getBook(fileName).then(response => {
        this.setData(response.data)
      })
    },
    onContentClick(data) {
      if (data.text) {
        window.open(data.text)
      }
    },
    setDefault() {
      this.postForm = Object.assign({}, defaultForm)
      this.contentsTree = []
      this.fileList = []
      this.$refs.postForm.resetFields()
    },
    setData(data) {
      const { title, author, publisher, language,
        rootFile, cover, url, originalName, contents,
        fileName, coverPath, filePath, unzipPath, contentsTree, category } = data

      if (cover === '') {
        this.postForm.cover = 'https://read.lxyamusement.cn:9000/defaultCover/default.jpg'
        this.postForm.coverPath = '/defaultCover/default.jpg'
      } else {
        this.postForm.cover = cover
        this.postForm.coverPath = coverPath
      }
      if (!data.originalName || data.originalName === '') {
        this.postForm.originalName = data.title + '.epub'
      } else {
        this.postForm.originalName = data.originalName
      }
      this.postForm = {
        ...this.postForm,
        title, author, publisher, language,
        rootFile, url, contents,
        fileName, filePath, unzipPath, category
      }
      this.contentsTree = contentsTree
      this.fileList = [{ name: originalName || data.title + '.epub', url }]
      // console.log(this.postForm.category,'666')
    },
    onUploadSuccess(data) {
      this.setData(data)
    },
    onUploadRemove() {
      this.setDefault()
    },
    submitForm() {
      const onSuccess = (response) => {
        // console.log(response,'55')
        const { msg } = response
        this.$notify({
          title: '操作成功',
          message: msg,
          type: 'success',
          duration: 2000
        })
        this.loading = false
      }

      if (!this.loading) {
        this.loading = true
        // console.log(categoryList,'88')
        // console.log(this.postForm.category,'66')
        if (this.postForm.category) {
          this.postForm.categoryText = categoryList[this.postForm.category - 1].categoryText
        }
        this.$refs.postForm.validate((valid, fields) => {
          if (valid) {
            // 浅拷贝表单数据
            const book = Object.assign({}, this.postForm)
            // const book = {...this.postForm}
            delete book.contentsTree
            // console.log(book,'0')
            if (!this.isEdit) {
              createBook(book).then(response => {
                onSuccess(response)
                this.setDefault()
              }).catch(() => {
                this.loading = false
              })
            } else {
              updateBook(book).then(response => {
                onSuccess(response)
              }).catch(() => {
                this.loading = false
              })
            }
          } else {
            const message = fields[Object.keys(fields)[0]][0].message
            this.$message({
              message: message,
              type: 'error'
            })
            this.loading = false
          }
          // this.setDefault()
        })
      }
    },
    showGuide() {
      console.log('导航')
    }
  }
}
</script>

<style lang="scss" scoped>
    .detail-container{
        padding: 40px 50px 20px;
        .preview-img{
            width: 200px;
            height: 270px;
        }
    }
</style>
