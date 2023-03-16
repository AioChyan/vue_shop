<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <div>
        <el-row>
          <el-col>
            <el-button type="primary" @click="showAddCategoriesDialogVisible()"
              >添加分类</el-button
            >
          </el-col>
        </el-row>
      </div>

      <!-- 表格区域 -->
      <tree-table
        :data="categorieslist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error" style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success"
            >二级</el-tag
          >
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCategoriesById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoriesDialogVisible"
      width="50%"
      @close="addCategoriesDialogClose()"
    >
      <el-form
        :model="addCategoriesForm"
        :rules="addCategoriesFormRules"
        ref="addCategoriesFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoriesForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCatagoriesList"
            :props="cascaderProps"
            clearable
            @change="parentCatagoriesChanged()"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategories()">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose()"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name" prop="cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategoriesInfo()"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 获取分类列表的参数对象
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },

      categorieslist: [],

      total: 0,

      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],

      // 控制添加分类对话框的显示与隐藏
      addCategoriesDialogVisible: false,

      // 添加分类的表单
      addCategoriesForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCategoriesFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },

      // 父级分类的列表参数
      parentCatagoriesList: [],

      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },

      // 选中的父级分类的id数组
      selectedKeys: [],

      // 控制修改分类 对话框的显示与隐藏
      editDialogVisible: false,

      // 查询到的分类信息的数据对象
      editForm: {},

      // 修改分类表单的验证规则对象
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategoriesList()
  },
  methods: {
    // 获取分类列表
    async getCategoriesList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status != 200) return this.$message.error('获取分类列表失败')
      this.categorieslist = res.data.result
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getCategoriesList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange (newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getCategoriesList()
    },
    // 点击按钮，显示分类对话框
    showAddCategoriesDialogVisible () {
      this.getParentCategories()
      this.addCategoriesDialogVisible = true
    },

    // 获取父级分类的数据列表
    async getParentCategories () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status != 200) {
        return this.$message.error('获取父级列表失败！')
      }
      this.parentCatagoriesList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCatagoriesChanged () {
      if (this.selectedKeys.length > 0) {
        this.addCategoriesForm.cat_pid =
          this.selectedKeys[this.selectedKeys - 1]
        this.addCategoriesForm.cat_level = this.selectedKeys.length
      } else {
        this.addCategoriesForm.cat_pid = 0
        this.addCategoriesForm.cat_level = 0
      }
    },

    // 点击按钮，添加新的分类
    addCategories () {
      this.$refs.addCategoriesFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCategoriesForm
        )
        if (res.meta.status != 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCategoriesList()
        this.addCategoriesDialogVisible = false
      })
    },
    // 监听对话框的关闭事件，重置表单数据
    addCategoriesDialogClose () {
      this.$refs.addCategoriesFormRef.resetFields()
      this.selectedKeys = ''
      this.addCategoriesForm.cat_pid = 0
      this.addCategoriesForm.cat_level = 0
    },
    // 展示编辑用户的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status != 200) return this.$message.error('查询分类失败 ')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改分类对话框的关闭事件
    editDialogClose () {
      this.$refs.editFormRef.resetFields()
    },

    // 点击按钮，修改分类
    editCategoriesInfo () {
      this.$refs.editFormRef.validate(async (valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          { cat_name: this.editForm.cat_name }
        )
        if (res.meta.status != 200) { return this.$message.error('修改用户信息失败') }
        this.$message.success('修改用户信息成功')
        // 隐藏修改分类的对话框
        this.editDialogVisible = false
        // 重新获得分类列表
        this.getCategoriesList()
      })
    },

    // 删除分类
    async removeCategoriesById (id) {
      console.log(id)
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status != 200) return this.$message.error('删除角色失败！')
      this.$message.success('删除角色成功')
      this.getCategoriesList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
