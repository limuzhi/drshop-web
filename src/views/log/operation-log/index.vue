<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="系统模块" prop="title">
          <el-input v-model.trim="params.title" clearable placeholder="请输入系统模块" @clear="search" />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input v-model.trim="params.operName" clearable placeholder="请输入操作人员" @clear="search" />
        </el-form-item>
      <el-form-item label="操作类型" prop="methodType">
        <el-select
          v-model="params.methodType"
          placeholder="操作类型"
          clearable
          size="small"  @clear="search"
        >
          <el-option v-for="dict in methodOptions" 
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
        </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="params.status"
              placeholder="操作状态"
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
        <el-form-item label="创建时间">
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
          <el-button v-permisaction="['systeam:operLog:query']" :loading="loading" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systaem:operLog:delete']" :disabled="multipleSelection.length === 0"
           :loading="loading" icon="el-icon-delete" type="danger" 
           @click="batchDelete">批量删除</el-button> 
           <el-button v-permisaction="['systeam:operLog:clear']" ize="mini" icon="el-icon-delete" type="danger" 
           @click="handleClean">清空</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" align="center" />
        <el-table-column align="center" prop="operId" label="日志编号" />
        <el-table-column align="center" prop="title" label="系统模块" />
        <el-table-column align="center" prop="requestMethod" label="操作类型" />
        <el-table-column align="center" prop="operName" label="操作人员" /> 
        <el-table-column label="主机" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
        <el-table-column label="操作地点" align="center" prop="operLocation" :show-overflow-tooltip="true" />
        <el-table-column label="操作状态" align="center" prop="status" :formatter="statusFormat" />
        <el-table-column align="center" prop="startTime" label="操作时间">
          <template slot-scope="scope">
            {{ parseGoTime(scope.row.operTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="timeCost" label="请求耗时(ms)" align="center">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.timeCost | timeCostTagFilter" disable-transitions>{{ scope.row.timeCost }}</el-tag>
          </template>
        </el-table-column> 
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
              <el-tooltip content="删除" effect="dark" placement="top">
                <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.operId)">
                  <el-button v-permisaction="['systaem:operLog:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
                </el-popconfirm>
              </el-tooltip>
              <el-tooltip content="查看" effect="dark" placement="top">
                <el-button v-permisaction="['systeam:operLog:detail']" size="mini" icon="el-icon-view" circle type="text"
                 @click="handleView(scope.row)" />详细
              </el-tooltip> 
          </template> 
        </el-table-column> 
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

          <!-- 操作日志详细 -->
        <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="50%">
          <el-form ref="dialogForm" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="100px">
           <el-row> 
              <el-col :span="12"> 
                <el-form-item label="操作模块：">{{ dialogFormData.title }} </el-form-item> 
                <el-form-item
                  label="登录信息："
                >{{ dialogFormData.operName }} / {{ dialogFormData.operIp }} / {{ dialogFormData.operLocation }}</el-form-item>

              </el-col>

              <el-col :span="24">
                <el-form-item label="请求方式：">{{ dialogFormData.requestMethod }}</el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="操作方法：">{{ dialogFormData.method }}</el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="请求参数：">{{ dialogFormData.operParam }}</el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="返回参数：">{{ dialogFormData.jsonResult }}</el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="操作状态：">
                  <div v-if="dialogFormData.status === '2'">正常</div>
                  <div v-else>失败</div>
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="操作时间：">{{ dialogFormData.operTime }}</el-form-item>
              </el-col>

            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">关 闭</el-button>
          </div>
        </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { getOperLogList,clearOperlog,batchDeleteOperlogByIds } from '@/api/log/operationLog'
import { parseGoTime } from '@/utils/index'

export default {
  name: 'OperationLog',
  filters: {
    statusTagFilter(val) {
      if (val === 200) {
        return 'success'
      } else if (val === 400) {
        return 'warning'
      } else if (val === 401) {
        return 'danger'
      } else if (val === 403) {
        return 'danger'
      } else if (val === 500) {
        return 'danger'
      } else {
        return 'info'
      }
    },
    timeCostTagFilter(val) {
      if (val <= 200) {
        return 'success'
      } else if (val > 200 && val <= 1000) {
        return ''
      } else if (val > 1000 && val <= 2000) {
        return 'warning'
      } else {
        return 'danger'
      }
    }
  },
  data() {
    return {
      // 查询参数
      params: {
        title: undefined,
        operName: undefined, 
        status: undefined,
        methodType:undefined,
        pageNum: 1,
        pageSize: 10
      }, 
      // 表单参数
      dialogFormTitle: '', 
       // 是否显示弹出层
      dialogFormVisible: false,
      dialogFormData: {},
      dialogFormRules:{},
      // 表格数据
      tableData: [],
      // 日期范围
      dateRange: [],
      // 类型数据字典
      statusOptions: [],
      // 请求方式类型数据字典
      methodOptions: [],
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
    this.getDicts("sys_http_method").then(response => {
      this.methodOptions = response.data || [];
    });
    this.getTableData()
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
        const { data } = await getOperLogList(this.addDateRange(this.params, this.dateRange))
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
        const operLogIds = []
        this.multipleSelection.forEach(x => {
          operLogIds.push(x.operId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteOperlogByIds({operIds:operLogIds})
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

    // 操作日志状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },

     /** 详细按钮操作 */
    handleView(row) {
      this.dialogFormTitle = '操作日志详细'
      this.dialogFormVisible = true
      this.dialogFormData = row;
    },

    // 单个删除
    async singleDelete(operId) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeleteOperlogByIds({operIds:[operId]})
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
    },

   /** 清空按钮操作 */
    handleClean() {
        this.$confirm('是否确认清空所有操作日志数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return clearOperlog();
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
