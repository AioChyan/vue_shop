<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            expand-trigger="hover"
            :options="catelist"
            :props="cateProps"
            @change="parentCatagoriesChanged()"
          ></el-cascader>
        </el-col>
        <!-- tab页签区域 -->
        <div>&nbsp;</div>
        <el-tabs v-model="activeName" @tab-click="handleCateClick">
          <!-- 添加动态参数的面板 -->
          <el-tab-pane label="动态参数" name="many">
            <!-- 添加参数的按钮 -->
            <el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="addDialogVisible = true"
              >添加参数</el-button
            >
            <!-- 动态参数表格 -->
            <el-table :data="manyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClosed(i, scope.row)"
                  >
                    {{ item }}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column
                label="参数名称"
                prop="attr_name"
              ></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                    >编辑</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParamById(scope.row.attr_id)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 添加静态属性的面板 -->
          <el-tab-pane label="静态属性" name="only">
            <!-- 添加属性的按钮 -->
            <el-button
              type="primary"
              :disabled="isBtnDisabled"
              @click="addDialogVisible = true"
              >添加属性</el-button
            >
            <!-- 静态属性表格 -->
            <el-table :data="onlyTableData" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item, i) in scope.row.attr_vals"
                    :key="i"
                    closable
                    @close="handleClosed(i, scope.row)"
                  >
                    {{ item }}
                  </el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                    >+ New Tag</el-button
                  >
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column
                label="属性名称"
                prop="attr_name"
              ></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditDialog(scope.row.attr_id)"
                    >编辑</el-button
                  >
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParamById(scope.row.attr_id)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
      :visible.sync="addDialogVisible"
      width="50%"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        @close="addDialogClosed()"
      >
        <el-form-item
          :label="activeName === 'many' ? '动态参数' : '静态属性'"
          prop="attr_name"
        >
          <el-input v-model="addForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="activeName === 'many' ? '添加动态参数' : '添加静态属性'"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
        @close="editDialogClosed()"
      >
        <el-form-item
          :label="activeName === 'many' ? '动态参数' : '静态属性'"
          prop="attr_name"
        >
          <el-input v-model="editForm.attr_name"></el-input> </el-form-item
      ></el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParamInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类对象数据
      catelist: [],
      // 指定级联选择器的配置对象
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的id数组
      selectedCateKeys: [],
      // 被激活的页签名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '内容不能为空',
            trigger: 'blur'
          }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改参数的表单数据对象
      editForm: {
        attr_name: ''
      },
      // 修改表单的验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '内容不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    //  获取所有商品分类列表
    async getCateList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类列表失败！')
      }
      this.catelist = res.data
    },
    // 级联选择器的选择项发生变化触发这个函数
    parentCatagoriesChanged () {
      this.getParamsData()
    },
    // tab页签点击事件的处理函数
    handleCateClick () {
      this.getParamsData()
    },
    // 获取参数列表数据
    async getParamsData () {
      // 证明选中的不是三级分类
      if (this.selectedCateKeys.length != 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      // 证明选中的是三级分类
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status != 200) {
        return $this.$message.error('获取参数列表失败！')
      }

      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      console.log(res.data)

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }

      console.log(res.data)
    },
    // 监听添加属性对话框的关闭事件
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加属性或者参数
    addParams () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status != 201) {
          return this.$message.error('添加参数或属性失败！')
        }
        this.$message.success('添加成功！')

        this.addDialogVisible = false

        this.getParamsData()
      })
    },
    // 点击按钮，展示修改对话框
    showEditDialog () {
      this.editDialogVisible = true
    },
    // 监听修改属性对话框的关闭事件
    addDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 展示修改属性的对话框
    async showEditDialog (attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('查询参数或者属性失败 ')
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 点击按钮，修改参数或属性
    editParamInfo () {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status != 200) { return this.$message.error('修改参数或属性失败') }
        this.$message.success('修改参数或属性成功')
        // 隐藏添加用户的对话框
        this.editDialogVisible = false
        // 重新获得用户列表
        this.getParamsData()
      })
    },
    // 根据id删除属性或参数
    async removeParamById (attr_id) {
      // 弹框 询问用户是否删除
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult != 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status != 200) { return this.$message.error('删除参数或属性失败！') }
      this.$message.success('删除参数或属性成功')
      this.getParamsData()
    },
    // 文本框失去焦点或按下enter触发
    async handleInputConfirm (row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )

      if (res.meta.status != 200) {
        this.$message.error('添加标签失败！')
      }
      this.$message.success('添加标签成功')
    },
    // 点击按钮，展示文本输入框
    showInput (row) {
      row.inputVisible = true
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    async handleClosed (i, row) {
      row.attr_vals.splice(i, 1)
      await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(',')
        }
      )
    }
  },
  computed: {
    // 如果按钮被禁用，则返回true，否则返回false
    isBtnDisabled () {
      if (this.selectedCateKeys.length != 3) {
        return true
      }
      return false
    },

    // 当前选中的三级分类的id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>
