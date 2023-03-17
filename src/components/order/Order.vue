<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索按钮 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrdersList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList()"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表区域 -->
      <el-table :data="orderslist" border stripe>
        <el-table-column type="index"> </el-table-column>
        <!-- 订单编号 -->
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <!-- 订单价格 -->
        <el-table-column label="订单价格" prop="order_price"> </el-table-column>
        <!-- 是否付款 -->
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <!-- 是否发货 -->
        <el-table-column label="是否发货" prop="is_send"> </el-table-column>
        <!-- 创建时间 -->
        <el-table-column label="创建时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <!-- 修改地址 -->
            <el-tooltip content="修改地址" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                circle
                @click="showEditDialog(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
            <!-- 物流状态 -->
            <el-tooltip content="物流状态" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-location"
                circle
                @click="removeUserById(scope.row.order_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="addFromDialogClosed()"
    >
      <!-- 中间区域 -->
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="cityData"
            v-model="addressForm.address1"
            :props="{ expandTrigger: 'hover' }"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 获取订单列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      orderslist: [],
      total: 0,

      editDialogVisible: false,
      addressForm: {
        address1: [],
        address2: '',
      },
      // 修改地址表单的验证规则
      addressFormRules: {
        address1: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur',
          },
        ],
        address2: [
          {
            required: true,
            message: '请输入详细地址',
            trigger: 'blur',
          },
        ],
      },
      cityData: cityData,
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    // 获取订单列表
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo,
      })
      if (res.meta.status != 200) return this.$message.error('获取订单列表失败')
      this.orderslist = res.data.goods
      this.total = res.data.total
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getOrdersList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrdersList()
    },
    // 控制修改地址对话框的显示与隐藏
    showEditDialog() {
      this.editDialogVisible = true
    },
    addFromDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },
  },
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100;
}
</style>