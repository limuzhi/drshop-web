<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="访问路径">
          <el-input v-model.trim="params.path" clearable placeholder="访问路径" @clear="search" />
        </el-form-item>
        <el-form-item label="所属类别">
          <el-input v-model.trim="params.category" clearable placeholder="所属类别" @clear="search" />
        </el-form-item>
        <el-form-item label="请求方法"> 
          <el-select v-model.trim="params.method" clearable placeholder="请求方式" @change="search" @clear="search">
            <el-option
              v-for="dict in methodOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item> 
        <el-form-item>
          <el-button :loading="loading" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:api:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:api:delete']" :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column  prop="path" label="访问路径" align="center" />
        <el-table-column  prop="category" label="所属类别" align="center"/> 
         <el-table-column  prop="permission" label="权限标识" align="center"/>
        <el-table-column label="请求方式" align="center" prop="method" :formatter="methodFormat" /> 
        <!-- <el-table-column  prop="handle" label="代码地址" align="center" /> -->
        <el-table-column  prop="title" label="说明" />
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:api:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.apiId)">
                <el-button v-permisaction="['systeam:api:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
              </el-popconfirm>
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

      <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
        <el-form ref="dialogForm" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="120px">
          <el-form-item label="访问路径" prop="path">
            <el-input v-model.trim="dialogFormData.path" placeholder="访问路径" />
          </el-form-item>
          <el-form-item label="所属类别" prop="category">
            <el-input v-model.trim="dialogFormData.category" placeholder="所属类别" />
          </el-form-item> 
          <el-form-item label="请求方式" prop="method">
            <el-select v-model="dialogFormData.method"  placeholder="请选择请求方式">
              <el-option
                v-for="item in methodOptions"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"  
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <span slot="label">
              权限标识
              <el-tooltip content="前端权限控制按钮是否显示" placement="top">
                <i class="el-icon-question" />
              </el-tooltip>
            </span>
            <el-input v-model="dialogFormData.permission" placeholder="请权限标识" maxlength="60" />
          </el-form-item>
          <el-form-item label="说明" prop="title">
            <el-input v-model.trim="dialogFormData.title" type="textarea" placeholder="说明" show-word-limit maxlength="100" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="cancelForm()">取 消</el-button>
          <el-button size="mini" :loading="submitLoading" type="primary" @click="submitForm()">确 定</el-button>
        </div>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
import { getApis, createApi, updateApiById, batchDeleteApiByIds } from '@/api/system/api'

export default {
  name: 'Api',
  filters: {
    methodTagFilter(val) {
      if (val === 'GET') {
        return ''
      } else if (val === 'POST') {
        return 'success'
      } else if (val === 'PUT') {
        return 'info'
      } else if (val === 'PATCH') {
        return 'warning'
      } else if (val === 'DELETE') {
        return 'danger'
      } else {
        return 'info'
      }
    }
  },
  data() {
    return {
      // 查询参数
      params: {
        path: '',
        method: '',
        category: '', 
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,

      // 状态数据字典
      methodOptions: [],
      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        apiId:undefined,
        path: '',
        handle:'',
        category: '',
        method: '',
        permission:'',
        title: ''
      },
      dialogFormRules: {
        path: [
          { required: true, message: '请输入访问路径', trigger: 'blur' },
          { min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请输入所属类别', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        method: [
          { required: true, message: '请选择请求方式', trigger: 'change' }
        ],
        title: [
          { required: false, message: '说明', trigger: 'blur' },
          { min: 0, max: 100, message: '长度在 0 到 100 个字符', trigger: 'blur' }
        ]
      },

      // 删除按钮弹出框
      popoverVisible: false,
      // 表格多选
      multipleSelection: []
    }
  },
  created() {
    this.getTableData()

     this.getDicts('sys_api_method').then(response => {
      this.methodOptions = response.data
    })
  },
  methods: {
    // 查询
    search() {
      this.params.pageNum = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await getApis(this.params)
        this.tableData = data.list
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 新增
    create() {
      this.dialogFormTitle = '新增接口'
      this.dialogType = 'create'
      this.dialogFormVisible = true
    },

    // 修改
    update(row) {
      this.dialogFormData.apiId = row.apiId
      this.dialogFormData.handle = row.handle
      this.dialogFormData.path = row.path
      this.dialogFormData.category = row.category
      this.dialogFormData.method = row.method 
      this.dialogFormData.permission = row.permission 
      this.dialogFormData.title = row.title

      this.dialogFormTitle = '修改接口'
      this.dialogType = 'update'
      this.dialogFormVisible = true
    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          let msg = ''
          this.submitLoading = true
          try {
            if (this.dialogType === 'create') {
              const { message } = await createApi(this.dialogFormData)
              msg = message
            } else {
              const { message } = await updateApiById(this.dialogFormData)
              msg = message
            }
          } finally {
            this.submitLoading = false
          }

          this.resetForm()
          this.getTableData()
          this.$message({
            showClose: true,
            message: msg,
            type: 'success'
          })
        } else {
          this.$message({
            showClose: true,
            message: '表单校验失败',
            type: 'error'
          })
          return false
        }
      })
    },

    // 提交表单
    cancelForm() {
      this.resetForm()
    },

    resetForm() {
      this.dialogFormVisible = false
      this.$refs['dialogForm'].resetFields()
      this.dialogFormData = {
        apiId:undefined,
        path: '',
        handle:'',
        category: '',
        method: '',
        permission:'',
        title: ''
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
        const apiIds = []
        this.multipleSelection.forEach(x => {
          apiIds.push(x.apiId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteApiByIds({ apiIds: apiIds })
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

   // method字典翻译
    methodFormat(row, column) {
      return this.selectDictLabel(this.methodOptions, row.method);
    },
    // 单个删除
    async singleDelete(Id) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeleteApiByIds({ apiIds: [Id] })
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
