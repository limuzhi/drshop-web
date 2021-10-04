<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="参数名称">
          <el-input v-model.trim="params.configName" clearable placeholder="请输入参数名称" @clear="search" />
        </el-form-item>
        <el-form-item label="参数键名">
          <el-input v-model.trim="params.configKey" clearable placeholder="请输入参数键名" @clear="search" />
        </el-form-item>
        <el-form-item label="内置"> 
          <el-select v-model.trim="params.configType" clearable placeholder="系统内置" @change="search" @clear="search">
            <el-option
              v-for="dict in typeOptions"
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
          <el-button  v-permisaction="['systeam:config:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:config:delete']" :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column  prop="configName" label="参数名称" align="center"/> 
        <el-table-column  prop="configKey" label="参数键名" align="center"/>
        <el-table-column  prop="configValue" label="参数键值" align="center"/> 
        <el-table-column label="内置"  prop="configType" align="center"  :formatter="typeFormat" width="80" />
        <el-table-column label="前台显示"  prop="isFrontend" align="center"  :formatter="typeFormat" width="80" />
        <el-table-column  prop="remark" label="备注" />
        <el-table-column label="创建时间"   prop="createdAt" width="160" /> 
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:config:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.configId)">
                <el-button  v-permisaction="['systeam:config:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
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
          <el-form-item label="参数名称" prop="configName">
            <el-input v-model.trim="dialogFormData.configName" placeholder="请输入参数名称" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="参数键名" prop="configKey">
            <el-input v-model.trim="dialogFormData.configKey" placeholder="请输入参数键名" :disabled="isEdit" />
          </el-form-item> 
          <el-form-item label="参数键值" prop="configValue">
            <el-input v-model.trim="dialogFormData.configValue" placeholder="请输入参数键值"  />
          </el-form-item>
          <el-form-item label="系统内置" prop="configType">
              <el-radio-group v-model="dialogFormData.configType">
                <el-radio
                  v-for="dict in typeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="前台显示" prop="isFrontend"> 
              <el-radio-group v-model="dialogFormData.isFrontend">
                <el-radio
                  v-for="dict in typeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item> 
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="dialogFormData.remark" type="textarea" placeholder="请输入内容" show-word-limit maxlength="100" />
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
import { getConfigList, createConfig, updateConfig, batchDeleteConfig } from '@/api/system/config/params'

export default {
  name: 'Params', 
  data() {
    return {
      // 查询参数
      params: {
        configName: undefined,
        configKey: undefined,
        configType: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      isEdit: false,
      // 系统内置（1是 2否）
      typeOptions: [],
      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        configId:undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined, 
        configType: '1',
        isFrontend: '2',
        remark: undefined
      },
      dialogFormRules: {
        postName: [
          { required: true, message: '岗位名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        postCode: [
          { required: true, message: '岗位编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        postSort: [
          { required: true, message: '岗位顺序不能为空', trigger: 'change' }
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

     this.getDicts('sys_yes_no').then(response => {
      this.typeOptions = response.data
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
        const { data } = await getConfigList(this.params)
        console.log(data)
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
      this.isEdit = false
    },

    // 修改
    update(row) {
      this.dialogFormData.configId = row.configId
      this.dialogFormData.configName = row.configName
      this.dialogFormData.configKey = row.configKey
      this.dialogFormData.configValue = row.configValue
      this.dialogFormData.configType = "" + row.configType 
      this.dialogFormData.isFrontend = "" + row.isFrontend 
      this.dialogFormData.remark =  row.remark

      this.dialogFormTitle = '修改接口'
      this.dialogType = 'update'
      this.dialogFormVisible = true
      this.isEdit = true
    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          let msg = ''
          this.submitLoading = true

          this.dialogFormData.configType = this.dialogFormData.configType+'' 
          this.dialogFormData.isFrontend = this.dialogFormData.isFrontend+''
          try {
            if (this.dialogType === 'create') {
              const { message } = await createConfig(this.dialogFormData)
              msg = message
            } else {
              const { message } = await updateConfig(this.dialogFormData)
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
        configId:undefined,
        configName: undefined,
        configKey: undefined,
        configValue: undefined, 
        configType: '1',
        isFrontend: '1',
        remark: undefined
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
        const ids = []
        this.multipleSelection.forEach(x => {
          ids.push(x.configId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteConfig({ configIds: ids })
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

    // 参数系统内置字典翻译
    typeFormat(row, column) {
      return this.selectDictLabel(this.typeOptions, row.configType)
    },
    // 单个删除
    async singleDelete(Id) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeleteConfig({ configIds: [Id] })
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
