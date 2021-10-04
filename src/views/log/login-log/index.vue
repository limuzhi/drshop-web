<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="登录IP" prop="ipaddr">
          <el-input v-model.trim="params.ipaddr" clearable placeholder="请输入登录地址" @clear="search" />
        </el-form-item>
        <el-form-item label="登录地点" prop="loginLocation">
          <el-input v-model.trim="params.loginLocation" clearable placeholder="请输入登录地点" @clear="search" />
        </el-form-item>
        <el-form-item label="用户名称" prop="loginName">
          <el-input v-model.trim="params.loginName" clearable placeholder="请输入用户名称" @clear="search" />
        </el-form-item>  
        <el-form-item label="登录状态" prop="status">
            <el-select
              v-model="params.status"
              placeholder="登录状态"
              clearable
              size="small" 
            >
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="登录时间">
          <el-date-picker
            v-model="dateRange"
            size="small"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systeam:loginLog:query']" :loading="loading" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systeam:loginLog:delete']" :disabled="multipleSelection.length === 0"
           :loading="loading" icon="el-icon-delete" type="danger" 
           @click="batchDelete">批量删除</el-button> 
           <el-button v-permisaction="['systeam:loginLog:clear']" ize="mini" icon="el-icon-delete" type="danger" 
           @click="handleClean">清空</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%"
         @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" />
        <el-table-column align="center" prop="loginId" label="日志编号" />
        <el-table-column align="center" prop="loginName" label="登录名称" />
        <el-table-column :show-overflow-tooltip="true" width="130" align="center" prop="ipaddr" label="登录地址" />
        <el-table-column align="center" prop="loginLocation" label="登录地点" /> 
        <el-table-column label="浏览器" align="center" prop="browser" />
        <el-table-column label="登录状态" align="center" prop="status" :formatter="statusFormat" /> 
        <el-table-column label="登录日期" align="center" prop="loginTime" width="180" >
          <template slot-scope="scope">
            {{ parseGoTime(scope.row.loginTime) }}
          </template> 
        </el-table-column>
        <el-table-column label="提示消息" align="center" prop="msg" /> 
      </el-table>

      <el-pagination
        :current-page="params.pageNum"
        :page-size="params.pageSize"
        :total="total"
        :page-sizes="[1, 5, 10, 30]"
        layout="total, prev, pager, next, sizes"
        background
        style="margin-top: 10px;float:right;margin-bottom: 10px;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      /> 
    </el-card>
  </div>
</template>

<script>
import { LoginLoglist,batchDeleteLog,clearLoginLog } from '@/api/log/loginLog'
import { parseGoTime } from '@/utils/index'

export default {
  name: 'LoginLog', 
  data() {
    return {
      // 查询参数
      params: {
        loginName: undefined,
        ipaddr: undefined, 
        loginLocation: undefined,
        status:undefined,
        pageNum: 1,
        pageSize: 10
      },  
      // 表格数据
      tableData: [],
      // 日期范围
      dateRange: [],
      // 类型数据字典
      statusOptions: [], 
      total: 0,
      loading: false,

      // 删除按钮弹出框
      popoverVisible: false,
      // 表格多选
      multipleSelection: []
    }
  },
  created() {
    this.getDicts("sys_oper_log_status").then(response => {
      this.statusOptions = response.data || [];
    }); 
    this.search()
  },
  methods: {
    parseGoTime,
    // 查询
    search() {
      this.params.pageNum = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await LoginLoglist(this.addDateRange(this.params, this.dateRange))
        this.tableData = data.list
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 批量删除
    batchDelete() {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async res => {
        this.loading = true
        const logidIds = []
        this.multipleSelection.forEach(x => {
          logidIds.push(x.loginId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteLog(logidIds)
          msg = message
        } finally {
          this.loading = false
        }

        this.getTableData()
        this.$message({
          showClose: true,
          message: msg,
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          showClose: true,
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    }, 
 
   /** 清空按钮操作 */
    handleClean() {
        this.$confirm('是否确认清空所有登录日志数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return clearLoginLog();
        }).then(() => {
          this.getTableData();
          this.msgSuccess("清空成功");
        }).catch(function() {});
    },
    // 分页
    handleSizeChange(val) {
      this.params.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.params.pageNum = val
      this.getTableData()
    }
  }
}
</script>

<style scoped>
  .container-card{
    margin: 10px;
  }

  .delete-popover{
    margin-left: 10px;
  }
</style>
